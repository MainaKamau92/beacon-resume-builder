import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationSection,
  ExperienceSection,
  SummaryText,
  contactLine,
  hasSummary,
} from "./shared";

const SEAGREEN = "#0d9488";
const SEAGREEN_HEAD = "text-[#0d9488]";

/** Entry-level friendly: education and skills lead, warm sea-green. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[46px] py-10">
      <div className="text-[27px] font-bold tracking-tight text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1 text-[12.5px] text-muted">{contactLine(resume)}</div>
      {hasSummary(resume) && (
        <div
          className="mt-4 rounded-lg border-l-[3px] bg-[#f0faf8] py-2.5 pl-3.5 pr-4"
          style={{ borderColor: SEAGREEN }}
        >
          <SummaryText {...props} />
        </div>
      )}
      <div className="mt-6 flex flex-col gap-5">
        <EducationSection {...props} accentClass={SEAGREEN_HEAD} />
        {resume.skills.length > 0 && (
          <div>
            <div
              className={`text-[12px] font-bold uppercase tracking-[.1em] ${SEAGREEN_HEAD}`}
            >
              Skills
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {resume.skills.map((s) => (
                <div
                  key={s}
                  className="rounded-md px-2.5 py-1 text-[11.5px] font-medium"
                  style={{ background: "#e5f5f2", color: "#0b6e64" }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
        <ExperienceSection {...props} accentClass={SEAGREEN_HEAD} />
      </div>
    </div>
  );
}

export const launch: ResumeTemplateModule = {
  id: "launch",
  name: "Launch",
  ats: 97,
  Render,
};
