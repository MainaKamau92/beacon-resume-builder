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
 * "Quill" — an airy serif résumé with generous whitespace, a light-weight
 * name, and tiny letter-spaced section labels. Single column and text-based
 * for clean ATS parsing. Serif comes from the app's --font-serif (Source
 * Serif 4, loaded via next/font) so preview and PDF match exactly; the small
 * labels use --font-sans. Original markup in the style of a minimalist
 * editorial Canva résumé.
 */
function Head({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-3 mt-8 font-sans text-[11px] font-semibold uppercase tracking-[.28em] text-muted first:mt-0"
    >
      {children}
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
      className="bg-white px-14 pb-14 pt-14 font-serif"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      <h1 className="text-[34px] font-normal leading-none tracking-tight text-ink">
        {c.name || "Your Name"}
      </h1>
      {headline && (
        <div className="mt-3 text-[15px] italic text-body">{headline}</div>
      )}
      {contacts.length > 0 && (
        <div className="mt-4 font-sans text-[11.5px] tracking-[.04em] text-muted">
          {contacts.join("   /   ")}
        </div>
      )}
      <div className="mt-8 h-px w-full bg-ink/15" />

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
          <div className="flex flex-col gap-5">
            {exp.map((e) => (
              <div key={e.id}>
                <div data-entry-head>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-[15px] text-ink">
                      {e.title || e.org}
                    </div>
                    <div className="flex-none font-sans text-[11px] tracking-[.04em] text-muted">
                      {e.date}
                    </div>
                  </div>
                  {e.org && e.title && (
                    <div className="text-[13px] italic text-body">{e.org}</div>
                  )}
                </div>
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
          <div className="flex flex-col gap-3">
            {edu.map((e) => (
              <div key={e.id} data-entry>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[13.5px] text-ink">
                    {[e.school, e.degree].filter(Boolean).join(", ")}
                  </div>
                  <div className="flex-none font-sans text-[11px] tracking-[.04em] text-muted">
                    {e.date}
                  </div>
                </div>
                {e.details && (
                  <div className="text-[12.5px] italic text-body">
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
  );
}

export const airySerifMinimal: ResumeTemplateModule = {
  id: "airy-serif-minimal",
  name: "Quill",
  ats: 95,
  Render,
};
