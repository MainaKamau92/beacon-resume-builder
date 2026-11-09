import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  EducationSection,
  ExperienceSection,
  SectionHead,
  SummaryText,
  hasSummary,
  initialsOf,
} from "./shared";

const DUSK = "#4a6fa5";
const DUSK_HEAD = "text-[#4a6fa5]";

/** Warm right rail with a dusty-blue monogram; content leads on the left. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div
      className="grid grid-cols-[1fr_35%]"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      <div className="flex flex-col gap-5 p-7">
        <div>
          <div className="text-[26px] font-bold tracking-tight text-ink">
            {resume.contact.name || "Your Name"}
          </div>
          {hasSummary(resume) && <SummaryText {...props} className="mt-2.5" />}
        </div>
        <ExperienceSection {...props} accentClass={DUSK_HEAD} />
        <EducationSection {...props} accentClass={DUSK_HEAD} />
      </div>
      <div className="border-l border-[#e6e1d6] bg-[#f4f1ec] p-6">
        <div
          className="grid h-11 w-11 place-items-center rounded-full text-[15px] font-bold text-white"
          style={{ background: DUSK }}
        >
          {initialsOf(resume.contact.name)}
        </div>
        <div className="mt-5">
          <SectionHead className={DUSK_HEAD}>Contact</SectionHead>
        </div>
        <div className="mt-2 flex flex-col gap-1.5 text-[11.5px] leading-normal text-body">
          {[
            resume.contact.email,
            resume.contact.phone,
            resume.contact.location,
            resume.contact.linkedin,
          ]
            .filter(Boolean)
            .map((v) => (
              <div key={v} className="break-words">
                {v}
              </div>
            ))}
        </div>
        {resume.skills.length > 0 && (
          <>
            <div className="mt-6">
              <SectionHead className={DUSK_HEAD}>Skills</SectionHead>
            </div>
            <div className="mt-2 flex flex-col">
              {resume.skills.map((s) => (
                <div
                  key={s}
                  className="border-b border-[#e6e1d6] py-1.5 text-[12px] text-body last:border-0"
                >
                  {s}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const slate: ResumeTemplateModule = {
  id: "slate",
  name: "Slate",
  ats: 93,
  Render,
};
