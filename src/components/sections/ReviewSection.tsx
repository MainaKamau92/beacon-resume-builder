"use client";

import { useMemo, useState } from "react";
import { StepActions } from "@/components/chrome";
import { useAppStore } from "@/lib/store";
import { buildSampleExtraction } from "@/lib/sample";

/* ---- "Your original" raw-document formatting (display only) ------------- */

const SECTION_WORDS =
  /^(summary|profile|objective|about(\s+me)?|professional\s+summary|summary\s+of\s+qualifications|experience|work\s+experience|professional\s+experience|employment(\s+history)?|work\s+history|education(\s*&\s*training)?|technical\s+skills|skills(\s*&\s*interests)?|core\s+competencies|projects?|certifications?|licenses?|awards?|honou?rs?|interests|hobbies|references|volunteer(ing)?|activities|languages|publications)\b/i;

/** Is this raw line a section header we should break the document on? */
function isSectionHeading(line: string, isFirstLine: boolean): boolean {
  const s = line.trim().replace(/[:：]\s*$/, "");
  if (!s || s.length > 36) return false;
  if (SECTION_WORDS.test(s) && s.split(/\s+/).length <= 4) return true;
  if (isFirstLine) return false; // the opening line is the person's name
  // all-caps fallback catches non-standard headings ("WHERE I'VE WORKED"),
  // but must be multi-word so acronym skills (SQL, AWS, GCP) aren't headings
  const letters = s.replace(/[^A-Za-z]/g, "");
  const words = s.split(/\s+/).length;
  return (
    letters.length >= 3 &&
    letters === letters.toUpperCase() &&
    words >= 2 &&
    words <= 5
  );
}

const RAW_DATE_RE =
  /^\(?(?:[A-Za-z]{3,9}\.?\s+)?(?:19|20)\d{2}\s*(?:[-–—]|to)\s*(?:(?:[A-Za-z]{3,9}\.?\s+)?(?:19|20)\d{2}|present|current|now)\)?[.,]?$/i;
const RAW_SINGLE_DATE_RE = /^\(?(?:[A-Za-z]{3,9}\.?\s+)?(?:19|20)\d{2}\)?[.,]?$/;
const RAW_BULLET_RE = /^\s*[-•*●○▪▸►▶◦‣·]\s+/;

/** Rough role/date/bullet classification so entries read as entries. */
function rawLineKind(line: string): "date" | "entry" | "bullet" | "text" {
  const t = line.trim();
  if (RAW_BULLET_RE.test(line)) return "bullet";
  if (RAW_DATE_RE.test(t) || RAW_SINGLE_DATE_RE.test(t)) return "date";
  if (
    t.length < 70 &&
    /^[A-Z]/.test(t) &&
    /\s[–—-]\s|\s\|\s/.test(t) &&
    !/[.!?]$/.test(t)
  )
    return "entry";
  return "text";
}

interface RawBlock {
  heading: string | null;
  lines: number[];
}

/** Group raw lines into sections keyed by detected headings. */
function groupRawLines(rawLines: string[]): {
  blocks: RawBlock[];
  firstLineIdx: number;
} {
  const firstLineIdx = rawLines.findIndex((l) => l.trim());
  const blocks: RawBlock[] = [];
  let cur: RawBlock = { heading: null, lines: [] };
  rawLines.forEach((line, i) => {
    if (line.trim() && isSectionHeading(line, i === firstLineIdx)) {
      if (cur.heading !== null || cur.lines.length) blocks.push(cur);
      cur = { heading: line.trim().replace(/[:：]\s*$/, ""), lines: [] };
    } else {
      cur.lines.push(i);
    }
  });
  blocks.push(cur);
  return {
    firstLineIdx,
    blocks: blocks.filter(
      (b) => b.heading !== null || b.lines.some((i) => rawLines[i].trim()),
    ),
  };
}

function MappedCard({
  ok,
  title,
  children,
  warning = false,
  onEdit,
}: {
  ok: boolean;
  title: string;
  children: React.ReactNode;
  warning?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[11px] bg-white px-[18px] py-3.5 ${
        warning
          ? "border-[1.5px] border-warn-border shadow-[0_4px_12px_rgba(236,200,106,.18)]"
          : "border border-success-border"
      }`}
    >
      <div
        className={`grid h-5 w-5 flex-none place-items-center rounded-full text-[11px] font-bold text-white ${
          ok ? "bg-success" : "bg-warn"
        }`}
      >
        {ok ? "✓" : "!"}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <div className="text-[13px] font-semibold text-ink">{title}</div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-[12px] font-semibold text-primary hover:text-primary-hover"
            >
              Edit
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function ReviewStep({
  onContinue,
  onEditJump,
}: {
  onContinue: () => void;
  onEditJump: () => void;
}) {
  const storedExtraction = useAppStore((s) => s.extraction);
  const aiOn = useAppStore((s) => s.aiRefinementEnabled);
  const setExtraction = useAppStore((s) => s.setExtraction);
  const adoptExtraction = useAppStore((s) => s.adoptExtraction);
  const setSkills = useAppStore((s) => s.setSkills);

  const extraction = useMemo(
    () => storedExtraction ?? buildSampleExtraction("jane-doe-resume.pdf"),
    [storedExtraction],
  );

  const [kept, setKept] = useState<Set<string>>(
    () => new Set(extraction.skillReview.keep),
  );
  const [skillsTouched, setSkillsTouched] = useState(false);

  function toggleSkill(skill: string) {
    setSkillsTouched(true);
    setKept((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  }

  function confirmAndAdopt() {
    if (!storedExtraction) setExtraction(extraction);
    adoptExtraction();
    // "JavaScript (React)" style chips expand into separate skills
    const skills = [...kept].flatMap((s) => {
      const m = s.match(/^(.+?)\s*\((.+)\)$/);
      return m ? [m[1], m[2]] : [s];
    });
    // never write an empty skills list from review
    if (skills.length > 0) setSkills(skills);
  }

  function goEdit() {
    confirmAndAdopt();
    onEditJump();
  }

  function continueFlow() {
    confirmAndAdopt();
    onContinue();
  }

  const confOf = (key: string) =>
    extraction.sections.find((s) => s.key === key)?.confidence === "ok";
  const okCount = extraction.sections.filter(
    (s) => s.confidence === "ok",
  ).length;
  const confirmedCount = Math.min(
    4,
    okCount + (skillsTouched && !confOf("skills") ? 1 : 0),
  );

  const rawLines = useMemo(() => extraction.raw.split("\n"), [extraction.raw]);
  const { blocks, firstLineIdx } = useMemo(
    () => groupRawLines(rawLines),
    [rawLines],
  );
  const skillsLineIdx =
    extraction.skillReview.flaggedLineIndex ??
    rawLines.findIndex((l) => l.toLowerCase().includes("also:"));

  const { resume } = extraction;
  const contactBits = [
    resume.contact.name,
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
  ].filter(Boolean);
  const firstEdu = resume.education[0];
  const firstExp = resume.experience[0];
  const totalBullets = resume.experience.reduce(
    (n, e) => n + e.bullets.filter((b) => b.trim()).length,
    0,
  );
  const notFound = (
    <span className="text-ghost">
      Nothing found — you can add it in the editor.
    </span>
  );

  return (
    <div className="flex flex-1 flex-col bg-page">
      <StepActions>
        <div className="text-[12.5px] font-medium text-muted">
          {confirmedCount} of 4 sections confirmed
        </div>
        <button
          type="button"
          onClick={continueFlow}
          className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Looks right — continue →
        </button>
      </StepActions>
      <div className="grid flex-1 lg:grid-cols-2">
        <div className="border-r border-line px-8 py-7">
          <div className="mb-3.5 flex items-center gap-2">
            <div className="text-[12px] font-semibold uppercase tracking-[.06em] text-muted">
              Your original
            </div>
            <div className="rounded-md border border-line bg-white px-2 py-[3px] font-mono text-[11px] font-medium text-ghost">
              {extraction.filename}
            </div>
          </div>
          <div className="rounded-[10px] border border-line bg-white px-[26px] py-[22px]">
            {blocks.map((block, bi) => (
              <div
                key={bi}
                className={
                  bi > 0
                    ? "mt-3.5 border-t border-dashed border-line pt-3.5"
                    : ""
                }
              >
                {block.heading && (
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-primary">
                      {block.heading}
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                )}
                <div className="flex flex-col gap-[3px] font-mono text-[11.5px] leading-[1.6] text-muted">
                  {block.lines.map((i) => {
                    const line = rawLines[i];
                    if (!line.trim()) return <div key={i} className="h-1" />;
                    if (i === skillsLineIdx) {
                      return (
                        <div
                          key={i}
                          className="-mx-1.5 rounded bg-warn-bg2 px-1.5 py-0.5 outline outline-2 outline-warn-border"
                        >
                          {line}
                        </div>
                      );
                    }
                    if (block.heading === null && i === firstLineIdx) {
                      return (
                        <div
                          key={i}
                          className="text-[13px] font-semibold text-ink"
                        >
                          {line}
                        </div>
                      );
                    }
                    const kind = rawLineKind(line);
                    if (kind === "entry") {
                      return (
                        <div key={i} className="mt-1.5 font-medium text-ink">
                          {line}
                        </div>
                      );
                    }
                    if (kind === "date") {
                      return (
                        <div key={i} className="text-[11px] text-ghost">
                          {line}
                        </div>
                      );
                    }
                    if (kind === "bullet") {
                      return (
                        <div key={i} className="pl-2.5">
                          {line}
                        </div>
                      );
                    }
                    return <div key={i}>{line}</div>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-7">
          <div className="mb-3.5 text-[12px] font-semibold uppercase tracking-[.06em] text-muted">
            Mapped to your resume
          </div>
          <div className="flex flex-col gap-3">
            <MappedCard ok={confOf("contact")} title="Contact" onEdit={goEdit}>
              <div className="mt-[3px] text-[12.5px] leading-normal text-muted">
                {contactBits.length > 0 ? contactBits.join(" · ") : notFound}
              </div>
            </MappedCard>
            <MappedCard
              ok={confOf("education")}
              title="Education"
              onEdit={goEdit}
            >
              <div className="mt-[3px] text-[12.5px] leading-normal text-muted">
                {firstEdu ? (
                  <>
                    {[firstEdu.school, firstEdu.degree]
                      .filter(Boolean)
                      .join(" — ")}
                    {firstEdu.date && ` · ${firstEdu.date}`}
                    {firstEdu.details &&
                      ` · ${firstEdu.details.slice(0, 60)}${firstEdu.details.length > 60 ? "…" : ""}`}
                    {resume.education.length > 1 &&
                      ` · +${resume.education.length - 1} more`}
                  </>
                ) : (
                  notFound
                )}
              </div>
            </MappedCard>
            <MappedCard
              ok={confOf("experience")}
              title="Experience"
              onEdit={goEdit}
            >
              <div className="mt-[3px] text-[12.5px] leading-normal text-muted">
                {firstExp ? (
                  <>
                    {[firstExp.title, firstExp.org]
                      .filter(Boolean)
                      .join(" — ")}
                    {firstExp.date && ` · ${firstExp.date}`}
                    {` · ${totalBullets} bullet ${totalBullets === 1 ? "point" : "points"}`}
                    {resume.experience.length > 1 &&
                      ` · +${resume.experience.length - 1} more`}
                  </>
                ) : (
                  notFound
                )}
              </div>
              {aiOn &&
                extraction.aiNotes.map((note) => (
                  <div
                    key={note}
                    className="mt-2 flex items-center gap-[7px] rounded-[7px] border border-suggest-border bg-suggest px-2.5 py-1.5 text-[11.5px] text-body"
                  >
                    <span className="font-bold text-primary">✦</span>
                    {note}
                  </div>
                ))}
            </MappedCard>
            <MappedCard
              ok={confOf("skills")}
              warning={!confOf("skills")}
              title={
                confOf("skills") ? "Skills" : "Skills — needs a quick check"
              }
            >
              <div className="mt-[3px] text-[12.5px] leading-normal text-muted">
                {extraction.skillReview.keep.length +
                  extraction.skillReview.ambiguous.length ===
                0 ? (
                  notFound
                ) : (
                  <>We split skills from hobbies. Keep the ones that belong:</>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-[7px]">
                {[...extraction.skillReview.keep, ...extraction.skillReview.drop].map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={`rounded-full px-[11px] py-[5px] text-[12px] font-medium transition-colors ${
                        kept.has(s)
                          ? "border border-success-border bg-success-bg2 text-ink"
                          : "border border-dashed border-input2 text-ghost line-through"
                      }`}
                    >
                      {s} {kept.has(s) && "✓"}
                    </button>
                  ),
                )}
                {extraction.skillReview.ambiguous.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className={`rounded-full px-[11px] py-[5px] text-[12px] font-medium transition-colors ${
                      kept.has(s)
                        ? "border border-success-border bg-success-bg2 text-ink"
                        : "border border-input2 bg-white text-muted"
                    }`}
                  >
                    {kept.has(s) ? `${s} ✓` : `${s} → keep?`}
                  </button>
                ))}
              </div>
            </MappedCard>
          </div>
        </div>
      </div>
    </div>
  );
}
