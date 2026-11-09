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
    <div className="bg-ink px-2 py-1 text-[11px] font-bold uppercase tracking-[.14em] text-white">
      {children}
    </div>
  );
}

/** Swiss grid: black blocks, hard alignment, zero ornament. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[46px] py-10">
      <div className="text-[30px] font-bold uppercase leading-none tracking-[-.01em] text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-2 border-t-2 border-ink pt-2 text-[11.5px] font-medium text-body">
        {contactLine(resume)}
      </div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-4 max-w-[440px]" />
      )}
      <div className="mt-6 flex flex-col gap-6">
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

export const metro: ResumeTemplateModule = {
  id: "metro",
  name: "Metro",
  ats: 98,
  Render,
};
