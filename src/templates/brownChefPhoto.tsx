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
  initialsOf,
} from "./shared";

/**
 * "Culinary" — warm cream layout with a tall photo panel, round contact
 * badges and skills in a left column, and a bold italic display name over
 * profile / education / experience on the right. Soft organic blobs in the
 * corners. Original markup in the style of a creative Canva résumé.
 */
const CREAM = "#f4f0ea";
const BROWN = "#5f5147";
const TAN = "#c3a892";
const DARK = "#3d3228";

function Blob({ style, fill }: { style: React.CSSProperties; fill: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute"
      style={style}
      aria-hidden
    >
      <path
        fill={fill}
        d="M43 -60C57 -50 70 -37 74 -22C78 -6 73 12 64 27C55 42 42 54 26 62C10 70 -9 74 -27 69C-45 64 -62 50 -70 32C-78 14 -77 -8 -69 -26C-61 -44 -46 -58 -29 -66C-12 -74 7 -76 24 -73C31 -71 35 -68 43 -60Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

function MainHead({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-2.5 mt-6 text-[16px] font-extrabold uppercase tracking-[.06em]"
      style={{ color: BROWN }}
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
    [GLYPHS.globe, c.linkedin],
    [GLYPHS.pin, c.location],
  ];

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: PAGE_MIN_HEIGHT, background: CREAM }}
    >
      <Blob style={{ top: -95, right: -85, width: 200 }} fill={TAN} />
      <Blob style={{ bottom: -80, left: -70, width: 240 }} fill={DARK} />
      <Blob style={{ bottom: -50, right: -50, width: 180, opacity: 0.9 }} fill={TAN} />

      <div className="relative grid grid-cols-[42%_1fr]">
        {/* left column */}
        <div>
          <div
            className="grid h-[330px] w-full place-items-center text-[110px] font-bold"
            style={{ background: "#dfd5c8", color: "#8a7a6b" }}
          >
            {initialsOf(c.name)}
          </div>
          <div className="px-7 pb-8 pt-6">
            {contacts.some(([, v]) => v) && (
              <>
                <MainHead>Contact</MainHead>
                <div className="flex flex-col gap-2.5">
                  {contacts
                    .filter(([, v]) => v)
                    .map(([icon, v]) => (
                      <div key={v} className="flex items-center gap-2.5">
                        <span
                          className="grid h-6 w-6 flex-none place-items-center rounded-full text-white"
                          style={{ background: BROWN }}
                        >
                          <GlyphIcon path={icon} size={11} />
                        </span>
                        <span className="text-[11.5px] text-body">{v}</span>
                      </div>
                    ))}
                </div>
              </>
            )}
            {resume.skills.length > 0 && (
              <>
                <MainHead>Skills</MainHead>
                <ul className="flex flex-col gap-1">
                  {resume.skills.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 text-[12px] font-semibold"
                      style={{ color: BROWN }}
                    >
                      <span
                        className="mt-[7px] h-1 w-1 flex-none rounded-full"
                        style={{ background: BROWN }}
                      />
                      {highlightTerms(s, keywordTerms)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* right column */}
        <div className="px-7 pb-9 pt-8">
          <h1
            className="text-[30px] font-extrabold italic uppercase leading-[1.02]"
            style={{ color: BROWN }}
          >
            {c.name || "Your Name"}
          </h1>
          {headline && (
            <div
              className="mt-1.5 text-[15px] uppercase tracking-[.3em]"
              style={{ color: "#8a7a6b" }}
            >
              {headline}
            </div>
          )}

          {hasSummary(resume) && (
            <div className="mt-4 text-[12px] leading-relaxed text-body">
              {highlightTerms(resume.summary!.trim(), keywordTerms)}
            </div>
          )}

          {edu.length > 0 && (
            <>
              <MainHead>Education</MainHead>
              <div className="flex flex-col gap-2.5">
                {edu.map((e) => (
                  <div key={e.id} data-entry>
                    <div className="text-[13px] font-bold" style={{ color: DARK }}>
                      {[e.school, e.date].filter(Boolean).join(", ")}
                    </div>
                    {e.degree && (
                      <div className="text-[12px] text-body">{e.degree}</div>
                    )}
                    {e.details && (
                      <div className="text-[12px] font-semibold" style={{ color: BROWN }}>
                        {highlightTerms(e.details, keywordTerms)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {exp.length > 0 && (
            <>
              <MainHead>Experience</MainHead>
              <div className="flex flex-col gap-3.5">
                {exp.map((e) => (
                  <div key={e.id}>
                    <div
                      data-entry-head
                      className="text-[13.5px] font-bold"
                      style={{ color: DARK }}
                    >
                      {e.title || e.org}
                    </div>
                    <div className="text-[12px] text-muted">
                      {[e.org, e.date].filter(Boolean).join(" · ")}
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
        </div>
      </div>
    </div>
  );
}

export const brownChefPhoto: ResumeTemplateModule = {
  id: "brown-chef-photo",
  name: "Culinary",
  ats: 58,
  Render,
};
