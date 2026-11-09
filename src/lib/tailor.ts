import type {
  KeywordResult,
  Resume,
  SuggestedEdit,
  Version,
} from "./types";

/**
 * Mock JD parsing + tailoring. Deterministic keyword matching stands in for
 * the LLM call; the /api/tailor route is the seam where a real Claude call
 * slots in later.
 */

const KEYWORD_BANK: { term: string; aliases: string[] }[] = [
  { term: "Python", aliases: ["python"] },
  { term: "JavaScript", aliases: ["javascript", "js"] },
  { term: "TypeScript", aliases: ["typescript"] },
  { term: "React", aliases: ["react"] },
  { term: "SQL", aliases: ["sql", "postgresql", "mysql"] },
  { term: "Git", aliases: ["git"] },
  { term: "REST APIs", aliases: ["rest api", "rest apis", "restful"] },
  { term: "Agile", aliases: ["agile", "scrum", "sprint"] },
  { term: "CI/CD", aliases: ["ci/cd", "cicd", "continuous integration"] },
  { term: "AWS", aliases: ["aws", "amazon web services"] },
  { term: "Docker", aliases: ["docker", "containers"] },
  { term: "Java", aliases: ["java "] },
  { term: "Figma", aliases: ["figma"] },
  { term: "Excel", aliases: ["excel", "spreadsheets"] },
  { term: "Communication", aliases: ["communication skills"] },
  { term: "Node.js", aliases: ["node.js", "nodejs", "node "] },
];

export function resumeToText(resume: Resume): string {
  return [
    Object.values(resume.contact).join(" "),
    resume.summary ?? "",
    ...resume.education.map((e) => `${e.school} ${e.degree} ${e.details}`),
    ...resume.experience.map(
      (e) => `${e.title} ${e.org} ${e.bullets.join(" ")}`,
    ),
    resume.skills.join(" "),
  ]
    .join("\n")
    .toLowerCase();
}

export function extractJobTitle(jdText: string): string {
  const firstLine = jdText.split("\n")[0].trim();
  const head = firstLine.split(/[.·|]/)[0].trim();
  return head.length > 60 ? `${head.slice(0, 57)}…` : head || "Untitled job";
}

// Word-boundary-aware match: an alias counts only as a standalone token, never
// a substring. The boundary is asymmetric: a leading "." is part of a tech
// name ("js" must not match inside "next.js"), but a trailing "." is almost
// always sentence punctuation ("…React/Next.js/TypeScript." must still match
// typescript). "/" is a separator on both sides — JDs list stacks as
// "React/Next.js/TypeScript" ("ci/cd" still matches; its slash sits inside
// the alias itself).
const TERM_BEFORE = "a-z0-9.+#";
const TERM_AFTER = "a-z0-9+#";
function containsTerm(haystack: string, alias: string): boolean {
  const needle = alias.trim();
  if (!needle) return false;
  const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![${TERM_BEFORE}])${esc}(?![${TERM_AFTER}])`).test(haystack);
}

export function parseKeywords(jdText: string, resume: Resume): KeywordResult[] {
  const jd = jdText.toLowerCase();
  const text = resumeToText(resume);
  return KEYWORD_BANK.filter(({ aliases }) =>
    aliases.some((a) => containsTerm(jd, a)),
  ).map(({ term, aliases }) => ({
    term,
    present:
      aliases.some((a) => containsTerm(text, a)) ||
      containsTerm(text, term.toLowerCase()),
  }));
}

export function computeScore(keywords: KeywordResult[]): number {
  if (keywords.length === 0) return 50;
  const present = keywords.filter((k) => k.present).length;
  // full coverage reads a clean 100%; partial coverage floors around 40.
  return Math.round(40 + 60 * (present / keywords.length));
}

/** Applies a version's applied edits to a copy of the master resume. */
export function applyEditsToResume(resume: Resume, version: Version): Resume {
  const tailored: Resume = structuredClone(resume);
  for (const edit of version.suggestedEdits) {
    if (edit.state !== "applied") continue;
    if (edit.kind === "bullet" && edit.targetExperienceId !== undefined) {
      const exp = tailored.experience.find(
        (e) => e.id === edit.targetExperienceId,
      );
      if (exp && edit.targetBulletIndex !== undefined) {
        exp.bullets[edit.targetBulletIndex] = edit.newText;
      }
    } else if (edit.kind === "skill") {
      for (const kw of edit.keywords) {
        if (!tailored.skills.some((s) => s.toLowerCase() === kw.toLowerCase())) {
          tailored.skills.push(kw);
        }
      }
    }
  }
  return tailored;
}

export function rescoreVersion(resume: Resume, version: Version): Version {
  const tailored = applyEditsToResume(resume, version);
  const keywords = parseKeywords(version.jdText, tailored);
  return { ...version, keywords, score: computeScore(keywords) };
}

function trimPeriod(s: string): string {
  return s.replace(/[.\s]+$/, "");
}

/** Natural-sounding fragment for weaving a keyword into an existing bullet. */
const KEYWORD_PHRASES: Record<string, string> = {
  Agile: "in agile sprint cycles",
  "CI/CD": "with a CI/CD pipeline",
  AWS: "deployed on AWS",
  "REST APIs": "exposing REST APIs",
  Docker: "containerized with Docker",
};

function keywordPhrase(term: string): string {
  return KEYWORD_PHRASES[term] ?? `using ${term}`;
}

/**
 * Generates mock suggested edits for the missing keywords. Canned rewrite for
 * the sample-data scenario; generic phrasing otherwise. A real implementation
 * asks the LLM to reword existing bullets (never invent experience).
 */
export function buildSuggestedEdits(
  resume: Resume,
  keywords: KeywordResult[],
): SuggestedEdit[] {
  const missing = keywords.filter((k) => !k.present).map((k) => k.term);
  if (missing.length === 0) return [];

  const edits: SuggestedEdit[] = [];
  const remaining = new Set(missing);

  // Prefer rewording a project bullet that already sits near the topic.
  const project =
    resume.experience.find((e) =>
      `${e.title} ${e.org}`.toLowerCase().includes("project"),
    ) ?? resume.experience[0];

  if (project) {
    // Prefer the bullet the canned rewrite targets, else the first non-empty one
    let bulletIdx = project.bullets.findIndex((b) =>
      b.includes("PostgreSQL schema and REST API"),
    );
    if (bulletIdx < 0) {
      bulletIdx = project.bullets.findIndex((b) => b.trim().length > 0);
    }
    if (bulletIdx >= 0) {
      const old = project.bullets[bulletIdx];
      const cannedCovers = ["REST APIs", "Agile"].filter((k) =>
        remaining.has(k),
      );
      const canned =
        old.includes("PostgreSQL schema and REST API") &&
        cannedCovers.length > 0;
      const kws = canned ? cannedCovers : [...remaining].slice(0, 2);
      const newText = canned
        ? "Designed the PostgreSQL schema and built REST APIs in an agile two-week sprint cycle"
        : `${trimPeriod(old)}, ${kws.map(keywordPhrase).join(" ")}`;
      edits.push({
        id: `edit-${project.id}-${bulletIdx}`,
        kind: "bullet",
        sectionLabel: `${project.org || project.title}`,
        targetExperienceId: project.id,
        targetBulletIndex: bulletIdx,
        oldText: old,
        newText,
        keywords: kws,
        state: "pending",
      });
      kws.forEach((k) => remaining.delete(k));
    }
  }

  if (remaining.size > 0) {
    const kws = [...remaining];
    edits.push({
      id: "edit-skills",
      kind: "skill",
      sectionLabel: "Skills section",
      newText: `Add ${kws.join(", ")} to your skills list — mention tools you actually used.`,
      keywords: kws,
      state: "pending",
    });
  }

  return edits;
}
