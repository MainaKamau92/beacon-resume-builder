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
 * "Devlog" — a developer résumé in the style of a source file: monospace
 * type, a comment-styled name banner, and `// section` markers. Single
 * column and fully text-based, so it stays ATS-safe. Original markup in the
 * style of a code-themed Canva résumé.
 */
// content colors meet WCAG AA (>=4.5:1 on white): green 5.1:1, blue 5.4:1
const COMMENT = "#4a7a2e"; // editor comment/string green
const KEYWORD = "#2b6cb0"; // keyword blue

function Head({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-2.5 mt-6 font-mono text-[13px] font-semibold first:mt-0"
      style={{ color: COMMENT }}
    >
      <span style={{ color: "#8a8a8a" }}>{"// "}</span>
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
  const contacts = [c.email, c.phone, c.location, c.linkedin].filter(Boolean);

  return (
    <div
      className="bg-white px-11 pb-11 pt-9 font-mono"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      {/* comment-block header */}
      <div
        className="rounded-md border-l-[3px] py-3 pl-4 pr-3"
        style={{ borderColor: COMMENT, background: "#f6f8f4" }}
      >
        <div className="text-[12px]" style={{ color: COMMENT }}>
          {"/**"}
        </div>
        <div className="pl-3">
          <div className="text-[22px] font-bold leading-tight text-ink">
            <span style={{ color: "#8a8a8a" }}>* </span>
            {c.name || "Your Name"}
          </div>
          {headline && (
            <div className="text-[13px]" style={{ color: KEYWORD }}>
              <span style={{ color: "#8a8a8a" }}>* </span>
              {headline}
            </div>
          )}
        </div>
        <div className="text-[12px]" style={{ color: COMMENT }}>
          {" */"}
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[11.5px] text-body">
          <span style={{ color: "#8a8a8a" }}>const</span>
          <span style={{ color: KEYWORD }}>contact</span>
          <span style={{ color: "#8a8a8a" }}>= [</span>
          {contacts.map((v, i) => (
            <span key={v}>
              <span style={{ color: COMMENT }}>&quot;{v}&quot;</span>
              {i < contacts.length - 1 && (
                <span style={{ color: "#8a8a8a" }}>,</span>
              )}
            </span>
          ))}
          <span style={{ color: "#8a8a8a" }}>];</span>
        </div>
      )}

      {hasSummary(resume) && (
        <>
          <Head>summary</Head>
          <div className="text-[12px] leading-relaxed text-body">
            {highlightTerms(resume.summary!.trim(), keywordTerms)}
          </div>
        </>
      )}

      {exp.length > 0 && (
        <>
          <Head>experience</Head>
          <div className="flex flex-col gap-4">
            {exp.map((e) => (
              <div key={e.id}>
                <div
                  data-entry-head
                  className="flex items-baseline justify-between gap-3"
                >
                  <div className="text-[13px] font-bold text-ink">
                    {e.title || e.org}
                  </div>
                  <div className="flex-none text-[11.5px] text-muted">
                    {e.date}
                  </div>
                </div>
                {e.org && e.title && (
                  <div className="text-[12px]" style={{ color: KEYWORD }}>
                    {e.org}
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

      {resume.skills.length > 0 && (
        <>
          <Head>skills</Head>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s) => (
              <span
                key={s}
                className="rounded border px-2 py-[3px] text-[11.5px] text-body"
                style={{ borderColor: "#dfe3da", background: "#f6f8f4" }}
              >
                {highlightTerms(s, keywordTerms)}
              </span>
            ))}
          </div>
        </>
      )}

      {edu.length > 0 && (
        <>
          <Head>education</Head>
          <div className="flex flex-col gap-2.5">
            {edu.map((e) => (
              <div key={e.id} data-entry>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[12.5px] font-bold text-ink">
                    {e.degree || e.school}
                  </div>
                  <div className="flex-none text-[11.5px] text-muted">
                    {e.date}
                  </div>
                </div>
                {e.degree && e.school && (
                  <div className="text-[12px] text-body">{e.school}</div>
                )}
                {e.details && (
                  <div className="text-[11.5px] text-muted">
                    {highlightTerms(e.details, keywordTerms)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const codeCommentDev: ResumeTemplateModule = {
  id: "code-comment-dev",
  name: "Devlog",
  ats: 92,
  Render,
};
