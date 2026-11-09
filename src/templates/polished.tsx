import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationItems,
  ExperienceItems,
  SkillsLine,
  SummaryText,
  contactLine,
  educationEntries,
  experienceEntries,
  hasSummary,
} from "./shared";

const TAUPE = "#8c7a5b";

function Head({ children }: { children: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <div
        className="text-[12px] font-semibold uppercase tracking-[.14em]"
        style={{ color: TAUPE }}
      >
        {children}
      </div>
      <div className="h-px flex-1 bg-[#e8e3d8]" />
    </div>
  );
}

/** Warm, readable elegance — small-caps name, taupe threads. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[50px] py-11">
      <div className="text-[24px] font-semibold uppercase tracking-[.1em] text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1.5 text-[12px] text-muted">{contactLine(resume)}</div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-4 max-w-[440px]" />
      )}
      <div className="mt-7 flex flex-col gap-6">
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
            <SkillsLine {...props} />
          </div>
        )}
      </div>
    </div>
  );
}

export const polished: ResumeTemplateModule = {
  id: "polished",
  name: "Polished",
  ats: 100,
  Render,
};
