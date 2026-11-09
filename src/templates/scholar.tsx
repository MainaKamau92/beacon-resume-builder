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
    <div className="border-b border-ink pb-0.5 font-serif text-[13px] font-bold text-ink">
      {children}
    </div>
  );
}

/** The CV: all serif, education first, dense and unadorned. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[52px] py-11 [&_*]:!font-serif">
      <div className="text-center">
        <div className="text-[24px] font-bold text-ink">
          {resume.contact.name || "Your Name"}
        </div>
        <div className="mt-1 text-[11.5px] text-muted">
          {contactLine(resume)}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-5">
        {hasSummary(resume) && (
          <div>
            <Head>Research Interests & Profile</Head>
            <SummaryText {...props} className="mt-2" />
          </div>
        )}
        {educationEntries(resume).length > 0 && (
          <div>
            <Head>Education</Head>
            <EducationItems {...props} />
          </div>
        )}
        {experienceEntries(resume).length > 0 && (
          <div>
            <Head>Experience</Head>
            <ExperienceItems {...props} />
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

export const scholar: ResumeTemplateModule = {
  id: "scholar",
  name: "Scholar",
  ats: 100,
  Render,
};
