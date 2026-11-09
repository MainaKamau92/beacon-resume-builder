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
 * "Emblem" — a traditional single-column résumé anchored by a double-ruled
 * name box up top, with centered small-caps section rules. Reads cleanly for
 * ATS while feeling formal and printed. Original markup in the style of a
 * classic bordered Canva résumé.
 */
function Head({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2.5 mt-5 flex items-center gap-3 first:mt-0">
      <div
        data-shead
        className="flex-none text-[12.5px] font-bold uppercase tracking-[.18em] text-ink"
      >
        {children}
      </div>
      <div className="h-px flex-1 bg-ink/25" />
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
      className="bg-white px-12 pb-11 pt-10"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      {/* double-ruled name plate */}
      <div className="border-y-[3px] border-ink py-4 text-center">
        <div className="border-y border-ink/30 py-3">
          <h1 className="text-[30px] font-bold uppercase tracking-[.14em] text-ink">
            {c.name || "Your Name"}
          </h1>
          {headline && (
            <div className="mt-1 text-[13px] uppercase tracking-[.22em] text-muted">
              {headline}
            </div>
          )}
        </div>
      </div>
      {contacts.length > 0 && (
        <div className="mt-3 text-center text-[12px] text-body">
          {contacts.join("   ·   ")}
        </div>
      )}

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
                  <div className="text-[13.5px] font-bold text-ink">
                    {e.title || e.org}
                  </div>
                  <div className="flex-none text-[12px] italic text-muted">
                    {e.date}
                  </div>
                </div>
                {e.org && e.title && (
                  <div className="text-[12.5px] italic text-body">{e.org}</div>
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
                  <div className="flex-none text-[12px] italic text-muted">
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
                {i > 0 && "   ·   "}
                {highlightTerms(s, keywordTerms)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const classicBorderedName: ResumeTemplateModule = {
  id: "classic-bordered-name",
  name: "Emblem",
  ats: 97,
  Render,
};
