import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  EducationItems,
  ExperienceItems,
  SummaryText,
  contactLine,
  educationEntries,
  experienceEntries,
  hasSummary,
} from "./shared";

const FOREST = "#166534";

function Head({ children }: { children: string }) {
  return (
    <div
      className="border-l-[3px] pl-2 text-[12px] font-bold uppercase tracking-[.08em] text-ink"
      style={{ borderColor: FOREST }}
    >
      {children}
    </div>
  );
}

/** Forest-green two-column with skill chips — design-adjacent roles. */
function Render(props: TemplateRenderProps) {
  const { resume } = props;
  return (
    <div className="p-8">
      <div className="text-[25px] font-bold tracking-tight text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1 text-[11.5px] text-muted">{contactLine(resume)}</div>
      {hasSummary(resume) && (
        <SummaryText {...props} className="mt-3 max-w-[430px]" />
      )}
      <div className="mt-6 grid grid-cols-[1.3fr_1fr] gap-7">
        <div>
          {experienceEntries(resume).length > 0 && (
            <>
              <Head>Experience</Head>
              <ExperienceItems {...props} />
            </>
          )}
        </div>
        <div className="flex flex-col gap-6">
          {educationEntries(resume).length > 0 && (
            <div>
              <Head>Education</Head>
              <EducationItems {...props} />
            </div>
          )}
          {resume.skills.length > 0 && (
            <div>
              <Head>Skills</Head>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {resume.skills.map((s) => (
                  <div
                    key={s}
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      background: "#edf7ef",
                      border: "1px solid #cde5d3",
                      color: "#14532d",
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const duo: ResumeTemplateModule = {
  id: "duo",
  name: "Duo",
  ats: 92,
  Render,
};
