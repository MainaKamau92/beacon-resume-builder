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
 * "Playbill" — a charcoal serif résumé with a full-width dark name band and
 * centered small-caps section titles flanked by rules, like a theatre
 * programme. The centered motif lives in the name band and section rules;
 * body content is left-aligned so entry headers sit naturally above their
 * bullets. Serif comes from --font-serif (Source Serif 4, next/font) so
 * preview and PDF match. Original markup in the style of a dramatic
 * editorial Canva résumé.
 */
const CHAR = "#2a2a2a";

function Head({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-center gap-4 first:mt-0">
      <div className="h-px flex-1 bg-ink/20" />
      <div
        data-shead
        className="flex-none text-[12px] font-semibold uppercase tracking-[.24em] text-ink"
      >
        {children}
      </div>
      <div className="h-px flex-1 bg-ink/20" />
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
    <div className="bg-white font-serif" style={{ minHeight: PAGE_MIN_HEIGHT }}>
      {/* charcoal name band */}
      <div className="px-12 py-8 text-center" style={{ background: CHAR }}>
        <h1 className="text-[32px] font-normal uppercase tracking-[.16em] text-white">
          {c.name || "Your Name"}
        </h1>
        {headline && (
          <div className="mt-2 text-[13px] italic tracking-[.06em] text-white/75">
            {headline}
          </div>
        )}
      </div>

      <div className="px-12 pb-12 pt-6">
        {contacts.length > 0 && (
          <div className="text-center text-[12px] tracking-[.03em] text-body">
            {contacts.join("   ·   ")}
          </div>
        )}

        {hasSummary(resume) && (
          <>
            <Head>Profile</Head>
            <div className="text-[13px] leading-[1.7] text-body">
              {highlightTerms(resume.summary!.trim(), keywordTerms)}
            </div>
          </>
        )}

        {exp.length > 0 && (
          <>
            <Head>Experience</Head>
            <div className="flex flex-col gap-4">
              {exp.map((e) => (
                <div key={e.id}>
                  <div
                    data-entry-head
                    className="flex items-baseline justify-between gap-3"
                  >
                    <div className="text-[14.5px] font-bold text-ink">
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
                    <div className="text-[13.5px] font-bold text-ink">
                      {[e.school, e.degree].filter(Boolean).join(" — ")}
                    </div>
                    <div className="flex-none text-[12px] italic text-muted">
                      {e.date}
                    </div>
                  </div>
                  {e.details && (
                    <div className="text-[12px] italic text-body">
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
            <div className="text-[13px] leading-[1.7] text-body">
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
    </div>
  );
}

export const charcoalPlaywrightSerif: ResumeTemplateModule = {
  id: "charcoal-playwright-serif",
  name: "Playbill",
  ats: 93,
  Render,
};
