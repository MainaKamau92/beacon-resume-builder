import type { ReactNode } from "react";
import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  educationEntries,
  experienceEntries,
  GLYPHS,
  GlyphIcon,
  hasSummary,
  highlightTerms,
} from "./shared";

/**
 * "Manuscript" — an elegant all-serif two-column layout: a wide experience/
 * education column beside a hairline-divided sidebar (contact · profile ·
 * skills), with italic serif section flourishes. Original markup in the
 * style of a refined Canva résumé.
 */
function Flourish({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-3 mt-7 text-[24px] italic first:mt-0"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {children}
    </div>
  );
}

function SideHead({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 mt-6 text-[12.5px] font-semibold uppercase tracking-[.16em] text-ink first:mt-0">
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
    [GLYPHS.globe, c.linkedin],
    [GLYPHS.pin, c.location],
  ];

  return (
    <div
      className="bg-white px-10 pb-10 pt-9 font-serif"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      <h1 className="text-[40px] font-semibold leading-none text-ink">
        {c.name || "Your Name"}
      </h1>
      {headline && (
        <div className="mt-1.5 text-[19px] text-body">{headline}</div>
      )}

      <div className="mt-7 grid grid-cols-[1fr_31%] gap-x-8">
        {/* main */}
        <div>
          {exp.length > 0 && (
            <>
              <Flourish>Work Experience</Flourish>
              <div className="flex flex-col gap-5">
                {exp.map((e) => (
                  <div key={e.id}>
                    <div
                      data-entry-head
                      className="text-[13px] font-semibold uppercase tracking-[.08em] text-ink"
                    >
                      {e.title || e.org}
                    </div>
                    <div className="text-[12.5px] italic text-body">
                      {[e.org, e.date].filter(Boolean).join(" | ")}
                    </div>
                    {e.bullets.filter((b) => b.trim()).length > 0 && (
                      <div className="mt-2 flex flex-col gap-0.5 text-[12.5px] leading-normal text-body">
                        {e.bullets
                          .filter((b) => b.trim())
                          .map((b, i) => (
                            <div key={i}>- {highlightTerms(b, keywordTerms)}</div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {edu.length > 0 && (
            <>
              <Flourish>Education</Flourish>
              <div className="flex flex-col gap-3">
                {edu.map((e) => (
                  <div key={e.id} data-entry>
                    <div className="text-[13px] font-semibold uppercase tracking-[.08em] text-ink">
                      {e.degree || e.school}
                    </div>
                    <div className="text-[12.5px] text-body">
                      {[e.school, e.date].filter(Boolean).join(" | ")}
                    </div>
                    {e.details && (
                      <div className="text-[12.5px] italic text-muted">
                        {highlightTerms(e.details, keywordTerms)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* sidebar */}
        <div className="border-l border-line pl-7">
          {contacts.some(([, v]) => v) && (
            <>
              <SideHead>Contact</SideHead>
              <div className="flex flex-col gap-1.5">
                {contacts
                  .filter(([, v]) => v)
                  .map(([icon, v]) => (
                    <div
                      key={v}
                      className="flex items-start gap-2 text-[11.5px] text-body"
                    >
                      <span className="mt-[2px] text-ink">
                        <GlyphIcon path={icon} />
                      </span>
                      <span className="break-words">{v}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
          {hasSummary(resume) && (
            <>
              <SideHead>Personal Profile</SideHead>
              <div className="text-[12px] leading-relaxed text-body">
                {highlightTerms(resume.summary!.trim(), keywordTerms)}
              </div>
            </>
          )}
          {resume.skills.length > 0 && (
            <>
              <SideHead>Expertise</SideHead>
              <div className="flex flex-col gap-1.5 text-[12px] text-body">
                {resume.skills.map((s) => (
                  <div key={s}>{highlightTerms(s, keywordTerms)}</div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const elegantSerifTwocol: ResumeTemplateModule = {
  id: "elegant-serif-twocol",
  name: "Manuscript",
  ats: 78,
  Render,
};
