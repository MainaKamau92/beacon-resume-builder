import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationItems,
  ExperienceItems,
  SummaryText,
  contactLine,
  educationEntries,
  experienceEntries,
  hasSummary,
} from "./shared";

const LILAC_TEXT = "#5b54a8";
const LILAC_BG = "#ece9f7";

function Head({ children }: { children: string }) {
  return (
    <div
      className="inline-block rounded-md px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[.08em]"
      style={{ background: LILAC_BG, color: LILAC_TEXT }}
    >
      {children}
    </div>
  );
}

/** Soft lilac blocks, open white space — friendly and light. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[50px] py-11">
      <div className="text-[27px] font-bold tracking-tight text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1 text-[12px] text-muted">{contactLine(resume)}</div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-4 max-w-[440px]" />
      )}
      <div className="mt-7 flex flex-col gap-7">
        {experienceEntries(resume).length > 0 && (
          <div>
            <Head>Experience</Head>
            <ExperienceItems {...props} />
          </div>
        )}
        {educationEntries(resume).length > 0 && (
          <div>
            <Head>Education</Head>
            <EducationItems {...props} />
          </div>
        )}
        {resume.skills.length > 0 && (
          <div>
            <Head>Skills</Head>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {resume.skills.map((s) => (
                <div
                  key={s}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ background: "#e6f3ee", color: "#25725d" }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const pastel: ResumeTemplateModule = {
  id: "pastel",
  name: "Pastel",
  ats: 96,
  Render,
};
