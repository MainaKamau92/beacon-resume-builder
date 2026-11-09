import type { ReactNode } from "react";
import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  Avatar,
  BulletList,
  educationEntries,
  experienceEntries,
  GLYPHS,
  GlyphIcon,
  hasSummary,
  highlightTerms,
} from "./shared";

/**
 * "Navy Rail" — bold left name column with a profile + a dotted timeline of
 * roles, and a dark navy right rail holding the photo/monogram, contact,
 * education, and skills. Gold hairline under each rail heading. Original
 * markup in the style of a common two-column Canva résumé.
 */
const NAVY = "#2f3846";
const GOLD = "#c8a86a";

function MainHead({ children }: { children: ReactNode }) {
  return (
    <div data-shead className="mb-2 mt-6 first:mt-0">
      <div className="text-[15px] font-extrabold uppercase tracking-[.14em] text-ink">
        {children}
      </div>
      <div className="mt-1.5 h-[2px] w-full bg-ink/85" />
    </div>
  );
}

function RailHead({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 mt-6 first:mt-0">
      <div className="text-[13px] font-bold uppercase tracking-[.16em] text-white">
        {children}
      </div>
      <div className="mt-1.5 h-px w-10" style={{ background: GOLD }} />
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
    [GLYPHS.globe, c.linkedin],
  ];

  return (
    <div
      className="grid grid-cols-[1fr_35%] bg-white"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      {/* main column */}
      <div className="px-8 pb-8 pt-9">
        <h1 className="text-[34px] font-extrabold uppercase leading-[.98] tracking-[-.01em] text-ink">
          {c.name || "Your Name"}
        </h1>
        {headline && (
          <div className="mt-1 text-[16px] uppercase tracking-[.2em] text-muted">
            {headline}
          </div>
        )}

        {hasSummary(resume) && (
          <>
            <MainHead>Profile</MainHead>
            <div className="text-[12px] leading-relaxed text-body">
              {highlightTerms(resume.summary!.trim(), keywordTerms)}
            </div>
          </>
        )}

        {exp.length > 0 && (
          <>
            <MainHead>Work Experience</MainHead>
            <div
              className="flex flex-col gap-3.5 border-l-2 pl-4"
              style={{ borderColor: "#e0e3e8" }}
            >
              {exp.map((e) => (
                <div key={e.id} className="relative">
                  <span
                    className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white"
                    style={{ background: NAVY }}
                  />
                  <div data-entry-head className="flex justify-between gap-3">
                    <div className="text-[13px] font-bold text-ink">
                      {e.org || e.title}
                    </div>
                    <div className="flex-none text-[11px] text-muted">
                      {e.date}
                    </div>
                  </div>
                  {e.org && e.title && (
                    <div className="text-[12px] text-muted">{e.title}</div>
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
      </div>

      {/* navy rail */}
      <div className="px-6 pb-8 pt-8 text-white" style={{ background: NAVY }}>
        <div className="flex justify-center">
          <Avatar
            name={c.name}
            size={132}
            height={150}
            shape="rounded"
            ringClassName="border-white/90"
            bgClassName="bg-white/12 text-white"
          />
        </div>

        <RailHead>Contact</RailHead>
        <div className="flex flex-col gap-2">
          {contacts
            .filter(([, v]) => v)
            .map(([icon, v]) => (
              <div
                key={v}
                className="flex items-start gap-2 text-[11px] text-[#d6dbe2]"
              >
                <span className="mt-[2px]" style={{ color: GOLD }}>
                  <GlyphIcon path={icon} />
                </span>
                <span className="break-words">{v}</span>
              </div>
            ))}
        </div>

        {edu.length > 0 && (
          <>
            <RailHead>Education</RailHead>
            <div className="flex flex-col gap-3">
              {edu.map((e) => (
                <div key={e.id} data-entry>
                  {e.date && (
                    <div
                      className="text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: GOLD }}
                    >
                      {e.date}
                    </div>
                  )}
                  <div className="text-[12px] font-semibold text-white">
                    {e.school || e.degree}
                  </div>
                  {e.school && e.degree && (
                    <div className="text-[11.5px] text-[#c4cbd4]">
                      {e.degree}
                    </div>
                  )}
                  {e.details && (
                    <div className="mt-0.5 text-[11px] text-[#aeb6c1]">
                      {e.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {resume.skills.length > 0 && (
          <>
            <RailHead>Skills</RailHead>
            <ul className="flex flex-col gap-1.5">
              {resume.skills.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2 text-[11.5px] text-[#d6dbe2]"
                >
                  <span
                    className="mt-[6px] h-1 w-1 flex-none rounded-full"
                    style={{ background: GOLD }}
                  />
                  {highlightTerms(s, keywordTerms)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export const navyPhotoSidebar: ResumeTemplateModule = {
  id: "navy-photo-sidebar",
  name: "Navy Rail",
  ats: 60,
  Render,
};
