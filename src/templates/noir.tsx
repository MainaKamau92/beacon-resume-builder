import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  GHOST_BULLET,
  contactLine,
  educationEntries,
  experienceEntries,
  hasSummary,
  highlightTerms,
} from "./shared";

const GOLD = "#c9a24b";

function Head({ children }: { children: string }) {
  return (
    <div
      className="text-[11.5px] font-bold uppercase tracking-[.16em]"
      style={{ color: GOLD }}
    >
      {children}
    </div>
  );
}

/** The statement piece: full dark page, white type, gold threads. */
function Render(props: TemplateRenderProps) {
  const { resume, keywordTerms, highlightKey, showGhostBullets } = props;
  return (
    <div
      className="bg-ink px-[50px] py-11 text-white"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      <div className="text-[30px] font-bold tracking-tight">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1.5 text-[11.5px] text-[#9fb0c4]">
        {contactLine(resume)}
      </div>
      <div className="mt-5 h-px" style={{ background: "#3a4a5e" }} />
      <div className="mt-6 flex flex-col gap-6">
        {hasSummary(resume) && (
          <div>
            <Head>Profile</Head>
            <div className="mt-1.5 text-[12.5px] leading-relaxed text-[#d7e0ea]">
              {highlightTerms(resume.summary!.trim(), keywordTerms)}
            </div>
          </div>
        )}
        {experienceEntries(resume).length > 0 && (
          <div>
            <Head>Experience</Head>
            {experienceEntries(resume).map((exp) => (
              <div key={exp.id} className="mt-2.5">
                <div className="flex justify-between gap-3">
                  <div className="text-[13.5px] font-semibold text-white">
                    {[exp.title, exp.org].filter(Boolean).join(" — ")}
                  </div>
                  <div className="flex-none text-[12px] text-[#9fb0c4]">
                    {exp.date}
                  </div>
                </div>
                <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-[18px]">
                  {exp.bullets.map((b, bi) => {
                    const key = `${exp.id}:${bi}`;
                    if (!b.trim() && !showGhostBullets) return null;
                    return (
                      <li
                        key={key}
                        className={`text-[12.5px] leading-normal ${
                          !b.trim()
                            ? "text-[#5b6b7d]"
                            : highlightKey === key
                              ? "-ml-1.5 rounded bg-[#25344a] px-1.5 py-0.5 text-[#d7e0ea]"
                              : "text-[#d7e0ea]"
                        }`}
                      >
                        {b.trim()
                          ? highlightTerms(b, keywordTerms)
                          : GHOST_BULLET}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
        {educationEntries(resume).length > 0 && (
          <div>
            <Head>Education</Head>
            {educationEntries(resume).map((e) => (
              <div key={e.id} className="mt-2.5">
                <div className="flex justify-between gap-3">
                  <div className="text-[13.5px] font-semibold text-white">
                    {[e.school, e.degree].filter(Boolean).join(" — ")}
                  </div>
                  <div className="flex-none text-[12px] text-[#9fb0c4]">
                    {e.date}
                  </div>
                </div>
                {e.details && (
                  <div className="mt-[3px] text-[12.5px] leading-normal text-[#d7e0ea]">
                    {highlightTerms(e.details, keywordTerms)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {resume.skills.length > 0 && (
          <div>
            <Head>Skills</Head>
            <div className="mt-1.5 text-[12.5px] leading-relaxed text-[#d7e0ea]">
              {resume.skills.map((s, i) => (
                <span key={s}>
                  {i > 0 && " · "}
                  {highlightTerms(s, keywordTerms)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const noir: ResumeTemplateModule = {
  id: "noir",
  name: "Noir",
  ats: 88,
  Render,
};
