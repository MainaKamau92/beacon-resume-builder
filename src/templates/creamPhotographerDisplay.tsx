import type { ReactNode } from "react";
import type { ResumeTemplateModule, TemplateRenderProps } from "./types";
import { PAGE_MIN_HEIGHT } from "./types";
import {
  BulletList,
  educationEntries,
  experienceEntries,
  GLYPHS,
  GlyphIcon,
  hasSummary,
  highlightTerms,
} from "./shared";

/**
 * "Portfolio" — a centered display name with a script flourish, radiating arc
 * motifs, a top contact strip, and a two-column body with a soft panel on the
 * right. Original markup in the style of a decorative creative Canva résumé.
 */
const CREAM = "#f6f1ea";
const PANEL = "#f0e7db";
const BROWN = "#4a3f35";

function ArcFan({ flip = false }: { flip?: boolean }) {
  const cx = 92;
  const cy = 74;
  const radii = [18, 32, 46, 60];
  return (
    <svg
      viewBox="0 0 100 90"
      width="80"
      height="72"
      aria-hidden
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {radii.map((r) => (
        <path
          key={r}
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`}
          fill="none"
          stroke={BROWN}
          strokeWidth={2}
        />
      ))}
      <circle cx={cx} cy={cy} r={6} fill={BROWN} />
    </svg>
  );
}

function Head({ children }: { children: ReactNode }) {
  return (
    <div
      data-shead
      className="mb-2.5 mt-6 text-[19px] font-extrabold lowercase first:mt-0"
      style={{ color: BROWN }}
    >
      {children}.
    </div>
  );
}

function Render(props: TemplateRenderProps) {
  const { resume, keywordTerms } = props;
  const c = resume.contact;
  const headline = resume.experience.find((e) => e.title)?.title ?? "";
  const exp = experienceEntries(resume);
  const edu = educationEntries(resume);
  const words = (c.name || "Your Name").split(/\s+/);
  const first = words[0];
  const rest = words.slice(1).join(" ");
  const contacts: [string, string][] = [
    [GLYPHS.mail, c.email],
    [GLYPHS.pin, c.location],
    [GLYPHS.phone, c.phone],
    [GLYPHS.globe, c.linkedin],
  ];

  return (
    <div
      className="px-9 pb-9 pt-6"
      style={{ minHeight: PAGE_MIN_HEIGHT, background: CREAM, color: BROWN }}
    >
      {/* top contact strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[11px]">
        {contacts
          .filter(([, v]) => v)
          .map(([icon, v]) => (
            <div key={v} className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-[#c9bda9]">
                <GlyphIcon path={icon} size={11} />
              </span>
              {v}
            </div>
          ))}
      </div>

      {/* display name with flanking arc motifs */}
      <div className="relative mt-5 flex items-center justify-center">
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <ArcFan />
        </div>
        <div className="text-center">
          {headline && (
            <div className="text-[15px] uppercase tracking-[.34em]">
              {headline}
            </div>
          )}
          <div className="text-[58px] font-extrabold uppercase leading-[.86] tracking-[.01em]">
            {first}
          </div>
          {rest && (
            <div className="-mt-2 font-serif text-[30px] italic lowercase">
              {rest}
            </div>
          )}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <ArcFan flip />
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-[70%] items-center gap-3">
        <span className="h-px flex-1" style={{ background: "#cdbfa9" }} />
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: BROWN }} />
        <span className="h-px flex-1" style={{ background: "#cdbfa9" }} />
      </div>

      {/* body */}
      <div className="mt-4 grid grid-cols-2 gap-x-7">
        {/* left */}
        <div className="pr-1">
          {hasSummary(resume) && (
            <>
              <Head>about me</Head>
              <div className="text-[12px] leading-relaxed">
                {highlightTerms(resume.summary!.trim(), keywordTerms)}
              </div>
            </>
          )}
          {edu.length > 0 && (
            <>
              <Head>education</Head>
              <div className="flex flex-col gap-2.5">
                {edu.map((e) => (
                  <div key={e.id} data-entry>
                    <div className="text-[13px] font-bold">
                      {e.degree || e.school}
                    </div>
                    <div className="text-[12px] opacity-80">
                      {[e.school, e.date].filter(Boolean).join(" / ")}
                    </div>
                    {e.details && (
                      <div className="text-[11.5px] opacity-70">
                        {highlightTerms(e.details, keywordTerms)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {resume.skills.length > 0 && (
            <>
              <Head>skills</Head>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full px-3 py-1 text-[11px] font-semibold"
                    style={{ background: PANEL }}
                  >
                    {highlightTerms(s, keywordTerms)}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* right panel */}
        <div className="rounded-[10px] px-5 py-4" style={{ background: PANEL }}>
          {exp.length > 0 && (
            <>
              <Head>experience</Head>
              <div className="flex flex-col gap-3">
                {exp.map((e) => (
                  <div key={e.id}>
                    <div data-entry-head className="text-[13px] font-bold">
                      {e.title || e.org}
                    </div>
                    <div className="text-[12px] font-semibold opacity-80">
                      {[e.org, e.date].filter(Boolean).join(" / ")}
                    </div>
                    <BulletList
                      exp={e}
                      keywordTerms={keywordTerms}
                      highlightKey={props.highlightKey}
                      showGhostBullets={props.showGhostBullets}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const creamPhotographerDisplay: ResumeTemplateModule = {
  id: "cream-photographer-display",
  name: "Portfolio",
  ats: 66,
  Render,
};
