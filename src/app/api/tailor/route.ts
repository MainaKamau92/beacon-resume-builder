import { NextResponse } from "next/server";
import { metric } from "@/lib/metric";
import {
  aiEnabled,
  aiJson,
  clampArray,
  hasNovelUrl,
  sanitizeText,
  UNTRUSTED_DATA_RULES,
} from "@/lib/ai";
import type { KeywordResult, Resume, SuggestedEdit } from "@/lib/types";
import {
  buildSuggestedEdits,
  computeScore,
  extractJobTitle,
  parseKeywords,
} from "@/lib/tailor";

/**
 * JD-tailoring endpoint. Keyword detection and match scoring stay
 * deterministic (free, instant, and consistent with client-side rescoring).
 * With an API key, the suggested edits come from a nano model that rewords
 * existing bullets to weave in missing keywords — honesty guardrail: a
 * keyword may only be woven into a bullet whose text already plausibly
 * involves it; everything else goes to a "add to skills" suggestion.
 */

interface AiTailor {
  edits: {
    experienceId: string;
    bulletIndex: number;
    newText: string;
    keywords: string[];
  }[];
  addSkills: string[];
}

const TAILOR_SCHEMA = {
  type: "object",
  properties: {
    edits: {
      type: "array",
      items: {
        type: "object",
        properties: {
          experienceId: { type: "string" },
          bulletIndex: { type: "integer" },
          newText: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
        },
        required: ["experienceId", "bulletIndex", "newText", "keywords"],
        additionalProperties: false,
      },
    },
    addSkills: { type: "array", items: { type: "string" } },
  },
  required: ["edits", "addSkills"],
  additionalProperties: false,
};

async function aiSuggestedEdits(
  jdText: string,
  resume: Resume,
  missing: string[],
): Promise<SuggestedEdit[] | null> {
  const jd = sanitizeText(jdText, 5000);
  const bullets = resume.experience.flatMap((e) =>
    e.bullets
      .map((text, index) => ({
        experienceId: e.id,
        bulletIndex: index,
        role: `${e.title} @ ${e.org}`,
        text: sanitizeText(text, 300),
      }))
      .filter((b) => b.text),
  );
  if (bullets.length === 0) return null;

  const ai = await aiJson<AiTailor>({
    schemaName: "tailor_edits",
    schema: TAILOR_SCHEMA,
    maxTokens: 700,
    system: [
      "You tailor a resume to a job description.",
      UNTRUSTED_DATA_RULES,
      `Missing keywords to cover: ${missing.join(", ")}.`,
      "Choose at most 2 bullets and reword each to naturally weave in missing keywords.",
      "HONESTY RULE: only weave a keyword into a bullet whose existing text already plausibly involves that tool or practice. Never invent metrics, tools, or achievements. Keep each rewrite under 30 words.",
      "Keywords you cannot honestly weave into any bullet go in addSkills instead.",
      "Reference bullets by their experienceId and bulletIndex exactly as given.",
    ].join("\n"),
    user: `<data>\nJOB DESCRIPTION:\n${jd}\n\nRESUME BULLETS:\n${JSON.stringify(bullets.slice(0, 25))}\n</data>`,
  });
  if (!ai) return null;

  const missingLower = new Set(missing.map((k) => k.toLowerCase()));
  const canon = (k: string) =>
    missing.find((m) => m.toLowerCase() === k.toLowerCase());
  const edits: SuggestedEdit[] = [];

  for (const edit of clampArray<AiTailor["edits"][number]>(ai.edits, 3)) {
    const exp = resume.experience.find((e) => e.id === edit?.experienceId);
    const oldText =
      exp && Number.isInteger(edit.bulletIndex)
        ? exp.bullets[edit.bulletIndex]
        : undefined;
    const newText = sanitizeText(edit?.newText, 350);
    const keywords = clampArray<string>(edit?.keywords, 4)
      .filter((k) => typeof k === "string" && missingLower.has(k.toLowerCase()))
      .map((k) => canon(k)!);
    if (!exp || !oldText || !newText || keywords.length === 0) continue;
    if (hasNovelUrl(newText, `${jd} ${oldText}`)) continue;
    edits.push({
      id: `edit-${exp.id}-${edit.bulletIndex}`,
      kind: "bullet",
      sectionLabel: exp.org || exp.title,
      targetExperienceId: exp.id,
      targetBulletIndex: edit.bulletIndex,
      oldText,
      newText,
      keywords,
      state: "pending",
    });
  }

  const covered = new Set(
    edits.flatMap((e) => e.keywords.map((k) => k.toLowerCase())),
  );
  const addSkills = clampArray<string>(ai.addSkills, 6)
    .filter(
      (k) =>
        typeof k === "string" &&
        missingLower.has(k.toLowerCase()) &&
        !covered.has(k.toLowerCase()),
    )
    .map((k) => canon(k)!);
  if (addSkills.length > 0) {
    edits.push({
      id: "edit-skills",
      kind: "skill",
      sectionLabel: "Skills section",
      newText: `Add ${addSkills.join(", ")} to your skills list — mention tools you actually used.`,
      keywords: addSkills,
      state: "pending",
    });
  }
  return edits.length > 0 ? edits : null;
}

export async function POST(request: Request) {
  const { jdText, resume } = (await request.json()) as {
    jdText: string;
    resume: Resume;
  };

  if (!jdText?.trim()) {
    return NextResponse.json({ error: "Empty job description" }, { status: 400 });
  }

  const keywords: KeywordResult[] = parseKeywords(jdText, resume);
  const missing = keywords.filter((k) => !k.present).map((k) => k.term);

  let suggestedEdits: SuggestedEdit[] | null = null;
  if (missing.length > 0 && aiEnabled()) {
    suggestedEdits = await aiSuggestedEdits(jdText, resume, missing);
  }
  suggestedEdits ??= buildSuggestedEdits(resume, keywords);

  metric("tailor-ok", {
    keywords: keywords.length,
    missing: missing.length,
    score: computeScore(keywords),
  });
  return NextResponse.json({
    jobTitle: extractJobTitle(jdText),
    keywords,
    score: computeScore(keywords),
    suggestedEdits,
  });
}
