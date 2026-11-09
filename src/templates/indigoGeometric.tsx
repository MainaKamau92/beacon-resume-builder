import type { ReactNode } from "react";
import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  BulletList,
  educationEntries,
  experienceEntries,
  hasSummary,
  highlightTerms,
} from "./shared";

/**
 * "Orbit" — overlapping black + indigo circles in the top corner, an indigo
 * serif display name, and a clean two-column body. Original markup in the
 * style of a modern geometric Canva résumé.
 */
const INDIGO = "#3b46f0";

function Head({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-2.5 mt-7 text-[14px] font-extrabold uppercase tracking-[.04em] first:mt-0"
      style={{ color: INDIGO }}
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
      className="relative overflow-hidden bg-white px-10 pb-9 pt-9"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      {/* geometric corner */}
      <div className="pointer-events-none absolute -right-12 -top-16 h-[220px] w-[220px] rounded-full bg-black" />
      <div
        className="pointer-events-none absolute right-16 top-[74px] h-[188px] w-[188px] rounded-full"
        style={{ background: INDIGO }}
      />

      <div className="relative max-w-[64%]">
        <h1
          className="font-serif text-[38px] font-medium uppercase leading-[.98]"
          style={{ color: INDIGO }}
        >
          {c.name || "Your Name"}
        </h1>
        {headline && (
          <div className="mt-1 text-[16px] font-bold text-ink">{headline}</div>
        )}
      </div>

      <div className="relative mt-[132px] grid grid-cols-2 gap-x-9">
        {/* left */}
        <div>
          {hasSummary(resume) && (
            <>
              <Head>Professional Profile</Head>
              <div className="text-[12px] leading-relaxed text-body">
                {highlightTerms(resume.summary!.trim(), keywordTerms)}
              </div>
            </>
          )}
          {contactLines.length > 0 && (
            <>
              <Head>Contact Details</Head>
              <ul className="flex list-disc flex-col gap-0.5 pl-4 text-[12px] text-body">
                {contactLines.map((v) => (
                  <li key={v} className="break-words">
                    {v}
                  </li>
                ))}
              </ul>
            </>
          )}
          {resume.skills.length > 0 && (
            <>
              <Head>Skills &amp; Abilities</Head>
              <ul className="flex flex-col gap-0.5 text-[12px] text-body">
                {resume.skills.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span
                      className="mt-[6px] h-[5px] w-[5px] flex-none"
                      style={{ background: INDIGO }}
                    />
                    {highlightTerms(s, keywordTerms)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* right */}
        <div>
          {exp.length > 0 && (
            <>
              <Head>Work Experience</Head>
              <div className="flex flex-col gap-3.5">
                {exp.map((e) => (
                  <div key={e.id}>
                    <div
                      data-entry-head
                      className="text-[13px] font-bold italic text-ink"
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
          {edu.length > 0 && (
            <>
              <Head>Previous Education</Head>
              <div className="flex flex-col gap-3">
                {edu.map((e) => (
                  <div key={e.id} data-entry>
                    <div className="text-[13px] font-bold italic text-ink">
                      {e.school || e.degree}
                    </div>
                    <div className="text-[12px] text-body">
                      {[e.degree, e.date].filter(Boolean).join(", ")}
                    </div>
                    {e.details && (
                      <div className="mt-0.5 text-[12px] text-muted">
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
  );
}

export const indigoGeometric: ResumeTemplateModule = {
  id: "indigo-geometric",
  name: "Orbit",
  ats: 71,
  Render,
};
