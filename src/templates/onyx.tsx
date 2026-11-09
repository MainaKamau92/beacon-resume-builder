import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationSection,
  ExperienceSection,
  SkillsSection,
  SummaryText,
  contactLine,
  hasSummary,
  initialsOf,
} from "./shared";

const GOLD = "#b8860b";
const GOLD_HEAD = "text-[#b8860b]";

/** Dark masthead with a gold monogram tile — striking, single column. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div>
      <div className="flex items-center gap-4 bg-ink px-[46px] py-7">
        <div
          className="grid h-12 w-12 flex-none place-items-center rounded-[10px] text-[18px] font-bold text-white"
          style={{ background: GOLD }}
        >
          {initialsOf(resume.contact.name)}
        </div>
        <div>
          <div className="text-[24px] font-bold tracking-tight text-white">
            {resume.contact.name || "Your Name"}
          </div>
          <div className="mt-0.5 text-[11.5px] text-[#9fb0c4]">
            {contactLine(resume)}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 px-[46px] py-8">
        {hasSummary(resume) && (
          <div>
            <div
              className={`text-[12px] font-bold uppercase tracking-[.1em] ${GOLD_HEAD}`}
            >
              Profile
            </div>
            <SummaryText {...props} className="mt-1.5" />
          </div>
        )}
        <ExperienceSection {...props} accentClass={GOLD_HEAD} />
        <EducationSection {...props} accentClass={GOLD_HEAD} />
        <SkillsSection {...props} accentClass={GOLD_HEAD} />
      </div>
    </div>
  );
}

export const onyx: ResumeTemplateModule = {
  id: "onyx",
  name: "Onyx",
  ats: 94,
  Render,
};
