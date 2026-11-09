# Resume Builder — Structured Blue

A resume builder for early-career job seekers: import an existing resume, map it
into an ATS-safe template, refine it with AI suggestions, and tailor it to a
pasted job description with a live match score.

Built from the design handoff in `designs/design_handoff_resume_builder/`
(8 hi-fi screens, "Structured Blue" direction).

## Stack

- **Next.js (App Router) + TypeScript + Tailwind v4** — design tokens live in
  `src/app/globals.css` (`@theme`), fonts are Instrument Sans + IBM Plex Mono.
- **Zustand + localStorage persistence** — master resume, tailored versions,
  template choice, and the AI-refinement toggle survive reloads
  (`src/lib/store.ts`).
- **Real resume extraction** — `POST /api/extract` parses the uploaded file
  (PDF via unpdf/pdf.js with column-aware line reconstruction — two-column
  layouts are split at the gutter so sidebar text never interleaves the main
  flow — DOCX via mammoth, TXT as-is) and runs the deterministic rule engine
  in `src/lib/extract.ts`: section-header detection (incl. certifications),
  contact regexes, degree/date parsing, entry + bullet grouping (dates on
  their own line, hard-wrapped bullet continuation merging, dropped bullet
  glyphs, "Responsibilities:" noise), a skills-vs-hobbies dictionary split
  that handles grouped bullet lists, per-section confidence, and mechanical
  tidying (date spacing, title casing, phone formatting) when the AI
  refinement toggle is on. An LLM pass can layer on top for messier files.
- **Real AI endpoints (OpenAI, cost-minimized)** — `src/lib/ai.ts` wraps a
  nano-tier model (default `gpt-5-nano`, override with `OPENAI_MODEL`; key in
  `.env` as `OPEN_AI_API_KEY`) with strict JSON-schema outputs, minimal
  reasoning, hard output-token caps, clamped inputs, and timeouts. Every
  endpoint degrades to its deterministic path with no key or on any failure:
  - `POST /api/extract` — AI recovery runs **only when the rule engine
    reports low-confidence sections** and asks only for those sections, so
    clean resumes never pay for a call (`src/lib/extract-ai.ts`). Skills
    merge into the canonical deterministic list rather than replacing it.
  - `POST /api/suggest` — bullet rewrites under an honesty rule (reword
    only, never invent numbers/tools/achievements).
  - `POST /api/tailor` — keyword detection + match score stay deterministic
    and free; AI only rewords existing bullets to weave in missing keywords
    (keywords it can't honestly weave go to an "add to skills" suggestion).

  Injection guardrails (resume files and JDs are untrusted text): content is
  delimited and declared data-not-instructions, outputs are schema-locked,
  and every field is validated server-side — length/count clamps, ids must
  exist, keywords must come from the deterministic missing list, and any
  output containing a URL absent from the input is discarded.
- **Real PDF export** — `POST /api/pdf` drives headless Chromium (puppeteer)
  against the hidden `/print` route, which renders the same template
  components with the same CSS at true US-Letter size. The PDF is
  pixel-identical to the preview and keeps a real text layer
  (selectable → ATS-parseable). Plain-text export is generated client-side
  (`src/lib/download.ts`); .docx still falls back to the print dialog.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Requires Node 18.18+. **On Apple Silicon use an arm64 Node build** (e.g. nvm
v20.20.2) — an x64 Node under Rosetta can't launch puppeteer's Chromium, and
native deps (lightningcss/oxide) are installed per-arch. First install also
downloads Chrome for puppeteer (`npx puppeteer browsers install chrome` if it
was skipped).

## Flow

A minimal landing page with a single **Get started** CTA opens a step-by-step
wizard (all client-side at `/`, animated transitions, no route changes):

1. **Import** — upload a resume or start from scratch
2. **Review** — confirm the extraction (skipped when starting from scratch)
3. **Job description** — paste a JD to tailor everything to it, or skip
4. **Template** — pick from 26 ATS-scored layouts (see registry below)
5. **Editor** — fill in with live preview + AI suggestion chips
6. **Tailor** — match score, missing keywords, apply/skip suggested edits
7. **Export** — filename, format, download
8. **Dashboard** — master resume + tailored versions

The state machine lives in `src/components/App.tsx`; each step is a component
in `src/components/sections/`. The wizard header carries only a back button,
progress bars, and the logo.

## Templates are pluggable modules

Each template lives in `src/templates/<name>.tsx` as a self-contained module
(`{ id, name, ats, Render }`) registered in `src/templates/index.ts`. The
picker, thumbnails, live previews, and export all read from that registry —
**adding a template = one new file + one registry line**, nothing else
changes. Shared building blocks (section renderers, keyword highlighting,
contact line) live in `src/templates/shared.tsx`; templates compose them or
roll their own markup.

Previews are the real thing: `ResumePreview` renders the registered template
on a US-Letter-proportioned page (560 × 724+) and scales it with a CSS
transform, so thumbnails and previews are pixel-identical to the final
export at every size.

## Product rules from the handoff

- Template switching re-renders the same data — never destroys content.
- JD-keyword highlights are visual-only and stripped on print/export
  (`@media print` in `globals.css`).
- AI only rewords real experience — never invents new experience.
- "Download PDF" generates a real, pixel-perfect PDF via `/api/pdf`
  (headless Chromium printing the `/print` route). The browser print dialog
  remains only as the .docx fallback.

## Not built yet (flagged as gaps in the handoff too)

- Real .docx generation (PDF and plain text are done)
- Mobile layouts, empty states beyond the basics, auth/database
