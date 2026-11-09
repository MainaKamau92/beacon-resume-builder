import type { ComponentType } from "react";
import type { Resume } from "@/lib/types";

/**
 * Page geometry shared by every template. The preview page is 560px wide and
 * at least US-Letter proportioned (8.5 × 11 → 560 × ~724), so what users see
 * in previews and thumbnails is the full final page, not a crop.
 */
export const PAGE_WIDTH = 560;
export const PAGE_MIN_HEIGHT = 724;

export interface TemplateRenderProps {
  resume: Resume;
  /** JD-matched terms to highlight (visual-only, stripped on print) */
  keywordTerms: string[];
  /** `${experienceId}:${bulletIndex}` of the bullet being edited */
  highlightKey: string | null;
  /** render placeholder text for empty bullets (editor mode) */
  showGhostBullets: boolean;
}

/**
 * A resume template is a self-contained module: metadata + a render
 * component. Register new templates in `src/templates/index.ts` — nothing
 * else in the codebase needs to change.
 */
export interface ResumeTemplateModule {
  id: string;
  name: string;
  /** ATS-compatibility badge shown in the picker */
  ats: number;
  Render: ComponentType<TemplateRenderProps>;
}

/**
 * ATS bands group templates by how safely an automated resume parser reads
 * them, so users can choose based on where the resume is going (a job
 * portal vs. printing / emailing a person). Derived from the `ats` score.
 */
export type AtsBand = "ats-ready" | "balanced" | "design-forward";

export function atsBand(ats: number): AtsBand {
  if (ats >= 90) return "ats-ready";
  if (ats >= 75) return "balanced";
  return "design-forward";
}

export const BAND_ORDER: AtsBand[] = ["ats-ready", "balanced", "design-forward"];

export const BAND_META: Record<
  AtsBand,
  { label: string; blurb: string; tone: "ok" | "warn" }
> = {
  "ats-ready": {
    label: "ATS-ready",
    blurb:
      "Safest for online applications — parses cleanly through automated filters (Workday, Greenhouse, LinkedIn Easy Apply).",
    tone: "ok",
  },
  balanced: {
    label: "Balanced",
    blurb:
      "Polished styling that still reads well in most automated systems.",
    tone: "ok",
  },
  "design-forward": {
    label: "Design-forward",
    blurb:
      "Built to impress a person — printing, portfolios, or emailing a recruiter directly. May not parse cleanly in strict ATS.",
    tone: "warn",
  },
};
