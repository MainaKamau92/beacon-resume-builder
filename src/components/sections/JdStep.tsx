"use client";

import { useState } from "react";
import { activeVersionSelector, useAppStore } from "@/lib/store";
import { sampleJd } from "@/lib/sample";
import { createTailoredVersion } from "@/lib/version";

/**
 * Optional step right after import: paste a job description now so the whole
 * flow (template, editor, tailoring) is aimed at a real job — or skip and
 * just build a general resume.
 */
export function JdStep({ onContinue }: { onContinue: () => void }) {
  const resume = useAppStore((s) => s.resume);
  const version = useAppStore(activeVersionSelector);
  const upsertVersion = useAppStore((s) => s.upsertVersion);
  const setActiveVersion = useAppStore((s) => s.setActiveVersion);

  const [jdText, setJdText] = useState(version?.jdText ?? "");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function analyzeAndContinue() {
    const text = jdText.trim();
    if (!text) {
      onContinue();
      return;
    }
    setBusy(true);
    setFailed(false);
    try {
      const v = await createTailoredVersion(resume, text, version);
      upsertVersion(v);
      onContinue();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  function skip() {
    setActiveVersion(null);
    onContinue();
  }

  return (
    <div className="flex flex-1 items-start justify-center bg-page px-6 pb-16 pt-14">
      <div className="w-full max-w-[640px]">
        <div className="mb-7 text-center">
          <h2 className="mb-1.5 text-[30px] font-bold tracking-[-.01em] text-ink">
            Have a job in mind?
          </h2>
          <p className="text-[15px] leading-normal text-muted">
            Paste the job description and we&rsquo;ll tailor everything to it —
            match score, keywords, suggested edits. You can also add one later.
          </p>
        </div>

        <div className="rounded-[14px] border border-line bg-white p-6">
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-[14px] font-semibold text-ink">
              Job description
            </div>
            {!jdText && (
              <button
                type="button"
                onClick={() => setJdText(sampleJd)}
                className="text-[12px] font-semibold text-primary hover:text-primary-hover"
              >
                Paste a sample JD
              </button>
            )}
          </div>
          <textarea
            rows={8}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job posting here — we'll pull out the keywords the filter scans for."
            className="w-full resize-none rounded-[10px] border border-input bg-white px-[15px] py-[13px] text-[13px] leading-[1.55] text-body placeholder:text-ghost focus:border-primary focus:outline-none"
          />
          {failed && (
            <div className="mt-2 rounded-lg border border-danger-border bg-danger-bg px-3 py-1.5 text-[12.5px] font-medium text-danger">
              We couldn&rsquo;t analyze that posting. Try again, or continue
              without it.
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={skip}
              className="text-[13px] font-medium text-muted hover:text-ink"
            >
              Skip for now — just build my resume
            </button>
            <button
              type="button"
              onClick={analyzeAndContinue}
              disabled={busy}
              className="flex items-center gap-2 rounded-[9px] bg-primary px-6 py-2.5 text-[14px] font-semibold text-white shadow-cta transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {busy && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {busy
                ? "Reading the posting…"
                : jdText.trim()
                  ? "Tailor to this job →"
                  : "Continue →"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-[12.5px] text-ghost">
          We only use the posting to score and reword what&rsquo;s already in
          your resume — never to invent experience.
        </div>
      </div>
    </div>
  );
}
