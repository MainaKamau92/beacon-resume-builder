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

/** Each section gets its own color pop — playful but structured. */
const POPS = {
  profile: "#e0533d",
  experience: "#0e7490",
  education: "#b7791f",
  skills: "#7c3aed",
};

function Head({ children, color }: { children: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      <div className="text-[12px] font-bold uppercase tracking-[.1em] text-ink">
        {children}
      </div>
    </div>
  );
}

function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[46px] py-10">
      <div className="text-[30px] font-bold tracking-[-.015em] text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1 text-[12.5px] text-muted">{contactLine(resume)}</div>
      <div className="mt-3.5 flex gap-1.5">
        {Object.values(POPS).map((c) => (
          <div
            key={c}
            className="h-[5px] w-9 rounded-full"
            style={{ background: c }}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-6">
        {hasSummary(resume) && (
          <div>
            <Head color={POPS.profile}>Profile</Head>
            <SummaryText {...props} className="mt-1.5" />
          </div>
        )}
        {experienceEntries(resume).length > 0 && (
          <div>
            <Head color={POPS.experience}>Experience</Head>
            <ExperienceItems {...props} />
          </div>
        )}
        {educationEntries(resume).length > 0 && (
          <div>
            <Head color={POPS.education}>Education</Head>
            <EducationItems {...props} />
          </div>
        )}
        {resume.skills.length > 0 && (
          <div>
            <Head color={POPS.skills}>Skills</Head>
            <SkillsLine {...props} />
          </div>
        )}
      </div>
    </div>
  );
}

export const splash: ResumeTemplateModule = {
  id: "splash",
  name: "Splash",
  ats: 94,
  Render,
};
