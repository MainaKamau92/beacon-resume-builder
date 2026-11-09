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

const ROSE = "#b0716f";

function Head({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="font-serif text-[14px] font-semibold italic"
        style={{ color: ROSE }}
      >
        {children}
      </div>
      <div className="h-px flex-1 bg-[#ecdcdb]" />
    </div>
  );
}

/** Fine lines and a serif italic voice — attractive and friendly. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[52px] py-12">
      <div className="text-center">
        <div className="font-serif text-[30px] font-semibold tracking-[.01em] text-ink">
          {resume.contact.name || "Your Name"}
        </div>
        <div className="mt-1.5 text-[11.5px] tracking-[.03em] text-muted">
          {contactLine(resume)}
        </div>
        {hasSummary(resume) && (
          <SummaryText
            {...props}
            className="mx-auto mt-4 max-w-[420px] !text-muted"
          />
        )}
      </div>
      <div className="mt-8 flex flex-col gap-6">
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

export const elegant: ResumeTemplateModule = {
  id: "elegant",
  name: "Elegant",
  ats: 99,
  Render,
};
