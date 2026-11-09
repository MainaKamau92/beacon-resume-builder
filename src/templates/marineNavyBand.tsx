import type { ReactNode } from "react";
import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  BulletList,
  contactLine,
  educationEntries,
  experienceEntries,
  hasSummary,
  highlightTerms,
} from "./shared";

/**
 * "Marine" — a full-width navy header band with a centered spaced name, over
 * a single-column body with navy rule-underlined section heads (education and
 * skills split into two sub-columns). Clean and ATS-friendly. Original markup
 * in the style of a corporate Canva résumé.
 */
const NAVY = "#1e3a5f";

function Head({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-6 first:mt-0">
      <div
        data-shead
        className="text-[15px] font-bold uppercase tracking-[.08em]"
        style={{ color: NAVY }}
      >
        {children}
      </div>
      <div className="mt-1 h-px w-full" style={{ background: NAVY }} />
    </div>
  );
}

function Render(props: TemplateRenderProps) {
  const { resume, keywordTerms } = props;
  const c = resume.contact;
  const exp = experienceEntries(resume);
  const edu = educationEntries(resume);

  return (
    <div className="bg-white" style={{ minHeight: PAGE_MIN_HEIGHT }}>
      <div className="px-8 py-8 text-center text-white" style={{ background: NAVY }}>
        <h1 className="text-[30px] font-medium uppercase tracking-[.2em]">
          {c.name || "Your Name"}
        </h1>
        {contactLine(resume) && (
          <div className="mt-2 text-[12px] tracking-wide text-[#cdd7e2]">
            {contactLine(resume)}
          </div>
        )}
      </div>

      <div className="px-9 pb-9 pt-6">
        {hasSummary(resume) && (
          <>
            <Head>Summary</Head>
            <div className="text-[12px] leading-relaxed text-body">
              {highlightTerms(resume.summary!.trim(), keywordTerms)}
            </div>
          </>
        )}

        {exp.length > 0 && (
          <>
            <Head>Work Experience</Head>
            <div className="flex flex-col gap-4">
              {exp.map((e) => (
                <div key={e.id}>
                  <div
                    data-entry-head
                    className="text-[13.5px] font-bold text-ink"
                  >
                    {e.title || e.org}
                  </div>
                  <div className="text-[12.5px] text-muted">
                    {[e.org, e.date].filter(Boolean).join("  |  ")}
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
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {edu.map((e) => (
                <div key={e.id} data-entry>
                  <div className="text-[13px] font-bold text-ink">
                    {e.degree || e.school}
                  </div>
                  <div className="text-[12px] text-body">
                    {[e.school, e.date].filter(Boolean).join(" · ")}
                  </div>
                  {e.details && (
                    <div className="text-[12px] text-muted">
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
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {resume.skills.map((s) => (
                <div
                  key={s}
                  className="flex items-start gap-2 text-[12px] text-body"
                >
                  <span
                    className="mt-[6px] h-1 w-1 flex-none rounded-full"
                    style={{ background: NAVY }}
                  />
                  {highlightTerms(s, keywordTerms)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const marineNavyBand: ResumeTemplateModule = {
  id: "navy-header-band",
  name: "Marine",
  ats: 84,
  Render,
};
