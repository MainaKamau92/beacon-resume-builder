"use client";

import { ResumePreview } from "@/components/ResumePreview";
import { sampleResume } from "@/lib/sample";
import { atsBand, BAND_META, getTemplate, TEMPLATES } from "@/templates";

/**
 * Landing page. Design language (intentionally *not* the default AI-SaaS
 * gradient-and-floating-badge look): an immersive deep-navy hero with the
 * product's own real templates as the visual, one vivid spring-green accent,
 * an editorial serif display face over a sans body, flat confident buttons,
 * and a proper scrolling page with room to breathe. All social proof is
 * real/verifiable — no invented user counts or testimonials.
 */

const NAVY = "#0d2440";
const NAVY_2 = "#12335a";
const SPRING = "#2fe3a6";
const SPRING_INK = "#04281d"; // dark text that sits on the spring accent
const CREAM = "#f7f5f0";

/* ---------- small pieces ---------- */

function BrandMark({ onNavy = false }: { onNavy?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="grid h-8 w-8 place-items-center rounded-[9px]"
        style={{ background: onNavy ? SPRING : NAVY }}
      >
        {/* a beacon/signal glyph */}
        <svg viewBox="0 0 24 24" width={17} height={17} aria-hidden>
          <path
            d="M12 4v9m0 0a3 3 0 100 .01M6 6.5C4.8 8 4 9.9 4 12M18 6.5C19.2 8 20 9.9 20 12M8.5 8.8A4.5 4.5 0 007.5 12M15.5 8.8A4.5 4.5 0 0116.5 12"
            fill="none"
            stroke={onNavy ? NAVY : "#fff"}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span
        className="text-[16px] font-semibold tracking-tight"
        style={{ color: onNavy ? "#fff" : NAVY }}
      >
        Beacon
      </span>
    </div>
  );
}

function SpringButton({
  children,
  onClick,
  large = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full font-semibold transition-transform hover:-translate-y-0.5 ${
        large ? "px-8 py-3.5 text-[16px]" : "px-5 py-2.5 text-[14px]"
      }`}
      style={{ background: SPRING, color: SPRING_INK }}
    >
      {children}
    </button>
  );
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/** A fan of three real templates — the hero's immersive visual. */
function HeroFan() {
  const cards: { id: string; w: number; className: string }[] = [
    {
      id: "classic",
      w: 300,
      className: "left-0 top-8 -rotate-[9deg] z-10",
    },
    {
      id: "executive",
      w: 310,
      className: "left-[86px] top-0 -rotate-[2deg] z-20",
    },
    {
      id: "coral-sidebar-stylist",
      w: 300,
      className: "left-[188px] top-12 rotate-[7deg] z-30",
    },
  ];
  return (
    <div className="relative hidden h-[460px] w-full lg:block">
      {/* soft spring glow behind the stack */}
      <div
        className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: SPRING }}
      />
      {cards.map((c) => (
        <div
          key={c.id}
          className={`absolute ${c.className}`}
          style={{ filter: "drop-shadow(0 24px 44px rgba(0,0,0,.42))" }}
        >
          <ResumePreview resume={sampleResume} template={c.id} width={c.w} />
        </div>
      ))}
    </div>
  );
}

function ShowcaseCard({
  id,
  onGetStarted,
}: {
  id: string;
  onGetStarted: () => void;
}) {
  const tpl = getTemplate(id);
  const band = atsBand(tpl.ats);
  const meta = BAND_META[band];
  const tone = meta.tone === "ok" ? SPRING_INK : "#8a5a00";
  const toneBg = meta.tone === "ok" ? "#dff7ee" : "#fbf0d8";
  return (
    <button
      type="button"
      onClick={onGetStarted}
      className="group flex w-[200px] flex-none snap-start flex-col items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left transition-transform hover:-translate-y-1"
      style={{ boxShadow: "0 10px 24px rgba(20,32,46,.06)" }}
    >
      <div className="overflow-hidden rounded-lg">
        <ResumePreview resume={sampleResume} template={id} width={168} />
      </div>
      <div className="flex w-full items-center justify-between gap-2 px-1">
        <span className="text-[13.5px] font-semibold" style={{ color: NAVY }}>
          {tpl.name}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
          style={{ background: toneBg, color: tone }}
        >
          {meta.label}
        </span>
      </div>
    </button>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <div className="flex-1">
      <div
        className="font-serif text-[46px] font-semibold leading-none"
        style={{ color: SPRING, WebkitTextStroke: `0.5px ${NAVY}` }}
      >
        {n}
      </div>
      <div
        className="mt-3 font-serif text-[21px] font-semibold"
        style={{ color: NAVY }}
      >
        {title}
      </div>
      <p className="mt-2 text-[14.5px] leading-relaxed text-body">{body}</p>
    </div>
  );
}

/* ---------- page ---------- */

export function LandingSection({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) {
  const proofPoints = [
    "Import your existing resume",
    "Edit every section",
    "Compare it with the job",
    "Accept or skip every edit",
    "Download a selectable PDF",
  ];
  const templateCount = TEMPLATES.length;
  const showcase = [
    "classic",
    "executive",
    "coral-sidebar-stylist",
    "navy-photo-sidebar",
    "code-comment-dev",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-white/90 px-6 backdrop-blur md:px-10">
        <BrandMark />
        <div className="hidden items-center gap-8 md:flex">
          <button
            type="button"
            onClick={() => scrollTo("templates")}
            className="text-[14px] font-medium text-body transition-colors hover:text-ink"
          >
            Templates
          </button>
          <button
            type="button"
            onClick={() => scrollTo("how")}
            className="text-[14px] font-medium text-body transition-colors hover:text-ink"
          >
            How it works
          </button>
          <SpringButton onClick={onGetStarted}>Start my resume</SpringButton>
        </div>
        <div className="md:hidden">
          <SpringButton onClick={onGetStarted}>Start my resume</SpringButton>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `radial-gradient(120% 120% at 85% 0%, ${NAVY_2} 0%, ${NAVY} 55%)`,
        }}
      >
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-16 md:px-10 lg:grid-cols-[1fr_540px] lg:py-20">
          <div>
            <div
              className="text-[13px] font-semibold uppercase tracking-[.14em]"
              style={{ color: SPRING }}
            >
              Have a resume already? Start with it.
            </div>
            <h1 className="mt-4 font-serif text-[clamp(38px,5.4vw,64px)] font-semibold leading-[1.04] tracking-[-.02em] text-white">
              One strong resume. A focused version for every job.
            </h1>
            <p className="mt-5 max-w-[520px] text-[18px] leading-[1.6] text-white/70">
              Import your current resume, improve the parts that undersell you,
              and tailor it to the role — without juggling copies or rewriting
              everything from scratch.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <SpringButton onClick={onGetStarted} large>
                Improve my resume
              </SpringButton>
              <button
                type="button"
                onClick={() => scrollTo("templates")}
                className="rounded-full border border-white/25 px-7 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                See the templates
              </button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-white/55">
              <span>Import PDF or DOCX</span>
              <span aria-hidden style={{ color: SPRING }}>
                ·
              </span>
              <span>Keep one master resume</span>
              <span aria-hidden style={{ color: SPRING }}>
                ·
              </span>
              <span>No account required</span>
            </div>
          </div>

          <HeroFan />
        </div>
      </section>

      {/* PRODUCT PROOF STRIP */}
      <section className="border-b border-line bg-white px-6 py-8 md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-center text-[13px] font-medium uppercase tracking-[.12em] text-muted">
            Everything between an old resume and a ready-to-send one
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
            {proofPoints.map((point) => (
              <span
                key={point}
                className="text-[16px] font-semibold tracking-tight"
                style={{ color: "#9aa7b6" }}
              >
                {point}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATE SHOWCASE */}
      <section id="templates" className="px-6 py-20 md:px-10" style={{ background: CREAM }}>
        <div className="mx-auto max-w-[1150px]">
          <div className="mx-auto max-w-[620px] text-center">
            <h2
              className="font-serif text-[clamp(28px,3.6vw,42px)] font-semibold leading-tight"
              style={{ color: NAVY }}
            >
              Pick the design that fits where you are applying
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-body">
              Choose from {templateCount} layouts, from conservative formats for
              application portals to more distinctive designs for direct
              applications and introductions.
            </p>
          </div>
          {/* swipeable on mobile (fixed-width cards avoid clipping the fixed
              -width previews); centers into a single row on desktop */}
          <div className="mt-12 -mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-3 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0">
            {showcase.map((id) => (
              <ShowcaseCard key={id} id={id} onGetStarted={onGetStarted} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <SpringButton onClick={onGetStarted} large>
              Find my template
            </SpringButton>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1000px]">
          <h2
            className="text-center font-serif text-[clamp(28px,3.6vw,42px)] font-semibold leading-tight"
            style={{ color: NAVY }}
          >
            Tailoring without the file chaos
          </h2>
          <div className="mt-14 flex flex-col gap-12 md:flex-row md:gap-10">
            <Step
              n={1}
              title="Import, do not retype"
              body="Upload your current PDF or DOCX and turn it into editable sections. Starting fresh is there if you need it."
            />
            <Step
              n={2}
              title="Build one strong master"
              body="Choose a layout, tighten the wording, and keep your best experience together in one resume you can update."
            />
            <Step
              n={3}
              title="Create the version for this job"
              body="Paste the job description, review the keyword gaps and suggested edits, then download a focused PDF for the role."
            />
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="px-6 py-16 md:px-10" style={{ background: NAVY }}>
        <div
          className="mx-auto flex max-w-[1000px] flex-col items-center gap-7 rounded-3xl px-8 py-14 text-center"
          style={{ background: `linear-gradient(160deg, ${NAVY_2}, ${NAVY})`, border: "1px solid rgba(255,255,255,.08)" }}
        >
          <h2 className="max-w-[640px] font-serif text-[clamp(28px,4vw,46px)] font-semibold leading-[1.1] text-white">
            The job changed. Your resume should too.
          </h2>
          <p className="max-w-[500px] text-[16.5px] leading-relaxed text-white/65">
            Paste the posting, review what is missing, and send a version that
            speaks to the role without inventing experience.
          </p>
          <SpringButton onClick={onGetStarted} large>
            Tailor my resume
          </SpringButton>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line bg-white px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[1150px] flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandMark />
          <div className="flex items-center gap-7 text-[13px] font-medium text-muted">
            <a href="#" className="hover:text-ink">
              Terms &amp; Conditions
            </a>
            <a href="#" className="hover:text-ink">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-ink">
              Contact
            </a>
          </div>
          <div className="text-[12.5px] text-ghost">
            © {new Date().getFullYear()} Beacon
          </div>
        </div>
      </footer>
    </div>
  );
}
