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

const GOLD = "#b08c3e";

function Head({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="font-serif text-[13px] font-semibold uppercase tracking-[.16em] text-ink">
        {children}
      </div>
      <div className="h-px flex-1" style={{ background: "#dfd7c4" }} />
    </div>
  );
}

/** Charcoal serif with a gold thread — senior and understated. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[50px] py-11">
      <div className="text-center">
        <div className="font-serif text-[29px] font-bold uppercase tracking-[.12em] text-ink">
          {resume.contact.name || "Your Name"}
        </div>
        <div
          className="mx-auto mt-3 h-[2px] w-16"
          style={{ background: GOLD }}
        />
        <div className="mt-3 text-[11.5px] tracking-[.02em] text-muted">
          {contactLine(resume)}
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-6">
        {hasSummary(resume) && (
          <SummaryText
            {...props}
            className="text-center font-serif !text-[13px] italic !leading-relaxed"
          />
        )}
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

export const executive: ResumeTemplateModule = {
  id: "executive",
  name: "Executive",
  ats: 100,
  Render,
};
