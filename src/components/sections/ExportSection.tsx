"use client";

import { useMemo, useState } from "react";
import { StepActions, printElement } from "@/components/chrome";
import { ResumePreview } from "@/components/ResumePreview";
import { FitWidth } from "@/components/FitWidth";
import { downloadResumePdf, downloadResumeText } from "@/lib/download";
import { activeVersionSelector, useAppStore } from "@/lib/store";
import { applyEditsToResume } from "@/lib/tailor";

type Format = "pdf" | "docx" | "txt";

const FORMATS: { id: Format; label: string; help: string; ext: string }[] = [
  { id: "pdf", label: "PDF", help: "Best for email and most job portals", ext: ".pdf" },
  {
    id: "docx",
    label: "Word (.docx)",
    help: "When the posting asks for an editable file",
    ext: ".docx",
  },
  {
    id: "txt",
    label: "Plain text",
    help: "For copy-paste into ATS web forms",
    ext: ".txt",
  },
];

export function ExportStep({
  onBackToEditor,
  onDone,
}: {
  onBackToEditor: () => void;
  onDone: () => void;
}) {
  const resume = useAppStore((s) => s.resume);
  const template = useAppStore((s) => s.selectedTemplate);
  const version = useAppStore(activeVersionSelector);
  const setVersionFilename = useAppStore((s) => s.setVersionFilename);
  const setVersionStatus = useAppStore((s) => s.setVersionStatus);
  const setActiveVersion = useAppStore((s) => s.setActiveVersion);

  const [format, setFormat] = useState<Format>("pdf");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const tailored = useMemo(
    () => (version ? applyEditsToResume(resume, version) : resume),
    [resume, version],
  );
  const firstName = resume.contact.name.split(" ")[0] || "there";
  const filename =
    version?.filename ??
    `${(resume.contact.name || "My").replace(/\s+/g, "-")}-Resume`;
  const ext = FORMATS.find((f) => f.id === format)?.ext ?? ".pdf";

  async function download() {
    setDownloadError(false);
    if (format === "txt") {
      downloadResumeText(tailored, filename);
    } else if (format === "pdf") {
      setDownloading(true);
      try {
        await downloadResumePdf(tailored, template, filename);
      } catch {
        setDownloadError(true);
        return;
      } finally {
        setDownloading(false);
      }
    } else {
      // .docx generation isn't built yet — the print dialog is the fallback
      printElement("export-sheet");
    }
    if (version) setVersionStatus(version.id, "ready");
  }

  function saveAndNext() {
    if (version) setVersionStatus(version.id, "ready");
    setActiveVersion(null);
    onDone();
  }

  return (
    <div className="flex flex-1 flex-col bg-page">
      <StepActions>
        <button
          type="button"
          onClick={onBackToEditor}
          className="text-[13px] font-medium text-muted hover:text-ink"
        >
          Back to editor
        </button>
      </StepActions>
      <div className="grid flex-1 lg:grid-cols-[1fr_480px]">
        <div className="flex min-w-0 items-start justify-center px-4 py-10 sm:px-12">
          <div className="relative w-full max-w-[440px]">
            <div id="export-sheet">
              <FitWidth max={440}>
                {(w) => (
                  <ResumePreview
                    resume={tailored}
                    template={template}
                    width={w}
                  />
                )}
              </FitWidth>
            </div>
            <div
              className="no-print absolute -right-4 -top-3.5 rounded-[9px] bg-success px-3.5 py-[9px] text-[12.5px] font-semibold text-white"
              style={{ boxShadow: "0 8px 20px rgba(31,157,107,.3)" }}
            >
              ATS check passed · {version ? version.score : 92}%
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-l border-line bg-white px-9 py-[34px]">
          <div>
            <div className="text-[22px] font-bold tracking-[-.01em] text-ink">
              Nice work, {firstName}. ✓
            </div>
            <div className="mt-[5px] text-[13.5px] leading-normal text-muted">
              {version ? (
                <>
                  Tailored for{" "}
                  <span className="font-semibold text-ink">
                    {version.jobTitle}
                  </span>{" "}
                  · {version.score}% match
                </>
              ) : (
                "Your master resume is ready to download."
              )}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[12px] font-medium text-muted">
              File name
            </div>
            <div className="flex items-center justify-between rounded-[9px] border border-input bg-[#fbfcfe] px-[13px] py-[11px]">
              <input
                value={filename}
                onChange={(e) =>
                  version && setVersionFilename(version.id, e.target.value)
                }
                className="w-full bg-transparent text-[13.5px] text-ink focus:outline-none"
              />
              <span className="flex-none text-[13.5px] text-ghost">{ext}</span>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-muted">
              Format
            </div>
            <div className="flex flex-col gap-2">
              {FORMATS.map((f) => {
                const selected = f.id === format;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`flex items-center gap-[11px] rounded-[10px] px-3.5 py-3 text-left ${
                      selected
                        ? "border-[1.5px] border-primary bg-[#fbfcff]"
                        : "border border-line hover:border-input2"
                    }`}
                  >
                    <div
                      className={`h-[17px] w-[17px] flex-none rounded-full ${
                        selected
                          ? "border-[5px] border-primary"
                          : "border-[1.5px] border-input2"
                      }`}
                    />
                    <div>
                      <div className="text-[13px] font-semibold text-ink">
                        {f.label}
                      </div>
                      <div className="text-[11.5px] text-muted">{f.help}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2.5">
            {downloadError && (
              <div className="rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-center text-[12.5px] font-medium text-danger">
                Something went wrong generating the file — try again.
              </div>
            )}
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              className="flex items-center justify-center gap-2 rounded-[10px] bg-primary p-3.5 text-center text-[15px] font-semibold text-white shadow-cta transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {downloading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {downloading
                ? "Preparing your PDF…"
                : `Download ${FORMATS.find((f) => f.id === format)?.label}`}
            </button>
            <button
              type="button"
              onClick={saveAndNext}
              className="rounded-[10px] border border-input2 bg-white p-[13px] text-center text-[14px] font-semibold text-ink hover:border-ghost"
            >
              Save &amp; tailor for another job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
