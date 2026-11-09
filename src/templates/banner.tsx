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

const TEAL = "#0f6b63";
const TEAL_HEAD = "text-[#0f6b63]";

/** Deep-teal masthead with a two-line nameplate; airy single column. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  const [first, ...rest] = (resume.contact.name || "Your Name").split(" ");
  return (
    <div>
      <div className="px-[46px] py-8 text-white" style={{ background: TEAL }}>
        <div className="text-[30px] font-bold leading-[1.05] tracking-tight">
          <span className="font-normal">{first}</span>
          {rest.length > 0 && <> {rest.join(" ")}</>}
        </div>
        <div className="mt-2 text-[11.5px] text-[#bfe0dc]">
          {contactLine(resume)}
        </div>
        {hasSummary(resume) && (
          <SummaryText
            {...props}
            className="mt-3 max-w-[430px] !text-[12px] !text-[#e2f2f0]"
          />
        )}
      </div>
      <div className="flex flex-col gap-5 px-[46px] py-8">
        <ExperienceSection {...props} accentClass={TEAL_HEAD} />
        <EducationSection {...props} accentClass={TEAL_HEAD} />
        <SkillsSection {...props} accentClass={TEAL_HEAD} />
      </div>
    </div>
  );
}

export const banner: ResumeTemplateModule = {
  id: "banner",
  name: "Banner",
  ats: 97,
  Render,
};
