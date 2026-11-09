import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationSection,
  ExperienceSection,
  SkillsSection,
  SummaryText,
  hasSummary,
} from "./shared";

const STEEL = "#33638e";
const STEEL_HEAD = "text-[#33638e]";

/** Striking modern header block over a roomy single column. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  const contact = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
  ].filter(Boolean);
  return (
    <div className="px-[46px] py-9">
      <div className="border-b-2 pb-5" style={{ borderColor: STEEL }}>
        <div className="text-[32px] font-bold leading-tight tracking-[-.015em] text-ink">
          {resume.contact.name || "Your Name"}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {contact.map((v) => (
            <div key={v} className="text-[11.5px] font-medium text-muted">
              {v}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-5">
        {hasSummary(resume) && <SummaryText {...props} />}
        <ExperienceSection {...props} accentClass={STEEL_HEAD} />
        <EducationSection {...props} accentClass={STEEL_HEAD} />
        <SkillsSection {...props} accentClass={STEEL_HEAD} />
      </div>
    </div>
  );
}

export const skyline: ResumeTemplateModule = {
  id: "skyline",
  name: "Skyline",
  ats: 99,
  Render,
};
