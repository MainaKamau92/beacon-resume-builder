"use client";

import { MatchRing, StepActions } from "@/components/chrome";
import { TemplateThumb } from "@/components/TemplateThumb";
import { useAppStore } from "@/lib/store";
import { getTemplate } from "@/templates";
import type { Version } from "@/lib/types";

function ringColor(score: number): string {
  if (score >= 80) return "#1f9d6b";
  if (score >= 60) return "#2f6bdf";
  return "#8595a8";
}

function ringLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  return "Draft";
}

function relativeTime(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60_000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function StatusPill({ version }: { version: Version }) {
  const fixes = version.suggestedEdits.filter(
    (e) => e.state === "pending",
  ).length;
  if (version.status === "applied") {
    return (
      <div className="rounded-full bg-success-bg px-2.5 py-[5px] text-center text-[11.5px] font-semibold text-success">
        Applied ✓
      </div>
    );
  }
  if (fixes > 0) {
    return (
      <div className="rounded-full bg-warn-bg px-2.5 py-[5px] text-center text-[11.5px] font-semibold text-warn">
        {fixes} {fixes === 1 ? "fix" : "fixes"} left
      </div>
    );
  }
  if (version.status === "ready") {
    return (
      <div className="rounded-full bg-success-bg px-2.5 py-[5px] text-center text-[11.5px] font-semibold text-success">
        Ready
      </div>
    );
  }
  return (
    <div className="rounded-full bg-[#eef1f6] px-2.5 py-[5px] text-center text-[11.5px] font-semibold text-muted">
      Draft
    </div>
  );
}

export function DashboardStep({
  onOpenVersion,
  onNewVersion,
  onEditResume,
  onExport,
}: {
  onOpenVersion: () => void;
  onNewVersion: () => void;
  onEditResume: () => void;
  onExport: () => void;
}) {
  const resume = useAppStore((s) => s.resume);
  const versions = useAppStore((s) => s.versions);
  const template = useAppStore((s) => s.selectedTemplate);
  const setActiveVersion = useAppStore((s) => s.setActiveVersion);

  const sorted = [...versions].sort((a, b) => b.editedAt - a.editedAt);

  function openVersion(id: string) {
    setActiveVersion(id);
    onOpenVersion();
  }

  function newVersion() {
    setActiveVersion(null);
    onNewVersion();
  }

  return (
    <div className="flex-1 bg-page">
      <StepActions>
        <div className="mr-auto text-[15px] font-semibold text-ink">
          My resumes
        </div>
        <button
          type="button"
          onClick={newVersion}
          className="rounded-lg bg-primary px-[18px] py-[9px] text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          + New tailored version
        </button>
      </StepActions>

      <div className="px-12 pb-11 pt-9">
        <div className="grid items-start gap-[26px] lg:grid-cols-[340px_1fr]">
          <div className="rounded-[14px] border border-line bg-white px-6 py-[22px]">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[.06em] text-muted">
              Base resume
            </div>
            <TemplateThumb
              template={template}
              resume={resume}
              cropHeight={150}
            />
            <div className="mt-3.5 flex items-baseline justify-between">
              <div className="text-[14.5px] font-semibold text-ink">
                {resume.contact.name || "My resume"} — Master
              </div>
              <div className="text-[11.5px] text-muted">
                {getTemplate(template).name} template
              </div>
            </div>
            <div className="mt-[3px] text-[12px] text-muted">
              The source for every tailored version
            </div>
            <div className="mt-3.5 flex gap-2.5">
              <button
                type="button"
                onClick={onEditResume}
                className="flex-1 rounded-lg border border-input2 bg-white p-[9px] text-center text-[12.5px] font-semibold text-ink hover:border-ghost"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveVersion(null);
                  onExport();
                }}
                className="flex-1 rounded-lg border border-input2 bg-white p-[9px] text-center text-[12.5px] font-semibold text-ink hover:border-ghost"
              >
                Download
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-muted">
                Tailored versions · {sorted.length}
              </div>
              <div className="text-[12px] font-medium text-muted">
                Sorted by last edited
              </div>
            </div>

            {sorted.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => openVersion(v.id)}
                className="grid grid-cols-[1fr_130px_110px_110px] items-center gap-4 rounded-[13px] border border-line bg-white px-[22px] py-[18px] text-left transition-shadow hover:shadow-card"
              >
                <div>
                  <div className="text-[14px] font-semibold text-ink">
                    {v.jobTitle}
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted">
                    {v.status === "draft"
                      ? "No file yet"
                      : `${v.filename}.pdf`}{" "}
                    · edited {relativeTime(v.editedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MatchRing
                    score={v.score}
                    size={30}
                    thickness={4.5}
                    color={ringColor(v.score)}
                  >
                    <span className="text-[9px] font-bold text-ink">
                      {v.score}
                    </span>
                  </MatchRing>
                  <div
                    className="text-[12px] font-medium"
                    style={{ color: ringColor(v.score) }}
                  >
                    {ringLabel(v.score)}
                  </div>
                </div>
                <StatusPill version={v} />
                <div className="text-right text-[12.5px] font-semibold text-primary">
                  Open →
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={newVersion}
              className="flex items-center gap-3 rounded-[13px] border border-dashed border-input2 px-[22px] py-4 text-left hover:border-primary"
            >
              <div className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-tint text-[16px] font-semibold text-primary">
                +
              </div>
              <div className="text-[13.5px] font-medium text-muted">
                Paste a new job description to create a tailored version
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
