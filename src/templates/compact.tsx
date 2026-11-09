import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationSection,
  ExperienceSection,
  SkillsSection,
  SummaryText,
  contactLine,
  hasSummary,
} from "./shared";

const VIOLET = "#6d28d9";
const VIOLET_HEAD = "text-[#6d28d9]";

/** Two-column, dense, violet accents — fits more onto one page. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[22px] font-bold tracking-tight text-ink">
            {resume.contact.name || "Your Name"}
          </div>
          <div className="mt-1 text-[11.5px] text-muted">
            {contactLine(resume)}
          </div>
        </div>
        <div
          className="h-[26px] w-[26px] flex-none rounded-md"
          style={{ background: VIOLET }}
        />
      </div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-3 !text-[12px]" />
      )}
      <div className="mt-5 grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-5">
          <EducationSection {...props} accentClass={VIOLET_HEAD} />
          <SkillsSection {...props} accentClass={VIOLET_HEAD} />
        </div>
        <ExperienceSection {...props} accentClass={VIOLET_HEAD} />
      </div>
    </div>
  );
}

export const compact: ResumeTemplateModule = {
  id: "compact",
  name: "Compact",
  ats: 94,
  Render,
};
