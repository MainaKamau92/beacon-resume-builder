import type { ReactNode } from "react";
import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  BulletList,
  educationEntries,
  experienceEntries,
  hasSummary,
  highlightTerms,
} from "./shared";

/**
 * "Broadsheet" — an oversized bold-serif nameplate stacked over a thick rule,
 * like a newspaper masthead, with left-aligned serif section heads. Single
 * column and text-based for reliable ATS parsing. Original markup in the
 * style of a high-impact editorial Canva résumé.
 */
function Head({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2.5 mt-6 first:mt-0">
      <div data-shead className="font-serif text-[17px] font-bold text-ink">
        {children}
      </div>
      <div className="mt-1 h-[2px] w-full bg-ink" />
    </div>
  );
}

function Render(props: TemplateRenderProps) {
  const { resume, keywordTerms } = props;
  const c = resume.contact;
  const headline = resume.experience.find((e) => e.title)?.title ?? "";
  const exp = experienceEntries(resume);
  const edu = educationEntries(resume);
  const contacts = [c.email, c.phone, c.location, c.linkedin].filter(Boolean);

  return (
    <div
      className="bg-white px-12 pb-12 pt-11"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      {/* masthead */}
      <h1 className="font-serif text-[46px] font-bold uppercase leading-[.9] tracking-tight text-ink">
        {c.name || "Your Name"}
      </h1>
      <div className="mt-3 h-[3px] w-full bg-ink" />
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {headline && (
          <div className="text-[14px] font-semibold uppercase tracking-[.14em] text-body">
            {headline}
          </div>
        )}
        {contacts.length > 0 && (
          <div className="text-[11.5px] text-muted">{contacts.join("  ·  ")}</div>
        )}
      </div>

      {hasSummary(resume) && (
        <>
          <Head>Profile</Head>
          <div className="text-[12.5px] leading-relaxed text-body">
            {highlightTerms(resume.summary!.trim(), keywordTerms)}
          </div>
        </>
      )}

      {exp.length > 0 && (
        <>
          <Head>Experience</Head>
          <div className="flex flex-col gap-3.5">
            {exp.map((e) => (
              <div key={e.id}>
                <div
                  data-entry-head
                  className="flex items-baseline justify-between gap-3"
                >
                  <div className="text-[14px] font-bold text-ink">
                    {e.title || e.org}
                  </div>
                  <div className="flex-none text-[12px] font-semibold text-muted">
                    {e.date}
                  </div>
                </div>
                {e.org && e.title && (
                  <div className="text-[12.5px] font-semibold uppercase tracking-[.06em] text-body">
                    {e.org}
                  </div>
                )}
                <BulletList
                  exp={e}
                  keywordTerms={keywordTerms}
                  highlightKey={props.highlightKey}
                  showGhostBullets={props.showGhostBullets}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {edu.length > 0 && (
        <>
          <Head>Education</Head>
          <div className="flex flex-col gap-2.5">
            {edu.map((e) => (
              <div key={e.id} data-entry>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[13px] font-bold text-ink">
                    {[e.school, e.degree].filter(Boolean).join(" — ")}
                  </div>
                  <div className="flex-none text-[12px] font-semibold text-muted">
                    {e.date}
                  </div>
                </div>
                {e.details && (
                  <div className="text-[12px] text-body">
                    {highlightTerms(e.details, keywordTerms)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <Head>Skills</Head>
          <div className="text-[12.5px] leading-relaxed text-body">
            {resume.skills.map((s, i) => (
              <span key={s}>
                {i > 0 && "  ·  "}
                {highlightTerms(s, keywordTerms)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const boldSerifNameplate: ResumeTemplateModule = {
  id: "bold-serif-nameplate",
  name: "Masthead",
  ats: 94,
  Render,
};
