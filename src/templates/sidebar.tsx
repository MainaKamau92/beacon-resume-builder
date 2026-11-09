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

/** Dark left rail with monogram; contact and skills live in the rail. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div
      className="grid grid-cols-[37%_1fr]"
      style={{ minHeight: PAGE_MIN_HEIGHT }}
    >
      <div className="bg-ink p-6 text-white">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#3d4f63] text-[16px] font-bold">
          {initialsOf(resume.contact.name)}
        </div>
        <div className="mt-3 text-[19px] font-bold leading-tight">
          {resume.contact.name || "Your Name"}
        </div>
        <div className="mt-5 text-[10.5px] font-bold uppercase tracking-[.14em] text-[#7ea4e8]">
          Contact
        </div>
        <div className="mt-2 flex flex-col gap-1.5 text-[11px] leading-normal text-[#c3cedb]">
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
            <div className="mt-6 text-[10.5px] font-bold uppercase tracking-[.14em] text-[#7ea4e8]">
              Skills
            </div>
            <div className="mt-2 flex flex-col">
              {resume.skills.map((s) => (
                <div
                  key={s}
                  className="border-b border-[#25344a] py-1.5 text-[11.5px] text-[#d7e0ea] last:border-0"
                >
                  {s}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-5 p-7">
        {hasSummary(resume) && (
          <div>
            <SectionHead>Profile</SectionHead>
            <SummaryText {...props} className="mt-1.5" />
          </div>
        )}
        <ExperienceSection {...props} />
        <EducationSection {...props} />
      </div>
    </div>
  );
}

export const sidebar: ResumeTemplateModule = {
  id: "sidebar",
  name: "Sidebar",
  ats: 98,
  Render,
};
