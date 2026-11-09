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
  SummaryText,
} from "./shared";

/**
 * "Executive Photo" — navy header band, a photo/monogram over a light-grey
 * left sidebar (contact · skills · languages · reference), and a main column
 * whose sections are marked by round navy icon badges and a vertical
 * timeline. Reverse-engineered in the style of a common two-column Canva
 * layout; original markup. Photo slot renders an initials monogram.
 */

const NAVY = "#323b4c";
const RAIL = "#eef0f3";

function RailHead({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[.12em] first:mt-0"
      style={{ color: NAVY }}
    >
      {children}
      <div className="mt-1 h-px w-8" style={{ background: NAVY }} />
    </div>
  );
}

function MainHead({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div data-shead className="mb-2 flex items-center gap-2.5">
      <span
        className="grid h-6 w-6 flex-none place-items-center rounded-full text-white"
        style={{ background: NAVY }}
      >
        <GlyphIcon path={icon} />
      </span>
      <span
        className="text-[13px] font-bold uppercase tracking-[.1em]"
        style={{ color: NAVY }}
      >
        {children}
      </span>
      <span className="h-px flex-1" style={{ background: "#d5d9df" }} />
    </div>
  );
}

function Render(props: TemplateRenderProps) {
  const { resume, keywordTerms } = props;
  const c = resume.contact;
  const headline = resume.experience.find((e) => e.title)?.title ?? "";
  const contacts: [string, string][] = [
    [GLYPHS.phone, c.phone],
    [GLYPHS.mail, c.email],
    [GLYPHS.pin, c.location],
    [GLYPHS.globe, c.linkedin],
  ];
  const exp = experienceEntries(resume);
  const edu = educationEntries(resume);

  return (
    <div className="relative bg-white" style={{ minHeight: PAGE_MIN_HEIGHT }}>
      {/* header band */}
      <div className="px-8 pb-6 pt-7 pl-[190px]" style={{ background: NAVY }}>
        <h1 className="text-[27px] font-bold uppercase leading-[1.1] tracking-[.02em] text-white">
          {c.name || "Your Name"}
        </h1>
        {headline && (
          <div className="mt-1 text-[13px] uppercase tracking-[.22em] text-[#c3cbd6]">
            {headline}
          </div>
        )}
      </div>

      {/* photo straddling band + sidebar */}
      <div className="absolute left-8 top-[46px]">
        <Avatar
          name={c.name}
          size={118}
          ringClassName="border-white shadow-[0_2px_8px_rgba(0,0,0,.18)]"
          bgClassName="bg-[#5b6b80] text-white"
        />
      </div>

      <div className="grid grid-cols-[34%_1fr]">
        {/* sidebar */}
        <div className="px-6 pb-8 pt-[92px]" style={{ background: RAIL }}>
          <RailHead>Contact</RailHead>
          <div className="flex flex-col gap-2">
            {contacts
              .filter(([, v]) => v)
              .map(([icon, v]) => (
                <div key={v} className="flex items-start gap-2 text-[11px] text-body">
                  <span className="mt-[2px]" style={{ color: NAVY }}>
                    <GlyphIcon path={icon} />
                  </span>
                  <span className="break-words">{v}</span>
                </div>
              ))}
          </div>

          {resume.skills.length > 0 && (
            <>
              <RailHead>Skills</RailHead>
              <ul className="flex flex-col gap-1">
                {resume.skills.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-[11.5px] text-body"
                  >
                    <span
                      className="mt-[6px] h-1 w-1 flex-none rounded-full"
                      style={{ background: NAVY }}
                    />
                    {highlightTerms(s, keywordTerms)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* main column */}
        <div className="px-7 pb-8 pt-7">
          {hasSummary(resume) && (
            <div className="mb-5">
              <MainHead icon={GLYPHS.user}>Profile</MainHead>
              <SummaryText {...props} />
            </div>
          )}

          {exp.length > 0 && (
            <div className="mb-5">
              <MainHead icon={GLYPHS.briefcase}>Work Experience</MainHead>
              <div
                className="flex flex-col gap-3.5 border-l pl-4"
                style={{ borderColor: "#d5d9df" }}
              >
                {exp.map((e) => (
                  <div key={e.id} className="relative">
                    <span
                      className="absolute -left-[21px] top-1 h-2 w-2 rounded-full ring-2 ring-white"
                      style={{ background: NAVY }}
                    />
                    <div data-entry-head className="flex justify-between gap-3">
                      <div className="text-[13px] font-bold text-ink">
                        {e.org || e.title}
                      </div>
                      <div className="flex-none text-[11px] font-medium text-muted">
                        {e.date}
                      </div>
                    </div>
                    {e.org && e.title && (
                      <div className="text-[12px] italic text-muted">
                        {e.title}
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
            </div>
          )}

          {edu.length > 0 && (
            <div>
              <MainHead icon={GLYPHS.cap}>Education</MainHead>
              <div
                className="flex flex-col gap-3 border-l pl-4"
                style={{ borderColor: "#d5d9df" }}
              >
                {edu.map((e) => (
                  <div key={e.id} data-entry className="relative">
                    <span
                      className="absolute -left-[21px] top-1 h-2 w-2 rounded-full ring-2 ring-white"
                      style={{ background: NAVY }}
                    />
                    <div className="flex justify-between gap-3">
                      <div className="text-[13px] font-bold text-ink">
                        {e.degree || e.school}
                      </div>
                      <div className="flex-none text-[11px] font-medium text-muted">
                        {e.date}
                      </div>
                    </div>
                    {e.degree && e.school && (
                      <div className="text-[12px] text-muted">{e.school}</div>
                    )}
                    {e.details && (
                      <div className="mt-0.5 text-[11.5px] text-body">
                        {highlightTerms(e.details, keywordTerms)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const bluePhotoTopleft: ResumeTemplateModule = {
  id: "blue-photo-topleft",
  name: "Executive Photo",
  ats: 62,
  Render,
};
