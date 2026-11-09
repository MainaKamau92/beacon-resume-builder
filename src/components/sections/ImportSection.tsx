"use client";

import { useRef, useState } from "react";
import { AiIcon, Toggle } from "@/components/chrome";
import { useAppStore } from "@/lib/store";
import type { ExtractionResult } from "@/lib/types";

type UploadState = "idle" | "extracting" | "done" | "error";

function FormatChip({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-line bg-[#fbfcfe] px-2.5 py-[5px] font-mono text-[11px] font-medium text-ghost">
      {label}
    </div>
  );
}

function SectionCard({
  ok,
  label,
  summary,
}: {
  ok: boolean;
  label: string;
  summary: string;
}) {
  return (
    <div
      className={`rounded-[10px] border px-3.5 py-3 ${
        ok
          ? "border-success-border bg-success-bg3"
          : "border-warn-border2 bg-warn-bg2"
      }`}
    >
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
        <span className={ok ? "text-success" : "text-warn"}>
          {ok ? "✓" : "!"}
        </span>
        {label}
      </div>
      <div className="mt-[3px] text-[11.5px] text-muted">{summary}</div>
    </div>
  );
}

const FILE_ICONS: Record<string, { label: string; cls: string }> = {
  pdf: { label: "PDF", cls: "border-[#f4cfcf] bg-[#fdecec] text-[#c0392b]" },
  docx: { label: "DOC", cls: "border-[#c9d8f0] bg-[#e8effc] text-[#2b5797]" },
  txt: { label: "TXT", cls: "border-line bg-[#f1f4f8] text-muted" },
};

export function ImportStep({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const extraction = useAppStore((s) => s.extraction);
  const aiOn = useAppStore((s) => s.aiRefinementEnabled);
  const setAi = useAppStore((s) => s.setAiRefinement);
  const setExtraction = useAppStore((s) => s.setExtraction);
  const adoptExtraction = useAppStore((s) => s.adoptExtraction);
  const startBlank = useAppStore((s) => s.startBlank);

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("That file is over 10 MB — try a smaller export.");
      setState("error");
      return;
    }
    setState("extracting");
    setErrorMsg(null);
    setExtraction(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("refine", String(aiOn));
      const res = await fetch("/api/extract", { method: "POST", body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setErrorMsg(body?.error ?? "Something went wrong reading that file.");
        setState("error");
        return;
      }
      const result = (await res.json()) as ExtractionResult;
      setExtraction(result);
      setState("done");
    } catch {
      setErrorMsg("Something went wrong reading that file.");
      setState("error");
    }
  }

  function beginBlank() {
    startBlank();
    onContinue();
  }

  // pull the parsed resume into the store, then move on to pick a template
  function adoptAndContinue() {
    adoptExtraction();
    onContinue();
  }

  const showResult = state === "done" && extraction;

  return (
    <div className="flex-1 bg-page">
      {/* No top-right "skip" action — the "Start from scratch" card below is
          the single, clearer entry point for beginning blank. */}
      <div className="px-14 pb-[54px] pt-12">
        <div className="mb-[34px] text-center">
          <h2 className="mb-1.5 text-[30px] font-bold tracking-[-.01em] text-ink">
            Already have a resume? Bring it in.
          </h2>
          <p className="text-[15px] text-muted">
            We&rsquo;ll read it, pull out every section, and drop it straight
            into a modern template. Nothing to retype.
          </p>
        </div>

        <div className="grid items-stretch gap-7 lg:grid-cols-[1.15fr_1fr]">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInput.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed bg-white px-10 py-[38px] text-center transition-colors ${
              dragOver ? "border-primary-hover bg-suggest" : "border-primary"
            }`}
          >
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="absolute right-[18px] top-4 rounded-full bg-tint px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[.04em] text-primary">
              Recommended
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-[14px] bg-tint text-[26px] text-primary">
              ↑
            </div>
            <div className="mt-4 text-[18px] font-semibold text-ink">
              {state === "extracting"
                ? "Reading your resume…"
                : "Drag & drop your resume"}
            </div>
            <div className="mt-1.5 max-w-[320px] text-[13.5px] leading-normal text-muted">
              PDF, Word (.docx) or plain text — up to 10 MB. Or{" "}
              <span className="font-semibold text-primary">browse files</span>.
            </div>
            {state === "error" && (
              <div className="mt-3 max-w-[340px] rounded-lg border border-danger-border bg-danger-bg px-3 py-1.5 text-[12.5px] font-medium text-danger">
                {errorMsg ??
                  "We couldn't read that file. Try a different format, or start from scratch."}
              </div>
            )}
            <div className="mt-[18px] flex gap-2">
              <FormatChip label="PDF" />
              <FormatChip label="DOCX" />
              <FormatChip label="TXT" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={beginBlank}
              className="flex flex-1 flex-col justify-center rounded-[14px] border border-line bg-white px-6 py-[22px] text-left"
            >
              <div className="text-[15px] font-semibold text-ink">
                Start from scratch
              </div>
              <div className="mt-[5px] text-[13px] leading-normal text-muted">
                No resume yet? We&rsquo;ll guide you field by field with
                examples for first-timers.
              </div>
              <div className="mt-3 text-[13px] font-semibold text-primary">
                Begin blank →
              </div>
            </button>
          </div>
        </div>

        {(showResult || state === "extracting") && (
          <div className="mt-6 rounded-[14px] border border-line bg-white px-7 py-6">
            {state === "extracting" ? (
              <div className="flex items-center gap-3 text-[13.5px] font-medium text-muted">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary" />
                Extracting sections…
              </div>
            ) : (
              showResult && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const ext =
                          extraction.filename.split(".").pop()?.toLowerCase() ??
                          "";
                        const icon = FILE_ICONS[ext] ?? FILE_ICONS.txt;
                        return (
                          <div
                            className={`grid h-11 w-9 place-items-center rounded-[5px] border font-mono text-[9px] font-bold ${icon.cls}`}
                          >
                            {icon.label}
                          </div>
                        );
                      })()}
                      <div>
                        <div className="text-[14px] font-semibold text-ink">
                          {extraction.filename}
                        </div>
                        <div className="mt-px text-[12px] text-muted">
                          Extracted in {extraction.seconds}s ·{" "}
                          {extraction.sections.length} sections found
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-success-bg px-3 py-1.5 text-[12.5px] font-semibold text-success">
                      <div className="h-[7px] w-[7px] rounded-full bg-success" />
                      Extraction complete
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {extraction.sections.map((sec) => (
                      <SectionCard
                        key={sec.key}
                        ok={sec.confidence === "ok"}
                        label={sec.label}
                        summary={sec.summary}
                      />
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-[11px] border border-suggest-border bg-suggest px-[18px] py-3.5">
                    <div className="flex items-center gap-3">
                      <AiIcon size={34} />
                      <div>
                        <div className="text-[13.5px] font-semibold text-ink">
                          Let AI clean up the imported text
                        </div>
                        <div className="mt-px text-[12px] leading-snug text-muted">
                          Fix formatting, strengthen weak verbs, and
                          standardize dates as it fills the template.
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-2.5">
                      <div className="text-[12px] font-semibold text-primary">
                        {aiOn ? "On" : "Off"}
                      </div>
                      <Toggle on={aiOn} onChange={setAi} />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={adoptAndContinue}
                      className="rounded-[9px] bg-primary px-7 py-3 text-[15px] font-semibold text-white shadow-cta transition-colors hover:bg-primary-hover"
                    >
                      Continue →
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
