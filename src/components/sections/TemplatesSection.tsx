"use client";

import { TemplateThumb } from "@/components/TemplateThumb";
import { useAppStore } from "@/lib/store";
import { TEMPLATES, atsBand, BAND_META, BAND_ORDER } from "@/templates";
import type { AtsBand } from "@/templates";

export function TemplateStep({ onContinue }: { onContinue: () => void }) {
  const resume = useAppStore((s) => s.resume);
  const selected = useAppStore((s) => s.selectedTemplate);
  const setTemplate = useAppStore((s) => s.setTemplate);

  const byBand = BAND_ORDER.map((band) => ({
    band,
    items: TEMPLATES.filter((t) => atsBand(t.ats) === band),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex-1 bg-page">
      <div className="px-14 pb-[52px] pt-11">
        <h2 className="mb-1.5 text-[28px] font-bold tracking-[-.01em] text-ink">
          Pick a template.
        </h2>
        <p className="mb-8 max-w-[640px] text-[15px] text-muted">
          They&rsquo;re grouped by how an{" "}
          <span className="font-semibold text-body">ATS</span> — the software
          that scans resumes before a person does — reads them. Choose based on
          where this resume is headed. Switch anytime without retyping.
        </p>

        <div className="flex flex-col gap-9">
          {byBand.map(({ band, items }) => (
            <BandGroup
              key={band}
              band={band}
              count={items.length}
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {items.map((t) => {
                  const isSelected = t.id === selected;
                  return (
                    <div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => setTemplate(t.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setTemplate(t.id);
                        }
                      }}
                      className={`group relative cursor-pointer rounded-xl bg-white p-2.5 text-left outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected
                          ? "border-2 border-primary shadow-[0_8px_20px_rgba(47,107,223,.14)]"
                          : "border border-line hover:shadow-card"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-2 top-2 z-20 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow-[0_2px_6px_rgba(47,107,223,.45)]">
                          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
                            <path
                              d="M5 12l4 4 10-10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="relative overflow-hidden rounded-lg">
                        <TemplateThumb template={t.id} resume={resume} />
                        {/* hover: pick this template and go straight to the next step */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-ink/10 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTemplate(t.id);
                              onContinue();
                            }}
                            className="rounded-lg bg-primary px-5 py-2.5 text-[13.5px] font-semibold uppercase tracking-[.06em] text-white shadow-[0_6px_16px_rgba(47,107,223,.45)] transition-colors hover:bg-primary-hover"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between px-0.5">
                        <div className="text-[13px] font-semibold text-ink">
                          {t.name}
                        </div>
                        <div
                          className={`rounded-md px-1.5 py-[2px] text-[10.5px] font-medium ${
                            t.ats >= 90
                              ? "bg-success-bg text-success"
                              : t.ats >= 75
                                ? "bg-tint text-primary"
                                : "bg-warn-bg text-warn"
                          }`}
                        >
                          ATS {t.ats}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </BandGroup>
          ))}
        </div>
      </div>
    </div>
  );
}

function BandGroup({
  band,
  count,
  children,
}: {
  band: AtsBand;
  count: number;
  children: React.ReactNode;
}) {
  const meta = BAND_META[band];
  const warn = meta.tone === "warn";
  return (
    <section>
      <div className="mb-3.5 border-b border-line pb-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${warn ? "bg-warn" : "bg-success"}`}
          />
          <h3 className="text-[16px] font-bold text-ink">{meta.label}</h3>
          <span className="rounded-full bg-white px-2 py-[2px] text-[11px] font-medium text-muted">
            {count}
          </span>
        </div>
        <p className="mt-1 max-w-[720px] text-[13px] leading-normal text-muted">
          {meta.blurb}
        </p>
      </div>
      {children}
    </section>
  );
}
