# Handoff: Resume Builder — Structured Blue

## Overview
A resume-builder web app for early-career job seekers (new grads). Flow: **Landing → Get started (upload/import) → Import review → Template picker → Editor → JD tailoring → Export → Dashboard**. Core differentiators: (1) upload an existing resume whose contents are extracted and mapped into a modern template, (2) an AI-refinement toggle that cleans up text and suggests stronger bullets, (3) paste a job description to get an ATS match score + one-click suggested edits.

## About the Design Files
The file in this bundle (`Structured Blue.dc.html`) is a **design reference created in HTML** — a hi-fi prototype showing intended look and behavior, NOT production code to copy directly. Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, etc.) using its established patterns and libraries — or, if no codebase exists yet, choose an appropriate stack (e.g. React + Tailwind) and implement there. Open the HTML in a browser to see all 8 screens stacked vertically; each screen is a `div.dv-card` with a `data-screen-label` attribute.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy are final intent. Recreate pixel-perfectly, substituting your design-system equivalents only where they are an exact conceptual match.

## Screens (in flow order; `data-screen-label` in parentheses)

### 1. Landing (`1a Landing`)
- Purpose: convert visitors to "start building".
- Layout: 64px white top nav (logo left; Templates / How it works / Examples + primary CTA right). Hero: 2-col grid `1fr 460px`, gap 56px, padding 72/64px, background `linear-gradient(180deg,#f6f8fb,#eef3fa)`. Below: white 3-col "how it works" strip (numbered steps 1–3).
- Hero left: uppercase pill badge ("Built for your first job hunt", bg #e6eefc, text #2f6bdf), H1 52px/1.08 weight 700 ("A resume that gets past the robots — and impresses the humans."), 18px subhead #5b6b7d, primary CTA ("Start free — no sign-up", bg #2f6bdf, radius 10px, shadow rgba(47,107,223,.3)) + secondary outlined CTA. Three green-dot trust points.
- Hero right: mock resume card (rotated 1deg, shadow 0 20px 40px rgba(20,32,46,.12)) with skeleton bars; floating dark badge (#14202e, rotated −2deg) showing "ATS match 92%" in #4ade80.

### 2. Get started — upload or start fresh (`1a Import`)
- Purpose: bring in an existing resume or start blank.
- Layout: 60px step header; body padding 48/56px on #f6f8fb. Centered H2 30px + subhead. Grid `1.15fr 1fr`, gap 28px.
- Left: drag-and-drop zone — white card, `2px dashed #2f6bdf`, radius 14px, centered content: ↑ icon tile (56px, bg #e6eefc), "Drag & drop your resume", helper text with "browse files" link, format chips (PDF / DOCX / TXT / LinkedIn PDF, mono 11px). "Recommended" pill top-right.
- Right column: two stacked cards — "Start from scratch" (white) and "Import from LinkedIn" (dark #0f1f2d, link color #4ea3ff).
- Below: extraction-result card — file row (PDF icon tile, filename, "Extracted in 2.1s · 4 sections found", green "Extraction complete" pill), 4-col section grid (Contact/Education/Experience = green ✓ cards bg #f5faf4 border #d8e5d6; Skills = amber "!" card bg #fdf8ee border #f0dfc2), then the **AI refinement toggle row** (bg #f2f7ff, border #dbe6f8, ✦ icon tile, label "Let AI clean up the imported text", toggle ON: 46×26 pill bg #2f6bdf, white 20px knob right-aligned), and primary CTA "Choose a template →".

### 3. Import review (`1a Import Review`)
- Purpose: user confirms/corrects extraction before templating.
- Layout: 2-col split `1fr 1fr` on #f6f8fb; header right shows "3 of 4 sections confirmed" + CTA "Looks right — continue →".
- Left: "Your original" — raw resume text rendered in IBM Plex Mono 12px/1.7 in a white card; the mis-parsed skills line is highlighted (bg #fdf8ee, 2px outline #ecc86a).
- Right: "Mapped to your resume" — stacked cards, each with a status disc: green ✓ (#1f9d6b) for Contact/Education/Experience, amber ! (#b8860b) for Skills. Experience card includes an AI note chip ("AI tidied dates… and capitalized job titles", bg #f2f7ff). Skills card (border 1.5px #ecc86a): chip row separating real skills (green chips with ✓) from hobbies (dashed, strikethrough) plus an ambiguous "chess club → keep?" chip. Every confirmed card has an "Edit" link (#2f6bdf).

### 4. Template picker (`1a Templates`)
- Purpose: choose one of 4 ATS-safe templates; switching never loses data ("Pick on looks alone — you can switch anytime without retyping a thing.").
- Layout: step header with 3-segment progress bar (34×6px bars, active #2f6bdf); 4-col card grid, gap 22px.
- Each card: white, radius 12px, 14px padding, 260px-tall skeleton preview + name row with ATS badge ("ATS 100%" green bg #e7f6ef / "ATS 94%" amber bg #fdf3dc). Selected card: `2px solid #2f6bdf`, blue shadow, floating "Selected" pill. Templates: **Classic** (single column), **Sidebar** (dark 38% left rail), **Centered** (centered header + rule), **Compact** (2-col dense).
- Footer: right-aligned CTA "Continue with Classic →".

### 5. Editor (`1a Editor`)
- Purpose: fill in content with live preview.
- Layout: grid `440px 1fr`. Left: white form panel (border-right #e3e9f1, padding 26/28px). Right: centered resume preview (560px page, padding 40/46px, radius 4px, shadow 0 12px 32px rgba(20,32,46,.1)) on #f6f8fb.
- Header right contains the **AI refinement toggle pill** (bg #f2f7ff border #dbe6f8, ✦ icon 16px, label "AI refinement", 38×22 toggle ON #2f6bdf), "Saved just now" (#1f9d6b), Download PDF (outlined), "Next: Tailor to a job →" (primary).
- Form panel: section tab pills (Basics active bg #e6eefc; Education/Experience/Skills outlined); an Experience card with labeled bullet inputs — active input border `1.5px #2f6bdf` bg #fbfcff with text caret; **AI suggestion chip** below it ("✦ AI suggests: add a number — '…managing $800+ in daily transactions'" + "Use it" action). When AI refinement is OFF, these suggestion chips do not render. Also: "+ Add bullet point" link, "No work experience yet?" helper card (projects/clubs/volunteering), dashed "+ Add another job or project" tile.
- Preview: name 26px/700, contact line 12.5px #5b6b7d, 1px #14202e rule, section headers 12px uppercase #2f6bdf letter-spacing .1em. The bullet currently being edited is highlighted on the preview (bg #eef4ff); empty bullet shows ghost text (#b6c2d0).

### 6. JD tailoring (`1a JD Tailoring`)
- Purpose: paste a JD, get match score + suggested edits; preview updates with green highlights.
- Layout: grid `460px 1fr`, left white panel / right preview page (same spec as editor).
- Left panel, top to bottom: JD textarea (96px, bottom fade-out, keywords bolded); **match score module** — 84px conic-gradient ring (`#2f6bdf 0→259deg`, rest #e3e9f1) with "72%" center, headline "Good match — 3 quick fixes", "reach 90%+" in green; **missing keywords** chips (missing = red: bg #fdf1ef border #f0c8c2 text #b3402f — "REST APIs", "Agile", "CI/CD"; present = green: bg #eef6ed text #1f9d6b — "✓ Python", "✓ SQL"); **suggested edit cards** — section label, strikethrough old text, new text with added keywords highlighted (bg #dff0dc), "Apply edit" / "Skip" actions.
- Preview: pill top-right "Tailored for: Junior SWE @ Fintech" (green); applied keywords highlighted inline with bg #dff0dc; experience reordered to put the most relevant item (StudyBuddy project) first.

### 7. Export (`1a Export`)
- Purpose: the payoff — download the tailored file.
- Layout: grid `1fr 480px`. Left: final resume preview (440px) with floating green badge "ATS check passed · 92%" (bg #1f9d6b). Right white panel: headline "Nice work, Maya. ✓", context line ("Tailored for Junior SWE @ Fintech · 90% match"), **filename field** (job-specific: `Maya-Chen-Resume-Fintech-SWE` + grey ".pdf" suffix), **format radio group** (PDF selected — border 1.5px #2f6bdf, filled radio; Word .docx; Plain text, each with one-line use-case helper), then pinned-bottom actions: primary "Download PDF", secondary "Save & tailor for another job".

### 8. Dashboard (`1a Dashboard`)
- Purpose: manage one master resume + per-job tailored versions.
- Layout: 64px nav ("My resumes", "+ New tailored version" primary button, 34px "MC" avatar circle bg #e6eefc). Body grid `340px 1fr`, gap 26px.
- Left: **Base resume card** — skeleton thumbnail (150px), "Maya Chen — Master", "Classic template", "Updated today · the source for every tailored version", Edit / Download buttons.
- Right: "Tailored versions · 3" list. Each row: grid `1fr 130px 110px 110px` — title + filename/edited-time, **match ring** (30px conic-gradient with score: 90 green #1f9d6b "Strong" / 68 blue #2f6bdf "Good" / 52 grey #8595a8 "Draft"), status pill (green "Applied ✓" / amber "2 fixes left" / grey "Draft"), "Open →" link. Below: dashed tile "Paste a new job description to create a tailored version".

## Interactions & Behavior
- Progress: 3-step bar (template → fill → tailor); steps navigable back.
- Upload: drag-and-drop + browse; accepts PDF/DOCX/TXT/LinkedIn-PDF ≤10 MB; show extraction progress then section-found summary; failures need an error state (not designed yet — treat scanned/unreadable PDFs gracefully).
- AI refinement toggle: global setting shown at import and in editor header. ON → inline "AI suggests" chips + auto-tidy on import (date normalization, capitalization, verb strengthening). OFF → no AI chips; import maps text verbatim.
- Suggestion chips: "Use it"/"Apply edit" replaces text and updates preview + match score; "Skip"/"Dismiss" removes chip.
- JD tailoring: paste → parse keywords → score (0–100). Applied edits raise the score live. Highlights (bg #dff0dc) mark JD-matched terms in preview; these highlights are visual-only and must NOT export.
- Editing sync: form field focus highlights the corresponding preview line (bg #eef4ff).
- Template switching: re-renders same content, never destroys data.
- Autosave with "Saved just now" indicator.
- Export: filename auto-suggested from name + job; formats PDF/DOCX/plain text.
- Honesty guardrail (product rule): AI only rewords real experience — never invents new experience.

## State Management
- `resume` (master document: contact, education[], experience[], projects[], skills[])
- `versions[]` (per-job: jobTitle, jdText, keywordResults[], score, appliedEdits[], status: draft|ready|applied, filename)
- `aiRefinementEnabled` (boolean, persisted)
- `importState` (idle → uploading → extracting → review → confirmed; per-section confidence: ok|warning)
- `selectedTemplate` (classic|sidebar|centered|compact)
- Data: extraction + AI suggestions + JD parsing are backend/LLM calls; everything else is client state.

## Design Tokens
Colors:
- Primary blue `#2f6bdf` (hover ~`#1e50b5`); light blue tint `#e6eefc`; suggestion bg `#f2f7ff` border `#dbe6f8`; preview-highlight `#eef4ff`
- Ink `#14202e`; body text `#3a4a5c`; muted `#5b6b7d`; ghost `#8595a8` / `#b6c2d0`
- Page bg `#f6f8fb`; canvas tint `#eef3fa`; borders `#e3e9f1` / inputs `#dbe3ec` / `#cdd8e6`
- Success `#1f9d6b` bg `#e7f6ef` / `#eef6ed` / `#f5faf4`; JD-keyword highlight `#dff0dc`
- Warning `#b8860b` bg `#fdf3dc` / `#fdf8ee`, border `#ecc86a` / `#f0dfc2`
- Danger/missing `#b3402f` bg `#fdf1ef` border `#f0c8c2`
- Dark surfaces `#0f1f2d` / `#14202e`
Typography:
- UI: **Instrument Sans** (Google Fonts) 400/500/600/700. Mono accents (file chips, raw-text view): **IBM Plex Mono** 400/500.
- Scale: H1 52px, H2 28–30px, panel titles 14–15px/600, body 13–13.5px, meta 12–12.5px, chips 11–12px. Resume preview: name 26px/700, section heads 12px uppercase ls .1em, body 12.5px/1.5.
Spacing & shape:
- Card radius 10–14px, inputs 9–10px, pills 999px, resume page 4px. Panel padding 26–28px; page gutters 40–64px. Gaps: grids 22–28px, chip rows 6–8px.
- Shadows: cards `0 2px 8px rgba(15,30,50,.08)`; floating page `0 12px 32px rgba(20,32,46,.1)`; primary CTA `0 4px 12px rgba(47,107,223,.28)`.

## Assets
No raster assets. Logo is a placeholder (26px rounded square, #2f6bdf, white "R") — replace with real brand. Resume thumbnails/skeletons are pure CSS. Icons shown as glyphs (✦ ✓ ! ↑ →) — swap for your icon set (e.g. sparkle, check, alert, upload, arrow).

## Files
- `Structured Blue.dc.html` — all 8 screens, top to bottom, each in a `div.dv-card[data-screen-label]`. The grey canvas chrome (`.dv-*` classes, badges, labels) is presentation scaffolding — not part of the product UI.
