import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationSection,
  ExperienceSection,
  SectionHead,
  SkillsSection,
  SummaryText,
  contactLine,
  hasSummary,
} from "./shared";

/** The house style: structured blue, single column, thin ink rule. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[46px] py-10">
      <div className="text-[26px] font-bold tracking-tight text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1 text-[12.5px] text-muted">{contactLine(resume)}</div>
      <div className="mb-3.5 mt-[18px] h-px bg-ink" />
      <div className="flex flex-col gap-5">
        {hasSummary(resume) && (
          <div>
            <SectionHead>Profile</SectionHead>
            <SummaryText {...props} className="mt-1.5" />
          </div>
        )}
        <ExperienceSection {...props} />
        <EducationSection {...props} />
        <SkillsSection {...props} />
      </div>
    </div>
  );
}

export const classic: ResumeTemplateModule = {
  id: "classic",
  name: "Classic",
  ats: 100,
  Render,
};
