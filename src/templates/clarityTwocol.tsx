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
 * "Clarity" — a clean greyscale two-column layout: bold name, a role
 * timeline in the wide column, and education + skills in the narrow column,
 * each section underlined by a hairline. Original markup in the style of a
 * modern professional Canva résumé.
 */
const DARK = "#3a4553";

function Head({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-6 first:mt-0">
      <div
        data-shead
        className="text-[15px] font-bold tracking-[.01em]"
        style={{ color: DARK }}
      >
        {children}
      </div>
      <div className="mt-1.5 h-px w-full bg-line" />
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
      className="bg-white px-10 pb-10 pt-9"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      <h1
        className="text-[38px] font-extrabold leading-none"
        style={{ color: DARK }}
      >
        {c.name || "Your Name"}
      </h1>
      {headline && (
        <div className="mt-1.5 text-[16px] text-muted">{headline}</div>
      )}
      <div className="mt-3 flex flex-wrap gap-x-7 gap-y-1.5">
        {contacts
          .filter(([, v]) => v)
          .map(([icon, v]) => (
            <div
              key={v}
              className="flex items-center gap-2 text-[12px] text-body"
            >
              <span
                className="grid h-[18px] w-[18px] place-items-center rounded-full text-white"
                style={{ background: DARK }}
              >
                <GlyphIcon path={icon} size={10} />
              </span>
              {v}
            </div>
          ))}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_34%] gap-x-9">
        {/* main */}
        <div>
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
              <div
                className="flex flex-col gap-4 border-l-2 pl-4"
                style={{ borderColor: "#e2e5ea" }}
              >
                {exp.map((e) => (
                  <div key={e.id} className="relative">
                    <span
                      className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white"
                      style={{ background: DARK }}
                    />
                    <div
                      data-entry-head
                      className="text-[13.5px] font-bold text-ink"
                    >
                      {e.title || e.org}
                    </div>
                    <div className="text-[12.5px] text-body">{e.org}</div>
                    {e.date && (
                      <div className="text-[12px] italic text-muted">
                        {e.date}
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
            </>
          )}
        </div>

        {/* sidebar */}
        <div>
          {edu.length > 0 && (
            <>
              <Head>Education</Head>
              <div className="flex flex-col gap-3">
                {edu.map((e) => (
                  <div key={e.id} data-entry>
                    <div className="text-[13px] font-bold text-ink">
                      {e.school || e.degree}
                    </div>
                    <div className="text-[12px] text-body">{e.degree}</div>
                    {e.date && (
                      <div className="text-[12px] text-muted">{e.date}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {resume.skills.length > 0 && (
            <>
              <Head>Skills</Head>
              <ul className="flex flex-col gap-1.5">
                {resume.skills.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-[12px] text-body"
                  >
                    <span
                      className="mt-[6px] h-1 w-1 flex-none rounded-full"
                      style={{ background: DARK }}
                    />
                    {highlightTerms(s, keywordTerms)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const clarityTwocol: ResumeTemplateModule = {
  id: "light-twocol-marketing",
  name: "Clarity",
  ats: 80,
  Render,
};
