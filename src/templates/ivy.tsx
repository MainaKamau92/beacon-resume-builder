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

const CRIMSON = "#8a1f2d";

function Head({ children }: { children: string }) {
  return (
    <div
      className="border-b pb-1 font-serif text-[12px] font-semibold uppercase tracking-[.14em]"
      style={{ color: CRIMSON, borderColor: "#d8c2c5" }}
    >
      {children}
    </div>
  );
}

/** The academic classic in crimson: centered serif name, ruled sections. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[48px] py-10">
      <div className="text-center">
        <div className="font-serif text-[22px] font-bold uppercase tracking-[.18em] text-ink">
          {resume.contact.name || "Your Name"}
        </div>
        <div className="mt-1.5 text-[11.5px] text-muted">
          {contactLine(resume)}
        </div>
      </div>
      <div className="mt-7 flex flex-col gap-5">
        {hasSummary(resume) && (
          <div>
            <Head>Profile</Head>
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
            <Head>Skills & Interests</Head>
            <SkillsLine {...props} />
          </div>
        )}
      </div>
    </div>
  );
}

export const ivy: ResumeTemplateModule = {
  id: "ivy",
  name: "Ivy",
  ats: 100,
  Render,
};
