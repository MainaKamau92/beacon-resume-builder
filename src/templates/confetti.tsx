import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationSection,
  ExperienceSection,
  SkillsSection,
  SummaryText,
  contactLine,
  hasSummary,
} from "./shared";

const CORAL_HEAD = "text-[#d9534f]";

const CONFETTI = [
  { c: "#f4b642", x: 0, y: 8, r: 12 },
  { c: "#d9534f", x: 18, y: 0, r: -8 },
  { c: "#4f9d69", x: 34, y: 12, r: 20 },
  { c: "#4a6fa5", x: 12, y: 22, r: -18 },
  { c: "#7c3aed", x: 30, y: 28, r: 6 },
];

/** Light-hearted: a scatter of confetti by the name, clean underneath. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="px-[48px] py-11">
      <div className="relative">
        <div
          className="pointer-events-none absolute -top-3 right-0 h-10 w-12"
          aria-hidden
        >
          {CONFETTI.map((p, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-[2px]"
              style={{
                background: p.c,
                left: p.x,
                top: p.y,
                transform: `rotate(${p.r}deg)`,
              }}
            />
          ))}
        </div>
        <div className="text-[28px] font-bold tracking-tight text-ink">
          {resume.contact.name || "Your Name"}
        </div>
        <div className="mt-1 text-[12px] text-muted">{contactLine(resume)}</div>
      </div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-4 max-w-[440px]" />
      )}
      <div className="mt-6 flex flex-col gap-5">
        <ExperienceSection {...props} accentClass={CORAL_HEAD} />
        <EducationSection {...props} accentClass={CORAL_HEAD} />
        <SkillsSection {...props} accentClass={CORAL_HEAD} />
      </div>
    </div>
  );
}

export const confetti: ResumeTemplateModule = {
  id: "confetti",
  name: "Confetti",
  ats: 95,
  Render,
};
