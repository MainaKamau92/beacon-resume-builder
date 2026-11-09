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
 * "Stone" — a warm-grey Swiss layout: an oversized black name in a rule-
 * divided sidebar (contact · education · skills) beside a summary +
 * experience column. Original markup in the style of a bold minimalist
 * Canva résumé.
 */
const STONE = "#dcdcd4";

function SideBlock({
  title,
  children,
  first = false,
}: {
  title: string;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={first ? "" : "mt-5 border-t border-black/20 pt-5"}
    >
      <div className="mb-2 text-[14px] font-bold uppercase tracking-[.04em] text-black">
        {title}
      </div>
      {children}
    </div>
  );
}

function MainHead({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-2.5 mt-6 text-[15px] font-bold uppercase tracking-[.04em] text-black first:mt-0"
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
    <div
      className="grid grid-cols-[38%_1fr]"
      style={{ minHeight: PAGE_MIN_HEIGHT, background: STONE }}
    >
      {/* sidebar */}
      <div className="border-r border-black/25 px-7 pb-8 pt-8">
        <h1 className="text-[38px] font-black uppercase leading-[.92] text-black">
          {c.name || "Your Name"}
        </h1>
        {headline && (
          <div className="mt-2 text-[16px] text-black/70">{headline}</div>
        )}
        <div className="mt-4 flex flex-col gap-2">
          {contacts
            .filter(([, v]) => v)
            .map(([icon, v]) => (
              <div key={v} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-black text-white">
                  <GlyphIcon path={icon} size={10} />
                </span>
                <span className="text-[11.5px] text-black/80">{v}</span>
              </div>
            ))}
        </div>

        {edu.length > 0 && (
          <SideBlock title="Education">
            <div className="flex flex-col gap-3">
              {edu.map((e) => (
                <div key={e.id} data-entry>
                  <div className="text-[12.5px] font-bold text-black">
                    {e.degree || e.school}
                  </div>
                  <div className="text-[11.5px] text-black/70">
                    {[e.school, e.date].filter(Boolean).join(" | ")}
                  </div>
                  {e.details && (
                    <div className="text-[11.5px] text-black/60">
                      {highlightTerms(e.details, keywordTerms)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SideBlock>
        )}

        {resume.skills.length > 0 && (
          <SideBlock title="Skills">
            <ul className="flex flex-col gap-1">
              {resume.skills.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2 text-[11.5px] text-black/80"
                >
                  <span className="mt-[6px] h-1 w-1 flex-none rounded-full bg-black" />
                  {highlightTerms(s, keywordTerms)}
                </li>
              ))}
            </ul>
          </SideBlock>
        )}
      </div>

      {/* main */}
      <div className="px-8 pb-8 pt-8">
        {hasSummary(resume) && (
          <>
            <MainHead>Summary</MainHead>
            <div className="text-[12px] leading-relaxed text-black/85">
              {highlightTerms(resume.summary!.trim(), keywordTerms)}
            </div>
          </>
        )}
        {exp.length > 0 && (
          <>
            <MainHead>Work Experience</MainHead>
            <div className="flex flex-col gap-4">
              {exp.map((e) => (
                <div key={e.id}>
                  <div
                    data-entry-head
                    className="text-[13.5px] font-bold text-black"
                  >
                    {e.org || e.title}
                  </div>
                  <div className="text-[12.5px] text-black/70">
                    {[e.title, e.date].filter(Boolean).join("  |  ")}
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
  );
}

export const stoneSwiss: ResumeTemplateModule = {
  id: "gray-sidebar-designer",
  name: "Stone",
  ats: 76,
  Render,
};
