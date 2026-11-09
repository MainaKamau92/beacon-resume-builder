import {
  aiEnabled,
  aiJson,
  clampArray,
  hasNovelUrl,
  sanitizeText,
  UNTRUSTED_DATA_RULES,
} from "./ai";
import type { ExtractionResult } from "./types";

/**
 * AI recovery pass for extraction. Runs only when the rule engine reports
 * low-confidence sections (clean resumes never pay for a call), asks only
 * for those sections, and merges the answer field-by-field with clamps.
 */

interface AiResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: { school: string; degree: string; date: string; details: string }[];
  experience: { title: string; org: string; date: string; bullets: string[] }[];
  skills: string[];
}

const STR = { type: "string" } as const;
const RESUME_SCHEMA = {
  type: "object",
  properties: {
    name: STR,
    email: STR,
    phone: STR,
    location: STR,
    summary: STR,
    education: {
      type: "array",
      items: {
        type: "object",
        properties: { school: STR, degree: STR, date: STR, details: STR },
        required: ["school", "degree", "date", "details"],
        additionalProperties: false,
      },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: STR,
          org: STR,
          date: STR,
          bullets: { type: "array", items: STR },
        },
        required: ["title", "org", "date", "bullets"],
        additionalProperties: false,
      },
    },
    skills: { type: "array", items: STR },
  },
  required: [
    "name", "email", "phone", "location", "summary",
    "education", "experience", "skills",
  ],
  additionalProperties: false,
};

export async function recoverWithAi(
  result: ExtractionResult,
  refine: boolean,
): Promise<ExtractionResult> {
  const warnings = result.sections
    .filter((s) => s.confidence === "warning")
    .map((s) => s.key)
    .filter((key) =>
      // a skills warning caused only by the hobby split is already handled
      // well deterministically — don't pay for a call that adds nothing
      key === "skills"
        ? result.skillReview.ambiguous.length > 0 ||
          result.skillReview.keep.length === 0
        : true,
    );
  if (!refine || !aiEnabled() || warnings.length === 0) return result;

  const raw = sanitizeText(result.raw, 12000);
  const ai = await aiJson<AiResume>({
    schemaName: "resume_sections",
    schema: RESUME_SCHEMA,
    maxTokens: 3000,
    system: [
      "You extract structured resume data from raw resume text.",
      UNTRUSTED_DATA_RULES,
      `Only extract these sections: ${warnings.join(", ")}. For every other field return "" or [].`,
      "Copy wording from the text — never invent employers, dates, numbers, or skills that are not present.",
      "skills means professional skills and tools only; exclude hobbies and interests.",
    ].join("\n"),
    user: `<data>\n${raw}\n</data>`,
  });
  if (!ai) return result;

  const clip = (v: unknown, max: number) => {
    const s = sanitizeText(v, max);
    return hasNovelUrl(s, raw) ? "" : s;
  };
  const recovered: string[] = [];
  const { resume } = result;

  if (warnings.includes("contact")) {
    const next = {
      name: resume.contact.name || clip(ai.name, 80),
      email:
        resume.contact.email ||
        (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(clip(ai.email, 120))
          ? clip(ai.email, 120)
          : ""),
      phone: resume.contact.phone || clip(ai.phone, 40),
      location: resume.contact.location || clip(ai.location, 80),
      linkedin: resume.contact.linkedin,
    };
    if (JSON.stringify(next) !== JSON.stringify(resume.contact)) {
      resume.contact = next;
      recovered.push("contact");
    }
  }

  if (warnings.includes("education")) {
    const items = clampArray<AiResume["education"][number]>(ai.education, 8)
      .map((e, i) => ({
        id: `ai-edu-${i + 1}`,
        school: clip(e?.school, 120),
        degree: clip(e?.degree, 120),
        date: clip(e?.date, 40),
        details: clip(e?.details, 300),
      }))
      .filter((e) => e.school || e.degree);
    if (items.length > 0 && resume.education.length === 0) {
      resume.education = items;
      recovered.push("education");
    }
  }

  if (warnings.includes("experience")) {
    const items = clampArray<AiResume["experience"][number]>(ai.experience, 12)
      .map((e, i) => ({
        id: `ai-exp-${i + 1}`,
        title: clip(e?.title, 120),
        org: clip(e?.org, 120),
        date: clip(e?.date, 60),
        bullets: clampArray<string>(e?.bullets, 12)
          .map((b) => clip(b, 350))
          .filter(Boolean),
      }))
      .filter((e) => e.title || e.org || e.bullets.length > 0);
    const betterThanCurrent =
      items.reduce((n, e) => n + e.bullets.length, 0) >
      resume.experience.reduce((n, e) => n + e.bullets.length, 0);
    if (items.length > 0 && betterThanCurrent) {
      resume.experience = items;
      recovered.push("experience");
    }
  }

  if (warnings.includes("skills")) {
    // merge, never replace: the deterministic keep list has canonical
    // casing — AI only vouches for ambiguous tokens and adds missed ones
    // "NodeJS" and "Node.js" are the same skill — compare without punctuation
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");
    const dropSet = new Set(result.skillReview.drop.map(norm));
    const merged = [...result.skillReview.keep];
    const seen = new Set(merged.map(norm));
    let added = false;
    for (const rawSkill of clampArray<string>(ai.skills, 30)) {
      const s = clip(rawSkill, 40);
      if (!s || /[:：]$/.test(s)) continue; // category label lines
      const key = norm(s);
      if (!key || seen.has(key) || dropSet.has(key)) continue;
      merged.push(s);
      seen.add(key);
      added = true;
    }
    const stillAmbiguous = result.skillReview.ambiguous.filter(
      (a) => !seen.has(norm(a)),
    );
    if (added || stillAmbiguous.length !== result.skillReview.ambiguous.length) {
      result.skillReview.keep = merged;
      result.skillReview.ambiguous = stillAmbiguous;
      resume.skills = merged.flatMap((s) => {
        const m = s.match(/^(.+?)\s*\((.+)\)$/);
        return m ? [m[1], m[2]] : [s];
      });
      recovered.push("skills");
    }
  }

  if (!resume.summary && ai.summary) {
    const s = clip(ai.summary, 600);
    if (s) resume.summary = s;
  }

  for (const key of recovered) {
    const section = result.sections.find((s) => s.key === key);
    if (!section) continue;
    section.confidence = "ok";
    section.summary = "Recovered with AI — double-check it";
  }
  if (recovered.length > 0) {
    result.aiNotes.push(
      `AI recovered the ${recovered.join(", ")} section${recovered.length > 1 ? "s" : ""} — worth a quick review.`,
    );
  }
  return result;
}
