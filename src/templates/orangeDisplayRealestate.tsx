import type { ReactNode } from "react";
import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  contactLine,
  educationEntries,
  experienceEntries,
  hasSummary,
  highlightTerms,
} from "./shared";

/**
 * "Broadsheet" — an oversized serif name framed by hairline rules, orange
 * "+" section markers, and two-column entries (bold title/date beside the
 * description). Original markup in the style of an elegant editorial Canva
 * résumé.
 */
const ORANGE = "#f26a1b";

function Head({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-7 first:mt-0">
      <div
        data-shead
        className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[.12em]"
        style={{ color: ORANGE }}
      >
        <span className="text-[18px] leading-none">+</span>
        {children}
      </div>
      <div className="mt-2 h-px w-full bg-line" />
    </div>
  );
}

function Entry({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string[];
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[38%_1fr] gap-4 py-1">
      <div data-entry-head>
        <div className="text-[13px] font-bold text-ink">{title}</div>
        {meta.filter(Boolean).map((m) => (
          <div key={m} className="text-[12px] italic text-muted">
            {m}
          </div>
        ))}
      </div>
      <div className="text-[12px] leading-relaxed text-body">{children}</div>
    </div>
  );
}

function Render(props: TemplateRenderProps) {
  const { resume, keywordTerms } = props;
  const c = resume.contact;
  const headline = resume.experience.find((e) => e.title)?.title ?? "";
  const exp = experienceEntries(resume);
  const edu = educationEntries(resume);

  return (
    <div
      className="bg-white px-10 pb-8 pt-9"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      {/* framed header */}
      <div className="border-y border-ink/80 py-4">
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-serif text-[42px] font-medium uppercase leading-[.92] tracking-[.01em] text-ink">
            {c.name || "Your Name"}
          </h1>
          {headline && (
            <div
              className="pb-1 text-right text-[19px] font-medium uppercase leading-tight"
              style={{ color: ORANGE }}
            >
              {headline}
            </div>
          )}
        </div>
      </div>

      {hasSummary(resume) && (
        <>
          <Head>Personal Profile</Head>
          <div className="text-[12px] leading-relaxed text-body">
            {highlightTerms(resume.summary!.trim(), keywordTerms)}
          </div>
        </>
      )}

      {exp.length > 0 && (
        <>
          <Head>Work Experience</Head>
          <div className="flex flex-col gap-3">
            {exp.map((e) => (
              <Entry
                key={e.id}
                title={e.title || e.org}
                meta={[e.date, e.org]}
              >
                {e.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="flex list-disc flex-col gap-1 pl-4">
                    {e.bullets
                      .filter((b) => b.trim())
                      .map((b, i) => (
                        <li key={i}>{highlightTerms(b, keywordTerms)}</li>
                      ))}
                  </ul>
                )}
              </Entry>
            ))}
          </div>
        </>
      )}

      {edu.length > 0 && (
        <>
          <Head>Education</Head>
          <div className="flex flex-col gap-2">
            {edu.map((e) => (
              <Entry key={e.id} title={e.school || e.degree} meta={[e.date]}>
                <div>{e.degree}</div>
                {e.details && (
                  <div className="text-muted">
                    {highlightTerms(e.details, keywordTerms)}
                  </div>
                )}
              </Entry>
            ))}
          </div>
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <Head>Skills</Head>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            {resume.skills.map((s) => (
              <div
                key={s}
                className="flex items-start gap-2 text-[12px] text-body"
              >
                <span className="mt-[6px] h-1 w-1 flex-none rounded-full bg-muted" />
                {highlightTerms(s, keywordTerms)}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-7 flex justify-between border-t border-line pt-3 text-[11.5px] text-muted">
        {contactLine(resume) || " "}
      </div>
    </div>
  );
}

export const orangeDisplayRealestate: ResumeTemplateModule = {
  id: "orange-display-realestate",
  name: "Broadsheet",
  ats: 72,
  Render,
};
