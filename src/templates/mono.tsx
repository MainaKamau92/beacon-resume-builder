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

const TERMINAL = "#0f766e";

function Head({ children }: { children: string }) {
  return (
    <div className="font-mono text-[11px] font-medium uppercase tracking-[.12em] text-ink">
      <span style={{ color: TERMINAL }}>##</span> {children}
    </div>
  );
}

/** Typewriter accents for tech roles — reads like a well-kept README. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[46px] py-10">
      <div className="font-mono text-[22px] font-medium tracking-tight text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1.5 font-mono text-[11px] text-muted">
        {contactLine(resume)}
      </div>
      {hasSummary(resume) && (
        <div className="mt-4 border-l-2 pl-3" style={{ borderColor: TERMINAL }}>
          <SummaryText {...props} className="!text-[12px]" />
        </div>
      )}
      <div className="my-5 border-t border-dashed border-input2" />
      <div className="flex flex-col gap-6">
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

export const mono: ResumeTemplateModule = {
  id: "mono",
  name: "Mono",
  ats: 98,
  Render,
};
