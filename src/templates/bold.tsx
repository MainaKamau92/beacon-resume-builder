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

const EMBER = "#c2410c";

function Head({ children }: { children: string }) {
  return (
    <div>
      <div className="text-[13px] font-bold uppercase tracking-[.08em] text-ink">
        {children}
      </div>
      <div
        className="mt-1 h-[3px] w-9 rounded-sm"
        style={{ background: EMBER }}
      />
    </div>
  );
}

/** Oversized ember nameplate and chunky markers — loud on purpose. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[46px] py-10">
      <div
        className="text-[36px] font-bold leading-none tracking-[-.02em]"
        style={{ color: EMBER }}
      >
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-2 text-[12.5px] text-muted">{contactLine(resume)}</div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-4 max-w-[440px]" />
      )}
      <div className="mt-7 flex flex-col gap-6">
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

export const bold: ResumeTemplateModule = {
  id: "bold",
  name: "Bold",
  ats: 96,
  Render,
};
