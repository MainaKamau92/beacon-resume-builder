import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationSection,
  ExperienceSection,
  SkillsSection,
  SummaryText,
  contactLine,
  hasSummary,
} from "./shared";

const BURGUNDY = "#7c2d3e";
const BURGUNDY_HEAD = "text-[#7c2d3e]";

/** Centered header over a bold burgundy rule — warm and a touch formal. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[46px] py-10">
      <div className="text-center">
        <div className="text-[26px] font-bold tracking-tight text-ink">
          {resume.contact.name || "Your Name"}
        </div>
        <div className="mt-1 text-[12.5px] text-muted">
          {contactLine(resume)}
        </div>
      </div>
      <div
        className="mb-4 mt-[18px] h-[3px] rounded-sm"
        style={{ background: BURGUNDY }}
      />
      <div className="flex flex-col gap-5">
        {hasSummary(resume) && (
          <SummaryText {...props} className="text-center" />
        )}
        <ExperienceSection {...props} accentClass={BURGUNDY_HEAD} />
        <EducationSection {...props} accentClass={BURGUNDY_HEAD} />
        <SkillsSection {...props} accentClass={BURGUNDY_HEAD} />
      </div>
    </div>
  );
}

export const centered: ResumeTemplateModule = {
  id: "centered",
  name: "Centered",
  ats: 100,
  Render,
};
