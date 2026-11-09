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
 * "Scholar Deco" — navy nested-chevron motifs in the corners, a heavy
 * condensed name over a serif academic body in two columns. Original markup
 * in the style of an academic Canva résumé.
 */
const NAVY = "#2e2e5c";

function Chevron({ dir }: { dir: "up" | "down" }) {
  const N = 4;
  const step = 13;
  const arm = 34;
  const baseHalf = 26;
  const cx = 100;
  const lines = Array.from({ length: N }).map((_, i) => {
    const hw = baseHalf + i * step;
    if (dir === "up") {
      const y = 8 + i * step;
      return `M ${cx - hw} ${y + arm} L ${cx} ${y} L ${cx + hw} ${y + arm}`;
    }
    const y = 92 - i * step;
    return `M ${cx - hw} ${y - arm} L ${cx} ${y} L ${cx + hw} ${y - arm}`;
  });
  return (
    <svg viewBox="0 0 200 100" width="150" height="75" aria-hidden>
      {lines.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={NAVY}
          strokeWidth={4}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function Head({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-2.5 mt-7 text-[17px] font-black uppercase tracking-[.06em] first:mt-0"
      style={{ color: NAVY }}
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
      className="relative overflow-hidden bg-white px-10 pb-16 pt-[92px] font-serif"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      <div className="absolute left-[10%] top-3">
        <Chevron dir="up" />
      </div>
      <div className="absolute right-[10%] top-3">
        <Chevron dir="up" />
      </div>
      <div className="absolute bottom-3 left-[10%]">
        <Chevron dir="down" />
      </div>
      <div className="absolute bottom-3 right-[10%]">
        <Chevron dir="down" />
      </div>

      {/* header */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1
            className="font-sans text-[38px] font-black uppercase leading-none tracking-[.02em]"
            style={{ color: NAVY }}
          >
            {c.name || "Your Name"}
          </h1>
          {headline && (
            <div className="mt-2 text-[18px] italic text-ink">{headline}</div>
          )}
        </div>
        <div className="pt-1 text-right text-[12px] text-body">
          {contactLines.map((v) => (
            <div key={v}>{v}</div>
          ))}
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-x-9">
        {/* left */}
        <div>
          {hasSummary(resume) && (
            <>
              <Head>Profile</Head>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-[12.5px] leading-normal text-body">
                {resume
                  .summary!.split(/\.\s+/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((s, i) => (
                    <li key={i}>
                      {highlightTerms(s.replace(/\.$/, "") + ".", keywordTerms)}
                    </li>
                  ))}
              </ul>
            </>
          )}
          {edu.length > 0 && (
            <>
              <Head>Academic Qualifications</Head>
              <div className="flex flex-col gap-3">
                {edu.map((e) => (
                  <div key={e.id} data-entry>
                    <div className="text-[13px] font-bold uppercase text-ink">
                      {e.degree || e.school}
                    </div>
                    <div className="text-[12.5px] italic text-body">
                      {[e.school, e.date].filter(Boolean).join(", ")}
                    </div>
                    {e.details && (
                      <div className="text-[12.5px] italic text-muted">
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
              <Head>Skills</Head>
              <div className="text-[12.5px] leading-relaxed text-body">
                {resume.skills.map((s, i) => (
                  <span key={s}>
                    {i > 0 && " · "}
                    {highlightTerms(s, keywordTerms)}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* right */}
        <div>
          {exp.length > 0 && (
            <>
              <Head>Academic Employment</Head>
              <div className="flex flex-col gap-4">
                {exp.map((e) => (
                  <div key={e.id}>
                    <div
                      data-entry-head
                      className="text-[13px] font-bold uppercase tracking-wide"
                      style={{ color: NAVY }}
                    >
                      {e.title || e.org}
                    </div>
                    <div className="text-[12.5px] italic text-body">
                      {[e.org, e.date].filter(Boolean).join(" ")}
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

export const purpleAcademicChevron: ResumeTemplateModule = {
  id: "purple-academic-chevron",
  name: "Scholar Deco",
  ats: 68,
  Render,
};
