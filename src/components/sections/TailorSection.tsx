"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MatchRing, StepActions } from "@/components/chrome";
import { ResumePreview } from "@/components/ResumePreview";
import { FitWidth } from "@/components/FitWidth";
import { activeVersionSelector, useAppStore } from "@/lib/store";
import { sampleJd } from "@/lib/sample";
import { applyEditsToResume } from "@/lib/tailor";
import { createTailoredVersion } from "@/lib/version";
import type { KeywordResult, Resume } from "@/lib/types";

function relevanceOrdered(resume: Resume, keywords: KeywordResult[]): Resume {
  const terms = keywords.map((k) => k.term.toLowerCase());
  const hits = (text: string) =>
    terms.filter((t) => text.toLowerCase().includes(t)).length;
  return {
    ...resume,
    experience: [...resume.experience].sort(
      (a, b) =>
        hits(`${b.title} ${b.org} ${b.bullets.join(" ")}`) -
        hits(`${a.title} ${a.org} ${a.bullets.join(" ")}`),
    ),
  };
}

function scoreHeadline(score: number, fixes: number): string {
  if (score >= 85) return "Strong match — ready to send";
  if (score >= 55)
    return `Good match — ${fixes} quick ${fixes === 1 ? "fix" : "fixes"}`;
  return `Needs work — ${fixes} ${fixes === 1 ? "fix" : "fixes"} to start`;
}

export function TailorStep({ onContinue }: { onContinue: () => void }) {
  const resume = useAppStore((s) => s.resume);
  const template = useAppStore((s) => s.selectedTemplate);
  const version = useAppStore(activeVersionSelector);
  const upsertVersion = useAppStore((s) => s.upsertVersion);
  const setEditState = useAppStore((s) => s.setEditState);

  const [jdText, setJdText] = useState(version?.jdText ?? "");
  const [analyzing, setAnalyzing] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync the textarea when a different version is opened from the
  // dashboard (the section stays mounted on the single-page flow).
  const versionId = version?.id ?? null;
  useEffect(() => {
    setJdText(
      useAppStore
        .getState()
        .versions.find((v) => v.id === versionId)?.jdText ?? "",
    );
  }, [versionId]);

  async function analyze(text: string) {
    setAnalyzing(true);
    try {
      upsertVersion(await createTailoredVersion(resume, text, version));
    } catch {
      // leave the previous state; the user can retry by editing the JD
    } finally {
      setAnalyzing(false);
    }
  }

  function onJdChange(text: string) {
    setJdText(text);
    if (debounce.current) clearTimeout(debounce.current);
    if (text.trim().length > 40 && text !== version?.jdText) {
      debounce.current = setTimeout(() => analyze(text), 900);
    }
  }

  const tailored = useMemo(
    () => (version ? applyEditsToResume(resume, version) : resume),
    [resume, version],
  );
  const presentTerms = useMemo(
    () =>
      version
        ? version.keywords.filter((k) => k.present).map((k) => k.term)
        : [],
    [version],
  );
  const previewResume = useMemo(
    () =>
      version ? relevanceOrdered(tailored, version.keywords) : tailored,
    [tailored, version],
  );

  const pendingEdits =
    version?.suggestedEdits.filter((e) => e.state === "pending") ?? [];

  return (
    <div className="flex flex-1 flex-col bg-page">
      <StepActions>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {version ? "Continue to export →" : "Continue without a job →"}
        </button>
      </StepActions>
      <div className="grid flex-1 lg:grid-cols-[460px_1fr]">
        <div className="flex min-w-0 flex-col gap-[18px] border-r border-line bg-white px-7 py-[26px]">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <div className="text-[14px] font-semibold text-ink">
                Job description
              </div>
              {!jdText && (
                <button
                  type="button"
                  onClick={() => onJdChange(sampleJd)}
                  className="text-[12px] font-semibold text-primary hover:text-primary-hover"
                >
                  Paste a sample JD
                </button>
              )}
            </div>
            <textarea
              rows={5}
              value={jdText}
              onChange={(e) => onJdChange(e.target.value)}
              placeholder="Paste the job posting here — we'll pull out the keywords the filter scans for."
              className="w-full resize-none rounded-[10px] border border-input bg-white px-[15px] py-[13px] text-[12.5px] leading-[1.55] text-body placeholder:text-ghost focus:border-primary focus:outline-none"
            />
          </div>

          {analyzing && (
            <div className="flex items-center gap-3 rounded-xl border border-line bg-page px-5 py-[18px] text-[13.5px] font-medium text-muted">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary" />
              Scoring your resume against this job…
            </div>
          )}

          {version && !analyzing && (
            <>
              <div className="flex items-center gap-5 rounded-xl border border-line bg-page px-5 py-[18px]">
                <MatchRing score={version.score} size={84} thickness={10}>
                  <div className="text-[22px] font-bold text-ink">
                    {version.score}
                    <span className="text-[12px] text-muted">%</span>
                  </div>
                </MatchRing>
                <div>
                  <div className="text-[15px] font-semibold text-ink">
                    {scoreHeadline(version.score, pendingEdits.length)}
                  </div>
                  <div className="mt-[3px] text-[12.5px] leading-normal text-muted">
                    {pendingEdits.length > 0 ? (
                      <>
                        Apply the suggestions below to reach{" "}
                        <span className="font-semibold text-success">90%+</span>{" "}
                        before you submit.
                      </>
                    ) : (
                      "Every keyword the filter scans for is covered."
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2.5 text-[13px] font-semibold text-ink">
                  {version.keywords.some((k) => !k.present)
                    ? "Missing keywords the filter looks for"
                    : "Keywords the filter scans for"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...version.keywords]
                    .sort((a, b) => Number(a.present) - Number(b.present))
                    .map((k) => (
                      <div
                        key={k.term}
                        className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                          k.present
                            ? "border-success-border bg-success-bg2 text-success"
                            : "border-danger-border bg-danger-bg text-danger"
                        }`}
                      >
                        {k.present ? `✓ ${k.term}` : k.term}
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="text-[13px] font-semibold text-ink">
                  Suggested edits
                </div>
                {version.suggestedEdits.filter((e) => e.state !== "skipped")
                  .length === 0 && (
                  <div className="text-[12.5px] text-muted">
                    Nothing to fix — this resume already covers the posting.
                  </div>
                )}
                {version.suggestedEdits.map((edit) => {
                  if (edit.state === "skipped") return null;
                  const applied = edit.state === "applied";
                  return (
                    <div
                      key={edit.id}
                      className={`rounded-[11px] border px-4 py-3.5 ${
                        applied
                          ? "border-success-border bg-success-bg3"
                          : "border-suggest-border bg-[#fbfcff]"
                      }`}
                    >
                      <div className="mb-[7px] text-[12px] font-semibold uppercase tracking-[.04em] text-primary">
                        {edit.sectionLabel}
                      </div>
                      {edit.oldText && !applied && (
                        <div className="text-[12.5px] leading-normal text-ghost line-through">
                          {edit.oldText}
                        </div>
                      )}
                      <div className="mt-1 text-[12.5px] leading-normal text-ink">
                        {edit.newText.split(new RegExp(`(${edit.keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi")).map((part, i) =>
                          edit.keywords.some(
                            (k) => k.toLowerCase() === part.toLowerCase(),
                          ) ? (
                            <span
                              key={i}
                              className="rounded-[3px] bg-jdhl px-[3px] font-semibold"
                            >
                              {part}
                            </span>
                          ) : (
                            part
                          ),
                        )}
                      </div>
                      <div className="mt-[11px] flex gap-3.5 text-[12.5px] font-semibold">
                        {applied ? (
                          <div className="text-success">Applied ✓</div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setEditState(version.id, edit.id, "applied")
                              }
                              className="text-primary hover:text-primary-hover"
                            >
                              Apply edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditState(version.id, edit.id, "skipped")
                              }
                              className="text-ghost hover:text-muted"
                            >
                              Skip
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex min-w-0 items-start justify-center px-4 py-8 sm:px-11">
          <FitWidth max={560}>
            {(w) => (
              <ResumePreview
                resume={previewResume}
                template={template}
                keywordTerms={presentTerms}
                width={w}
              >
                {version && (
                  <div className="absolute right-3.5 top-3.5 z-10 rounded-full bg-success-bg px-[11px] py-[5px] text-[11px] font-semibold text-success">
                    Tailored for: {version.jobTitle}
                  </div>
                )}
              </ResumePreview>
            )}
          </FitWidth>
        </div>
      </div>
    </div>
  );
}
