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
  highlightTerms,
} from "./shared";

/**
 * "Luxe" — a charcoal top band with a gold-ringed photo/monogram and a gold
 * serif display name, over a two-column body (contact · education · skills |
 * experience). Original markup in the style of a premium Canva résumé.
 */
const CHARCOAL = "#2b2b2b";
const GOLD = "#c3a05f";

function SideHead({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-[.1em] text-ink first:mt-0">
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
    [GLYPHS.globe, c.linkedin],
  ];

  return (
    <div className="relative bg-white pt-9" style={{ minHeight: PAGE_MIN_HEIGHT }}>
      {/* charcoal band */}
      <div
        className="px-8 pb-8 pt-[86px] text-center"
        style={{ background: CHARCOAL }}
      >
        <h1
          className="font-serif text-[32px] font-bold uppercase tracking-[.06em]"
          style={{ color: GOLD }}
        >
          {c.name || "Your Name"}
        </h1>
        {headline && (
          <div className="mt-1 text-[14px] tracking-[.12em] text-[#c9c7c2]">
            {headline}
          </div>
        )}
      </div>

      {/* photo straddling the band top */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <Avatar
          name={c.name}
          size={124}
          ringClassName="border-[3px]"
          bgClassName="bg-[#4a4a4a] text-[#e7d7b0]"
          className="!border-[#c3a05f]"
        />
      </div>

      <div className="grid grid-cols-[35%_1fr]">
        {/* left column */}
        <div className="border-r border-line px-7 pb-8 pt-6">
          {contacts.some(([, v]) => v) && (
            <>
              <SideHead>Contact</SideHead>
              <div className="flex flex-col gap-2">
                {contacts
                  .filter(([, v]) => v)
                  .map(([icon, v]) => (
                    <div
                      key={v}
                      className="flex items-start gap-2 text-[11.5px] text-body"
                    >
                      <span className="mt-[2px]" style={{ color: GOLD }}>
                        <GlyphIcon path={icon} />
                      </span>
                      <span className="break-words">{v}</span>
                    </div>
                  ))}
              </div>
            </>
          )}

          {edu.length > 0 && (
            <>
              <SideHead>Education</SideHead>
              <div className="flex flex-col gap-3">
                {edu.map((e) => (
                  <div key={e.id} data-entry>
                    <div className="text-[12.5px] font-bold text-ink">
                      {e.degree || e.school}
                    </div>
                    {e.date && (
                      <div className="text-[11px] text-muted">{e.date}</div>
                    )}
                    {e.degree && e.school && (
                      <div className="text-[11.5px] text-body">{e.school}</div>
                    )}
                    {e.details && (
                      <div className="mt-0.5 text-[11.5px] text-body">
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
              <SideHead>Key Skills</SideHead>
              <ul className="flex flex-col gap-1.5">
                {resume.skills.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-[11.5px] text-body"
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

        {/* right column: experience */}
        <div className="px-8 pb-8 pt-6">
          {exp.length > 0 && (
            <>
              <div
                data-shead
                className="mb-3 text-[15px] font-bold uppercase tracking-[.1em] text-ink"
              >
                Experience
              </div>
              <div className="flex flex-col gap-4">
                {exp.map((e) => (
                  <div key={e.id}>
                    <div
                      data-entry-head
                      className="flex items-baseline justify-between gap-3"
                    >
                      <div className="text-[13.5px] font-bold text-ink">
                        {e.title || e.org}
                      </div>
                      <div
                        className="flex-none text-[10.5px] font-semibold uppercase tracking-[.12em]"
                        style={{ color: GOLD }}
                      >
                        {e.date}
                      </div>
                    </div>
                    {e.org && e.title && (
                      <div className="text-[12.5px] text-muted">{e.org}</div>
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
      </div>
    </div>
  );
}

export const luxuryPhotoGoldBand: ResumeTemplateModule = {
  id: "luxury-photo-gold-band",
  name: "Luxe",
  ats: 63,
  Render,
};
