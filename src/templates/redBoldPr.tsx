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
 * "Editorial" — a light-grey editorial layout: an oversized serif display
 * name, red serif section heads, and two columns of content with a faint
 * monogram watermark. Original markup in the style of a bold PR/creative
 * Canva résumé.
 */
const RED = "#ef4b45";
const BG = "#e8e8e8";

function Head({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-3 mt-7 font-serif text-[22px] font-bold first:mt-0"
      style={{ color: RED }}
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
  const contactLines = [
    c.location && `Home: ${c.location}`,
    c.phone && `Phone: ${c.phone}`,
    c.email && `Email: ${c.email}`,
    c.linkedin,
  ].filter(Boolean) as string[];

  return (
    <div
      className="relative overflow-hidden px-10 pb-10 pt-9"
      style={{ minHeight: PAGE_MIN_HEIGHT, background: BG }}
    >
      <div
        className="pointer-events-none absolute -bottom-10 right-2 select-none font-serif text-[190px] font-black leading-none text-black/[.05]"
        aria-hidden
      >
        {initialsOf(c.name)}
      </div>

      <h1 className="font-serif text-[46px] font-black leading-[.95] text-ink">
        {c.name || "Your Name"}
      </h1>
      {headline && (
        <div
          className="mt-1 text-[17px] font-medium uppercase tracking-[.32em]"
          style={{ color: RED }}
        >
          {headline}
        </div>
      )}

      <div className="relative mt-6 grid grid-cols-2 gap-x-9">
        {/* left */}
        <div>
          {hasSummary(resume) && (
            <>
              <Head>Executive Summary</Head>
              <div className="text-[12px] leading-relaxed text-body">
                {highlightTerms(resume.summary!.trim(), keywordTerms)}
              </div>
            </>
          )}
          {contactLines.length > 0 && (
            <>
              <Head>Contact Details</Head>
              <div className="flex flex-col gap-0.5 text-[12px] text-body">
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
              <Head>Skills &amp; Interests</Head>
              <div className="flex flex-col gap-0.5 text-[12px] text-body">
                {resume.skills.map((s) => (
                  <div key={s}>- {highlightTerms(s, keywordTerms)}</div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* right */}
        <div>
          {exp.length > 0 && (
            <>
              <Head>Professional Career</Head>
              <div className="flex flex-col gap-4">
                {exp.map((e) => (
                  <div key={e.id}>
                    <div
                      data-entry-head
                      className="text-[13px] font-bold uppercase text-ink"
                    >
                      {e.title || e.org}
                    </div>
                    <div className="text-[12px] italic" style={{ color: RED }}>
                      {[e.org, e.date].filter(Boolean).join(" | ")}
                    </div>
                    {e.bullets.filter((b) => b.trim()).length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5 text-[12px] leading-normal text-body">
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
              <Head>Education History</Head>
              <div className="flex flex-col gap-3">
                {edu.map((e) => (
                  <div key={e.id} data-entry>
                    <div className="text-[13px] font-bold uppercase text-ink">
                      {e.school || e.degree}
                    </div>
                    <div className="text-[12px] italic" style={{ color: RED }}>
                      {[e.degree, e.date].filter(Boolean).join(" | ")}
                    </div>
                    {e.details && (
                      <div className="mt-0.5 text-[12px] leading-normal text-body">
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

export const redBoldPr: ResumeTemplateModule = {
  id: "red-bold-pr",
  name: "Editorial",
  ats: 70,
  Render,
};
