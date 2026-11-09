import type { ReactNode } from "react";
import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  educationEntries,
  experienceEntries,
  hasSummary,
  highlightTerms,
  initialsOf,
} from "./shared";

/**
 * "Atelier" — an elegant all-serif layout: soft peach sidebar (profile,
 * contact, skills) beside a charcoal name band and a white main column with
 * experience + education. A round monogram emblem straddles the seam.
 * Original markup in the style of a creative Canva résumé.
 */
const PEACH = "#fbe0d3";
const CHARCOAL = "#333a48";

function SideHead({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-2.5 mt-8 text-[13px] font-bold uppercase tracking-[.08em] first:mt-0"
      style={{ color: CHARCOAL }}
    >
      {children}
    </div>
  );
}

function MainHead({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-3 mt-7 text-[15px] font-bold uppercase tracking-[.08em] first:mt-0"
      style={{ color: CHARCOAL }}
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
  const contactLines = [c.phone, c.email, c.linkedin, c.location].filter(
    Boolean,
  );

  return (
    <div
      className="relative font-serif"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      {/* charcoal name band overlays the top-right; the flowing columns below
          start past it so multi-page content paginates cleanly */}
      <div
        className="absolute right-0 top-0 flex h-[150px] flex-col justify-center pl-[84px] pr-8"
        style={{ left: "37%", background: CHARCOAL }}
      >
        <h1 className="text-[25px] font-bold uppercase tracking-[.05em] text-white">
          {c.name || "Your Name"}
        </h1>
        {headline && (
          <div className="mt-1 text-[14px] text-[#c9ccd3]">{headline}</div>
        )}
      </div>

      {/* monogram emblem straddling the seam */}
      <div
        className="absolute z-10 grid h-[104px] w-[104px] place-items-center rounded-full border-2 border-dashed bg-white text-[26px] font-bold"
        style={{
          left: "37%",
          top: 24,
          transform: "translateX(-50%)",
          borderColor: "#d9b7a6",
          color: CHARCOAL,
        }}
      >
        {initialsOf(c.name)}
      </div>

      <div className="grid grid-cols-[37%_1fr]">
      {/* peach sidebar */}
      <div className="px-7 pb-8 pt-[172px]" style={{ background: PEACH }}>
        {hasSummary(resume) && (
          <>
            <SideHead>Personal Profile</SideHead>
            <div className="text-[12px] leading-relaxed" style={{ color: CHARCOAL }}>
              {highlightTerms(resume.summary!.trim(), keywordTerms)}
            </div>
          </>
        )}
        {contactLines.length > 0 && (
          <>
            <SideHead>Get in Touch</SideHead>
            <div className="flex flex-col gap-1 text-[12px]" style={{ color: CHARCOAL }}>
              {contactLines.map((v) => (
                <div key={v} className="break-words">
                  {v}
                </div>
              ))}
            </div>
          </>
        )}
        {resume.skills.length > 0 && (
          <>
            <SideHead>Skills &amp; Abilities</SideHead>
            <div className="flex flex-col gap-[3px] text-[12px]" style={{ color: CHARCOAL }}>
              {resume.skills.map((s) => (
                <div key={s}>{highlightTerms(s, keywordTerms)}</div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* right column: white body (band is overlaid above) */}
      <div className="bg-white">
        <div className="px-8 pb-9 pt-[172px]">
          {exp.length > 0 && (
            <>
              <MainHead>Experience</MainHead>
              <div className="flex flex-col gap-4">
                {exp.map((e) => (
                  <div key={e.id}>
                    <div
                      data-entry-head
                      className="text-[13.5px] font-bold"
                      style={{ color: CHARCOAL }}
                    >
                      {e.title || e.org}
                    </div>
                    <div className="text-[12.5px] italic text-muted">
                      {[e.org, e.date].filter(Boolean).join(" · ")}
                    </div>
                    {e.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4">
                        {e.bullets
                          .filter((b) => b.trim())
                          .map((b, i) => (
                            <li
                              key={i}
                              className="text-[12px] leading-normal text-body"
                            >
                              {highlightTerms(b, keywordTerms)}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {edu.length > 0 && (
            <>
              <MainHead>Education</MainHead>
              <div className="flex flex-col gap-3">
                {edu.map((e) => (
                  <div key={e.id} data-entry>
                    <div
                      className="text-[13px] font-bold"
                      style={{ color: CHARCOAL }}
                    >
                      {e.school || e.degree}
                    </div>
                    <div className="text-[12.5px] text-muted">
                      {[e.degree, e.date].filter(Boolean).join(", ")}
                    </div>
                    {e.details && (
                      <div className="mt-0.5 text-[12px] text-body">
                        {highlightTerms(e.details, keywordTerms)}
                      </div>
                    )}
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

export const coralSidebarStylist: ResumeTemplateModule = {
  id: "coral-sidebar-stylist",
  name: "Atelier",
  ats: 64,
  Render,
};
