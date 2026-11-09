import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationSection,
  ExperienceSection,
  SkillsSection,
  SummaryText,
  contactLine,
  hasSummary,
} from "./shared";

const GRAPHITE_HEAD = "text-[#52606f]";

/** Half-tone nameplate: ink first name, ghosted last name. Graphite calm. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  const [first, ...rest] = (resume.contact.name || "Your Name").split(" ");
  return (
    <div className="px-[48px] py-11">
      <div className="text-[32px] font-bold leading-none tracking-[-.015em]">
        <span className="text-ink">{first}</span>
        {rest.length > 0 && (
          <span className="text-[#b9c4d0]"> {rest.join(" ")}</span>
        )}
      </div>
      <div className="mt-2 text-[12px] text-muted">{contactLine(resume)}</div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-4 max-w-[440px]" />
      )}
      <div className="mt-6 flex flex-col gap-5">
        <ExperienceSection {...props} accentClass={GRAPHITE_HEAD} />
        <EducationSection {...props} accentClass={GRAPHITE_HEAD} />
        <SkillsSection {...props} accentClass={GRAPHITE_HEAD} />
      </div>
    </div>
  );
}

export const tone: ResumeTemplateModule = {
  id: "tone",
  name: "Tone",
  ats: 99,
  Render,
};
