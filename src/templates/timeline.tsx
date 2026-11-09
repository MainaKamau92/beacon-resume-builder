import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  BulletList,
  EducationSection,
  SkillsSection,
  SummaryText,
  contactLine,
  experienceEntries,
  hasSummary,
} from "./shared";

const INDIGO = "#4f46e5";
const INDIGO_HEAD = "text-[#4f46e5]";

/** Experience as a dotted indigo timeline — great for showing a path. */
function Render(props: TemplateRenderProps) {
  const { resume, ...rest } = props;
  const jobs = experienceEntries(resume);
  return (
    <div className="px-[46px] py-10">
      <div className="text-[26px] font-bold tracking-tight text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1 text-[12.5px] text-muted">{contactLine(resume)}</div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-3.5 max-w-[440px]" />
      )}
      <div className="mt-6 flex flex-col gap-5">
        {jobs.length > 0 && (
          <div>
            <div
              className={`text-[12px] font-bold uppercase tracking-[.1em] ${INDIGO_HEAD}`}
            >
              Experience
            </div>
            <div
              className="ml-1 mt-3 flex flex-col gap-4 border-l-2 pl-5"
              style={{ borderColor: "#dcd9fb" }}
            >
              {jobs.map((exp) => (
                <div key={exp.id} className="relative">
                  <div
                    className="absolute -left-[27px] top-[5px] h-2.5 w-2.5 rounded-full border-2 bg-white"
                    style={{ borderColor: INDIGO }}
                  />
                  <div className="flex justify-between gap-3">
                    <div className="text-[13.5px] font-semibold text-ink">
                      {[exp.title, exp.org].filter(Boolean).join(" — ")}
                    </div>
                    <div className="flex-none text-[12.5px] text-muted">
                      {exp.date}
                    </div>
                  </div>
                  <BulletList exp={exp} {...rest} />
                </div>
              ))}
            </div>
          </div>
        )}
        <EducationSection {...props} accentClass={INDIGO_HEAD} />
        <SkillsSection {...props} accentClass={INDIGO_HEAD} />
      </div>
    </div>
  );
}

export const timeline: ResumeTemplateModule = {
  id: "timeline",
  name: "Timeline",
  ats: 95,
  Render,
};
