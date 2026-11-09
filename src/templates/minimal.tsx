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

function Head({ children }: { children: string }) {
  return (
    <div className="border-b border-line pb-1.5 text-[11px] font-semibold uppercase tracking-[.18em] text-ink">
      {children}
    </div>
  );
}

/** No color, hairlines, air. The intro sits bare under the name. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[52px] py-12">
      <div className="text-[27px] font-medium tracking-[-.01em] text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1.5 text-[12px] text-muted">{contactLine(resume)}</div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-5 max-w-[420px] !text-muted" />
      )}
      <div className="mt-8 flex flex-col gap-7">
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

export const minimal: ResumeTemplateModule = {
  id: "minimal",
  name: "Minimal",
  ats: 100,
  Render,
};
