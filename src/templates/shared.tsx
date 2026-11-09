import type { ReactNode } from "react";
import type { Resume } from "@/lib/types";
import type { TemplateRenderProps } from "./types";

/**
 * Shared building blocks for template modules.
 *
 * Two layers:
 *  - item renderers (EducationItems / ExperienceItems / SkillsLine) — the
 *    content without a section heading, for templates that style their own
 *    heads or wrap items in custom chrome (timelines, chips, …)
 *  - composed sections (EducationSection / …) — default blue SectionHead +
 *    items, with an optional `accentClass` to recolor the head.
 */

export const GHOST_BULLET = "Describe a result or something you improved…";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wraps JD-matched terms with the visual-only .jd-hl highlight. */
export function highlightTerms(text: string, terms: string[]): ReactNode {
  if (terms.length === 0 || !text) return text;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <span key={i} className="jd-hl rounded-[3px] bg-jdhl px-0.5">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function contactLine(resume: Resume): string {
  const { email, phone, location, linkedin } = resume.contact;
  return [email, phone, location, linkedin].filter(Boolean).join(" · ");
}

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YN"
  );
}

/**
 * Photo slot for design-forward templates. We don't collect a photo yet, so
 * this renders an initials monogram — which is also the ATS-neutral
 * "photoless" version of these layouts. `size`, shape, ring, and colors are
 * themed by the caller. `shape: "rounded"` (with an optional `height`) makes
 * a rounded rectangle for templates whose photo is a panel, not a circle.
 */
export function Avatar({
  name,
  size,
  height,
  shape = "circle",
  className = "",
  ringClassName = "border-white",
  bgClassName = "bg-white/15 text-white",
}: {
  name: string;
  size: number;
  height?: number;
  shape?: "circle" | "rounded";
  className?: string;
  ringClassName?: string;
  bgClassName?: string;
}) {
  const h = height ?? size;
  return (
    <div
      className={`grid flex-none place-items-center overflow-hidden border-[3px] font-bold ${ringClassName} ${bgClassName} ${className}`}
      style={{
        width: size,
        height: h,
        fontSize: Math.min(size, h) * 0.34,
        borderRadius: shape === "circle" ? "9999px" : "14px",
      }}
    >
      {initialsOf(name)}
    </div>
  );
}

/** Inline stroke icons (currentColor). Shared across design-forward templates. */
export const GLYPHS = {
  phone: "M6 3h3l2 5-2 1a12 12 0 006 6l1-2 5 2v3a2 2 0 01-2 2A17 17 0 014 5a2 2 0 012-2z",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  pin: "M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12zM12 10a2 2 0 100-4 2 2 0 000 4z",
  globe:
    "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  briefcase: "M4 8h16v11H4zM9 8V6a2 2 0 012-2h2a2 2 0 012 2v2",
  cap: "M12 5l9 4-9 4-9-4 9-4zM7 11v4c0 1 2 2 5 2s5-1 5-2v-4",
} as const;

export function GlyphIcon({
  path,
  size = 12,
  filled = false,
}: {
  path: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path
        d={path}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Profile paragraph — templates wrap it with their own heading. */
export function SummaryText({
  resume,
  keywordTerms,
  className = "",
}: TemplateRenderProps & { className?: string }) {
  const summary = resume.summary?.trim();
  if (!summary) return null;
  return (
    <div className={`text-[12.5px] leading-relaxed text-body ${className}`}>
      {highlightTerms(summary, keywordTerms)}
    </div>
  );
}

export function hasSummary(resume: Resume): boolean {
  return Boolean(resume.summary?.trim());
}

export function SectionHead({
  children,
  className = "text-primary",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-shead
      className={`text-[12px] font-bold uppercase tracking-[.1em] ${className}`}
    >
      {children}
    </div>
  );
}

export function educationEntries(resume: Resume) {
  return resume.education.filter((e) => e.school || e.degree || e.details);
}

export function experienceEntries(resume: Resume) {
  return resume.experience.filter(
    (e) => e.title || e.org || e.bullets.some((b) => b.trim()),
  );
}

export function EducationItems({ resume, keywordTerms }: TemplateRenderProps) {
  return (
    <>
      {educationEntries(resume).map((e) => (
        <div key={e.id} data-entry>
          <div className="mt-2 flex justify-between gap-3">
            <div className="text-[13.5px] font-semibold text-ink">
              {[e.school, e.degree].filter(Boolean).join(" — ")}
            </div>
            <div className="flex-none text-[12.5px] text-muted">{e.date}</div>
          </div>
          {e.details && (
            <div className="mt-[3px] text-[12.5px] leading-normal text-body">
              {highlightTerms(e.details, keywordTerms)}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

/** Bullet list for one experience entry — ghost/highlight aware. */
export function BulletList({
  exp,
  keywordTerms,
  highlightKey,
  showGhostBullets,
}: {
  exp: Resume["experience"][number];
} & Omit<TemplateRenderProps, "resume">) {
  return (
    <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-[18px]">
      {exp.bullets.map((b, bi) => {
        const key = `${exp.id}:${bi}`;
        if (!b.trim() && !showGhostBullets) return null;
        if (!b.trim()) {
          return (
            <li key={key} className="text-[12.5px] leading-normal text-ghost2">
              {GHOST_BULLET}
            </li>
          );
        }
        return (
          <li
            key={key}
            className={`text-[12.5px] leading-normal text-body ${
              highlightKey === key
                ? "edit-hl -ml-1.5 rounded px-1.5 py-0.5 bg-highlight"
                : ""
            }`}
          >
            {highlightTerms(b, keywordTerms)}
          </li>
        );
      })}
    </ul>
  );
}

export function ExperienceItems(props: TemplateRenderProps) {
  const { resume, ...rest } = props;
  return (
    <>
      {experienceEntries(resume).map((exp, i) => (
        <div key={exp.id} className={i === 0 ? "" : "mt-3.5"}>
          <div data-entry-head className="mt-2 flex justify-between gap-3">
            <div className="text-[13.5px] font-semibold text-ink">
              {[exp.title, exp.org].filter(Boolean).join(" — ")}
            </div>
            <div className="flex-none text-[12.5px] text-muted">{exp.date}</div>
          </div>
          <BulletList exp={exp} {...rest} />
        </div>
      ))}
    </>
  );
}

export function SkillsLine({ resume, keywordTerms }: TemplateRenderProps) {
  return (
    <div className="mt-1.5 text-[12.5px] leading-relaxed text-body">
      {resume.skills.map((s, i) => (
        <span key={s}>
          {i > 0 && " · "}
          {highlightTerms(s, keywordTerms)}
        </span>
      ))}
    </div>
  );
}

/* ---------- composed sections (default chrome) ---------- */

type SectionProps = TemplateRenderProps & { accentClass?: string };

export function EducationSection({ accentClass, ...props }: SectionProps) {
  if (educationEntries(props.resume).length === 0) return null;
  return (
    <div>
      <SectionHead className={accentClass ?? "text-primary"}>
        Education
      </SectionHead>
      <EducationItems {...props} />
    </div>
  );
}

export function ExperienceSection({ accentClass, ...props }: SectionProps) {
  if (experienceEntries(props.resume).length === 0) return null;
  return (
    <div>
      <SectionHead className={accentClass ?? "text-primary"}>
        Experience
      </SectionHead>
      <ExperienceItems {...props} />
    </div>
  );
}

export function SkillsSection({ accentClass, ...props }: SectionProps) {
  if (props.resume.skills.length === 0) return null;
  return (
    <div>
      <SectionHead className={accentClass ?? "text-primary"}>
        Skills
      </SectionHead>
      <SkillsLine {...props} />
    </div>
  );
}
