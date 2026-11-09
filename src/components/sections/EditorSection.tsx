"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AiIcon, StepActions, Toggle } from "@/components/chrome";
import { PaginatedSheet } from "@/components/PaginatedSheet";
import { downloadResumePdf } from "@/lib/download";
import { useAppStore } from "@/lib/store";
import type { BulletSuggestion } from "@/lib/types";

/**
 * The editor is a single, document-style resume you type directly into — the
 * whole page is the editing surface (no side-by-side form). Fields blend into
 * the document until you hover/focus them; sections have inline add/remove.
 * A top toggle flips to a read-only preview rendered in the chosen template
 * (the same component used for the exported PDF), so "what you edit" and "what
 * you ship" stay one thing. AI bullet suggestions appear under the focused
 * bullet, exactly as before.
 */

/* ---------- inline document fields ---------- */

/** Single-line field that reads as document text; auto-sizes to content where
 *  the browser supports it (`field-sizing`), otherwise falls back gracefully. */
function DocInput({
  value,
  onChange,
  placeholder,
  className = "",
  ariaLabel,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`-mx-1 max-w-full rounded bg-transparent px-1 outline-none transition-colors [field-sizing:content] placeholder:text-ghost2 hover:bg-ink/[.04] focus:bg-primary/[.06] ${className}`}
    />
  );
}

/** Multi-line field (summary, bullets) that grows with its content. */
function DocArea({
  value,
  onChange,
  placeholder,
  className = "",
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`-mx-1.5 block w-[calc(100%+0.75rem)] resize-none overflow-hidden rounded bg-transparent px-1.5 outline-none transition-colors placeholder:text-ghost2 hover:bg-ink/[.04] focus:bg-primary/[.06] ${className}`}
    />
  );
}

function DocSection({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between border-b-2 border-ink pb-1">
        <h3 className="text-[12.5px] font-bold uppercase tracking-[.14em] text-ink">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Small round "×" that appears on row hover to remove an entry/bullet. */
function RemoveButton({
  onClick,
  label,
  className = "",
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid h-5 w-5 flex-none place-items-center rounded-full border border-line bg-white text-[13px] leading-none text-muted opacity-0 transition-opacity hover:border-danger hover:text-danger group-hover:opacity-100 focus:opacity-100 ${className}`}
    >
      ×
    </button>
  );
}

function AddRow({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 w-full rounded-lg border border-dashed border-input2 py-2 text-center text-[12.5px] font-medium text-muted transition-colors hover:border-primary hover:text-primary"
    >
      {label}
    </button>
  );
}

function SavedIndicator() {
  const lastSavedAt = useAppStore((s) => s.lastSavedAt);
  const [recent, setRecent] = useState(false);
  useEffect(() => {
    if (!lastSavedAt) return;
    const update = () => setRecent(Date.now() - lastSavedAt < 15_000);
    update();
    const t = setInterval(update, 5000);
    return () => clearInterval(t);
  }, [lastSavedAt]);
  if (!lastSavedAt) return null;
  return (
    <div className="hidden text-[12.5px] font-medium text-success sm:block">
      {recent ? "Saved just now" : "All changes saved"}
    </div>
  );
}

/* ---------- editor ---------- */

const DOT = <span className="px-1 text-ghost2">·</span>;

export function EditorStep({ onContinue }: { onContinue: () => void }) {
  const resume = useAppStore((s) => s.resume);
  const template = useAppStore((s) => s.selectedTemplate);
  const aiOn = useAppStore((s) => s.aiRefinementEnabled);
  const setAi = useAppStore((s) => s.setAiRefinement);
  const updateContact = useAppStore((s) => s.updateContact);
  const setSummary = useAppStore((s) => s.setSummary);
  const updateEducation = useAppStore((s) => s.updateEducation);
  const addEducation = useAppStore((s) => s.addEducation);
  const removeEducation = useAppStore((s) => s.removeEducation);
  const updateExperience = useAppStore((s) => s.updateExperience);
  const addExperience = useAppStore((s) => s.addExperience);
  const removeExperience = useAppStore((s) => s.removeExperience);
  const updateBullet = useAppStore((s) => s.updateBullet);
  const addBullet = useAppStore((s) => s.addBullet);
  const removeBullet = useAppStore((s) => s.removeBullet);
  const setSkills = useAppStore((s) => s.setSkills);

  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [downloading, setDownloading] = useState(false);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [skillDraft, setSkillDraft] = useState("");
  const [suggestions, setSuggestions] = useState<
    Record<string, BulletSuggestion | null>
  >({});
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function requestSuggestion(key: string, text: string) {
    if (!aiOn) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const data = (await res.json()) as {
          suggestion: BulletSuggestion | null;
        };
        setSuggestions((prev) => ({ ...prev, [key]: data.suggestion }));
      } catch {
        // suggestions are best-effort
      }
    }, 450);
  }

  function commitSkillDraft() {
    const parts = skillDraft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) {
      const seen = new Set(resume.skills.map((s) => s.toLowerCase()));
      const merged = [...resume.skills];
      for (const p of parts)
        if (!seen.has(p.toLowerCase())) {
          merged.push(p);
          seen.add(p.toLowerCase());
        }
      setSkills(merged);
    }
    setSkillDraft("");
  }

  return (
    <div className="flex flex-1 flex-col bg-page">
      <StepActions>
        <div className="flex items-center gap-2 rounded-full border border-suggest-border bg-suggest py-[5px] pl-[13px] pr-3">
          <AiIcon size={16} />
          <div className="hidden text-[12.5px] font-semibold text-ink sm:block">
            AI refinement
          </div>
          <Toggle on={aiOn} onChange={setAi} size="sm" />
        </div>
        <SavedIndicator />
        <button
          type="button"
          disabled={downloading}
          onClick={async () => {
            setDownloading(true);
            try {
              await downloadResumePdf(
                resume,
                template,
                `${(resume.contact.name || "My").replace(/\s+/g, "-")}-Resume`,
              );
            } finally {
              setDownloading(false);
            }
          }}
          className="rounded-lg border border-input2 bg-white px-4 py-2 text-[13px] font-semibold text-ink hover:border-ghost disabled:opacity-60"
        >
          {downloading ? "Preparing…" : "Download PDF"}
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Next: Tailor to a job →
        </button>
      </StepActions>

      <div className="flex flex-1 flex-col items-center px-4 py-6">
        {/* Edit / Preview toggle */}
        <div className="mb-5 inline-flex rounded-full border border-line bg-white p-1 text-[13px] font-semibold">
          {(["edit", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 capitalize transition-colors ${
                mode === m
                  ? "bg-primary text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {m === "preview" ? "Preview" : "Edit"}
            </button>
          ))}
        </div>

        {mode === "preview" ? (
          <div className="w-full max-w-full overflow-x-auto pb-4">
            <div className="mx-auto w-fit">
              <PaginatedSheet resume={resume} template={template} width={560} />
            </div>
          </div>
        ) : (
          <div
            className="w-full max-w-[780px] rounded-2xl border border-line bg-white px-8 py-10 sm:px-12 sm:py-12"
            style={{ boxShadow: "0 12px 32px rgba(20,32,46,.08)" }}
          >
            {/* Header */}
            <DocInput
              value={resume.contact.name}
              onChange={(v) => updateContact({ name: v })}
              placeholder="Your Name"
              className="text-[32px] font-bold tracking-tight text-ink"
            />
            <div className="mt-1 flex flex-wrap items-center text-[13px] text-body">
              <DocInput
                value={resume.contact.email}
                onChange={(v) => updateContact({ email: v })}
                placeholder="you@email.com"
              />
              {DOT}
              <DocInput
                value={resume.contact.phone}
                onChange={(v) => updateContact({ phone: v })}
                placeholder="(206) 555-0142"
              />
              {DOT}
              <DocInput
                value={resume.contact.location}
                onChange={(v) => updateContact({ location: v })}
                placeholder="City, ST"
              />
              {DOT}
              <DocInput
                value={resume.contact.linkedin}
                onChange={(v) => updateContact({ linkedin: v })}
                placeholder="linkedin.com/in/you"
              />
            </div>

            {/* Summary */}
            <DocSection title="Summary">
              <DocArea
                value={resume.summary ?? ""}
                onChange={setSummary}
                placeholder="One or two sentences: what you do, what you've shipped, what you're looking for…"
                className="text-[13px] leading-relaxed text-body"
              />
            </DocSection>

            {/* Experience */}
            <DocSection
              title="Experience"
              action={
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-[12px] font-semibold text-primary hover:text-primary-hover"
                >
                  + Add
                </button>
              }
            >
              <div className="flex flex-col gap-5">
                {resume.experience.map((exp) => (
                  <div key={exp.id} className="group relative">
                    <div className="flex items-start justify-between gap-2">
                      <DocInput
                        value={exp.title}
                        onChange={(v) =>
                          updateExperience(exp.id, { title: v })
                        }
                        placeholder="Role / project title"
                        className="text-[15px] font-semibold text-ink"
                      />
                      <RemoveButton
                        label="Remove this experience"
                        onClick={() => removeExperience(exp.id)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex flex-wrap items-center text-[13px]">
                      <DocInput
                        value={exp.org}
                        onChange={(v) => updateExperience(exp.id, { org: v })}
                        placeholder="Organization"
                        className="font-medium text-primary"
                      />
                      {DOT}
                      <DocInput
                        value={exp.date}
                        onChange={(v) => updateExperience(exp.id, { date: v })}
                        placeholder="2024 – present"
                        className="text-muted"
                      />
                    </div>

                    <ul className="mt-2 flex flex-col gap-1">
                      {exp.bullets.map((bullet, bi) => {
                        const key = `${exp.id}:${bi}`;
                        const suggestion = suggestions[key];
                        return (
                          <li key={key} className="group/b">
                            <div className="flex items-start gap-2">
                              <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-ink" />
                              <DocArea
                                value={bullet}
                                onChange={(v) => {
                                  updateBullet(exp.id, bi, v);
                                  requestSuggestion(key, v);
                                }}
                                onFocus={() => {
                                  setFocusKey(key);
                                  requestSuggestion(key, bullet);
                                }}
                                onBlur={() => setFocusKey(null)}
                                placeholder="Describe a result or something you improved…"
                                className="flex-1 text-[13px] leading-relaxed text-body"
                              />
                              <RemoveButton
                                label="Remove bullet"
                                onClick={() => removeBullet(exp.id, bi)}
                                className="mt-1.5 opacity-0 group-hover/b:opacity-100"
                              />
                            </div>
                            {aiOn &&
                              suggestion &&
                              bullet.trim() &&
                              focusKey === key && (
                                <div className="ml-4 mt-1 flex items-center gap-2 rounded-[9px] border border-suggest-border bg-suggest px-3 py-2">
                                  <AiIcon size={18} />
                                  <div className="text-[12px] leading-snug text-body">
                                    <span className="font-semibold text-primary">
                                      AI suggests:
                                    </span>{" "}
                                    {suggestion.label}{" "}
                                    <span className="font-semibold text-ink">
                                      {suggestion.emphasis}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      updateBullet(
                                        exp.id,
                                        bi,
                                        suggestion.replacement,
                                      );
                                      setSuggestions((prev) => ({
                                        ...prev,
                                        [key]: null,
                                      }));
                                    }}
                                    className="ml-auto flex-none text-[12px] font-semibold text-primary hover:text-primary-hover"
                                  >
                                    Use it
                                  </button>
                                </div>
                              )}
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={() => addBullet(exp.id)}
                      className="ml-4 mt-1.5 text-[12px] font-medium text-primary hover:text-primary-hover"
                    >
                      + Add bullet
                    </button>
                  </div>
                ))}
              </div>
              <AddRow onClick={addExperience} label="+ Add a job or project" />
            </DocSection>

            {/* Education */}
            <DocSection
              title="Education"
              action={
                <button
                  type="button"
                  onClick={addEducation}
                  className="text-[12px] font-semibold text-primary hover:text-primary-hover"
                >
                  + Add
                </button>
              }
            >
              <div className="flex flex-col gap-4">
                {resume.education.map((edu) => (
                  <div key={edu.id} className="group relative">
                    <div className="flex items-start justify-between gap-2">
                      <DocInput
                        value={edu.school}
                        onChange={(v) =>
                          updateEducation(edu.id, { school: v })
                        }
                        placeholder="School"
                        className="text-[14.5px] font-semibold text-ink"
                      />
                      <RemoveButton
                        label="Remove this education entry"
                        onClick={() => removeEducation(edu.id)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex flex-wrap items-center text-[13px]">
                      <DocInput
                        value={edu.degree}
                        onChange={(v) =>
                          updateEducation(edu.id, { degree: v })
                        }
                        placeholder="Degree"
                        className="text-body"
                      />
                      {DOT}
                      <DocInput
                        value={edu.date}
                        onChange={(v) => updateEducation(edu.id, { date: v })}
                        placeholder="Jun 2026"
                        className="text-muted"
                      />
                    </div>
                    <DocArea
                      value={edu.details}
                      onChange={(v) => updateEducation(edu.id, { details: v })}
                      placeholder="GPA, honors, relevant coursework…"
                      className="text-[12.5px] leading-relaxed text-muted"
                    />
                  </div>
                ))}
              </div>
              <AddRow onClick={addEducation} label="+ Add a school" />
            </DocSection>

            {/* Skills */}
            <DocSection title="Skills">
              <div className="flex flex-wrap items-center gap-2">
                {resume.skills.map((s) => (
                  <span
                    key={s}
                    className="group/skill inline-flex items-center gap-1.5 rounded-full border border-line bg-page px-3 py-1 text-[12.5px] font-medium text-ink"
                  >
                    {s}
                    <button
                      type="button"
                      aria-label={`Remove ${s}`}
                      onClick={() =>
                        setSkills(resume.skills.filter((x) => x !== s))
                      }
                      className="text-ghost transition-colors hover:text-danger"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      commitSkillDraft();
                    }
                  }}
                  onBlur={commitSkillDraft}
                  placeholder="Add a skill…"
                  className="min-w-[120px] flex-1 rounded-full border border-dashed border-input2 px-3 py-1 text-[12.5px] text-ink outline-none placeholder:text-ghost focus:border-primary"
                />
              </div>
              <div className="mt-2 text-[12px] leading-normal text-muted">
                List real tools and languages — recruiters and ATS filters scan
                this line first.
              </div>
            </DocSection>
          </div>
        )}
      </div>
    </div>
  );
}
