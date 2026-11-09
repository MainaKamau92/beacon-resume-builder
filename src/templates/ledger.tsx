import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import {
  BulletList,
  SummaryText,
  contactLine,
  educationEntries,
  experienceEntries,
  hasSummary,
  highlightTerms,
} from "./shared";

const NAVY = "#1e3a5f";

function Head({ children }: { children: string }) {
  return (
    <div
      className="border-b pb-1 text-[12px] font-bold uppercase tracking-[.1em]"
      style={{ color: NAVY, borderColor: "#ccd6e3" }}
    >
      {children}
    </div>
  );
}

/** Corporate ledger: dates sit in a left gutter, substance on the right. */
function Render(props: TemplateRenderProps) {
  const { resume, keywordTerms, ...rest } = props;
  return (
    <div className="px-[46px] py-10">
      <div className="text-[26px] font-bold tracking-tight text-ink">
        {resume.contact.name || "Your Name"}
      </div>
      <div className="mt-1 text-[12.5px] text-muted">{contactLine(resume)}</div>
      {hasSummary(resume) && <SummaryText {...props} className="mt-3.5" />}
      <div className="mt-6 flex flex-col gap-6">
        {experienceEntries(resume).length > 0 && (
          <div>
            <Head>Experience</Head>
            <div className="mt-3 flex flex-col gap-4">
              {experienceEntries(resume).map((exp) => (
                <div key={exp.id} className="grid grid-cols-[105px_1fr] gap-4">
                  <div className="pt-px text-[11.5px] leading-snug text-muted">
                    {exp.date}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink">
                      {[exp.title, exp.org].filter(Boolean).join(" — ")}
                    </div>
                    <BulletList exp={exp} keywordTerms={keywordTerms} {...rest} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {educationEntries(resume).length > 0 && (
          <div>
            <Head>Education</Head>
            <div className="mt-3 flex flex-col gap-2.5">
              {educationEntries(resume).map((e) => (
                <div key={e.id} className="grid grid-cols-[105px_1fr] gap-4">
                  <div className="pt-px text-[11.5px] text-muted">{e.date}</div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink">
                      {[e.school, e.degree].filter(Boolean).join(" — ")}
                    </div>
                    {e.details && (
                      <div className="mt-[3px] text-[12.5px] leading-normal text-body">
                        {highlightTerms(e.details, keywordTerms)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {resume.skills.length > 0 && (
          <div>
            <Head>Skills</Head>
            <div className="mt-2.5 grid grid-cols-[105px_1fr] gap-4">
              <div />
              <div className="text-[12.5px] leading-relaxed text-body">
                {resume.skills.map((s, i) => (
                  <span key={s}>
                    {i > 0 && " · "}
                    {highlightTerms(s, keywordTerms)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ledger: ResumeTemplateModule = {
  id: "ledger",
  name: "Ledger",
  ats: 95,
  Render,
};
