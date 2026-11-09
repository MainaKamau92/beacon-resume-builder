import type { KeywordResult, Resume, SuggestedEdit, Version } from "./types";

export function suggestFilename(resume: Resume, jobTitle: string): string {
  const name = (resume.contact.name || "My").trim().replace(/\s+/g, "-");
  const job = jobTitle
    .replace(/[^\w\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join("-");
  return `${name}-Resume-${job || "Tailored"}`;
}

/**
 * Calls the tailoring endpoint and folds the response into a Version,
 * preserving identity/status/filename when re-analyzing an existing one.
 */
export async function createTailoredVersion(
  resume: Resume,
  jdText: string,
  existing: Version | null,
): Promise<Version> {
  const res = await fetch("/api/tailor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jdText, resume }),
  });
  if (!res.ok) throw new Error(`tailor failed: ${res.status}`);
  const data = (await res.json()) as {
    jobTitle: string;
    keywords: KeywordResult[];
    score: number;
    suggestedEdits: SuggestedEdit[];
  };
  return {
    id: existing?.id ?? `v-${Date.now()}`,
    jobTitle: data.jobTitle,
    jdText,
    keywords: data.keywords,
    score: data.score,
    suggestedEdits: data.suggestedEdits,
    status: existing?.status ?? "draft",
    filename: existing?.filename ?? suggestFilename(resume, data.jobTitle),
    editedAt: Date.now(),
  };
}
