import type { ReactNode } from "react";
import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  BulletList,
  educationEntries,
  experienceEntries,
  GLYPHS,
  GlyphIcon,
  hasSummary,
  highlightTerms,
} from "./shared";

/**
 * "Regent" — a slate header band with a gold name and gold contact icons,
 * over a single-column body with right-aligned dates and an education/skills
 * split. Original markup in the style of an executive Canva résumé.
 */
const SLATE = "#34495e";
const GOLD = "#c9a86a";

function Head({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-2.5 mt-6 text-[15px] font-bold uppercase tracking-[.06em] text-ink first:mt-0"
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
  const contacts: [string, string][] = [
    [GLYPHS.phone, c.phone],
    [GLYPHS.mail, c.email],
    [GLYPHS.pin, c.location],
  ];

  return (
    <div className="bg-white" style={{ minHeight: PAGE_MIN_HEIGHT }}>
      <div className="px-9 pb-6 pt-8" style={{ background: SLATE }}>
        <h1
          className="text-[32px] font-bold uppercase tracking-[.04em]"
          style={{ color: GOLD }}
        >
          {c.name || "Your Name"}
        </h1>
        {headline && (
          <div className="mt-0.5 text-[15px] font-semibold text-white">
            {headline}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-x-7 gap-y-1.5">
          {contacts
            .filter(([, v]) => v)
            .map(([icon, v]) => (
              <div
                key={v}
                className="flex items-center gap-2 text-[12px] text-[#dfe4ea]"
              >
                <span style={{ color: GOLD }}>
                  <GlyphIcon path={icon} />
                </span>
                {v}
              </div>
            ))}
        </div>
      </div>

      <div className="px-9 pb-9 pt-5">
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
            <div className="flex flex-col gap-3.5">
              {exp.map((e) => (
                <div key={e.id}>
                  <div
                    data-entry-head
                    className="flex items-baseline justify-between gap-3"
                  >
                    <div className="text-[13.5px] font-bold text-ink">
                      {[e.title, e.org].filter(Boolean).join(", ")}
                    </div>
                    <div className="flex-none text-[12.5px] font-semibold text-muted">
                      {e.date}
                    </div>
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

        <div className="grid grid-cols-2 gap-x-9">
          <div>
            {edu.length > 0 && (
              <>
                <Head>Education</Head>
                <div className="flex flex-col gap-3">
                  {edu.map((e) => (
                    <div key={e.id} data-entry>
                      <div className="text-[13px] font-bold text-ink">
                        {e.degree || e.school}
                      </div>
                      <div className="text-[12px] text-body">
                        {[e.school, e.date].filter(Boolean).join(" | ")}
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
          </div>
          <div>
            {resume.skills.length > 0 && (
              <>
                <Head>Key Skills</Head>
                <div className="flex flex-col gap-1.5">
                  {resume.skills.map((s) => (
                    <div
                      key={s}
                      className="flex items-start gap-2 text-[12px] text-body"
                    >
                      <span
                        className="mt-[6px] h-1 w-1 flex-none rounded-full"
                        style={{ background: SLATE }}
                      />
                      {highlightTerms(s, keywordTerms)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const regentSlateBand: ResumeTemplateModule = {
  id: "teal-name-band",
  name: "Regent",
  ats: 82,
  Render,
};
