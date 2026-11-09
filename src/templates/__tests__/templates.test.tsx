import { describe, it, expect } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TEMPLATES, getTemplate } from "../index";
import { atsBand } from "../types";
import { GHOST_BULLET } from "../shared";
import {
  fullResume,
  sparseResume,
  emptyResume,
  ghostResume,
} from "./fixtures";
import type { Resume } from "@/lib/types";
import type { TemplateRenderProps } from "../types";

function render(
  Render: ComponentType<TemplateRenderProps>,
  resume: Resume,
  extra?: Partial<TemplateRenderProps>,
) {
  return renderToStaticMarkup(
    createElement(Render, {
      resume,
      keywordTerms: [],
      highlightKey: null,
      showGhostBullets: false,
      ...extra,
    }),
  );
}

describe("template registry invariants", () => {
  it("has no duplicate ids", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no duplicate names", () => {
    const names = TEMPLATES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("has ats scores within 0–100", () => {
    for (const t of TEMPLATES) {
      expect(t.ats, `${t.id} ats`).toBeGreaterThanOrEqual(0);
      expect(t.ats, `${t.id} ats`).toBeLessThanOrEqual(100);
    }
  });

  it("resolves every id back to itself, and unknown ids fall back to the first", () => {
    for (const t of TEMPLATES) expect(getTemplate(t.id)).toBe(t);
    expect(getTemplate("does-not-exist")).toBe(TEMPLATES[0]);
  });
});

describe("atsBand boundaries", () => {
  it("buckets on the 75 / 90 thresholds", () => {
    expect(atsBand(90)).toBe("ats-ready");
    expect(atsBand(89)).toBe("balanced");
    expect(atsBand(75)).toBe("balanced");
    expect(atsBand(74)).toBe("design-forward");
  });
});

describe.each(TEMPLATES)("template: $name ($id)", (tpl) => {
  it("renders the full resume without throwing and shows its content", () => {
    const html = render(tpl.Render, fullResume);
    expect(html.length).toBeGreaterThan(0);
    // Real content reaches the markup. We check fields that are never split
    // across elements (some templates split the name into first/last, so we
    // don't assert the name is contiguous). Titles, bullets, skills and
    // school names are rendered as whole strings by every template.
    expect(html).toContain("Data Engineer");
    expect(html).toContain("Built and maintained data pipelines");
    expect(html).toContain("Python");
    expect(html).toContain("Example University");
  });

  it("renders sparse and empty resumes without throwing", () => {
    expect(() => render(tpl.Render, sparseResume)).not.toThrow();
    const emptyHtml = render(tpl.Render, emptyResume);
    expect(emptyHtml.length).toBeGreaterThan(0);
    // an empty contact still shows a name placeholder (may be split across
    // elements in display templates, so match the tokens, not the phrase)
    expect(emptyHtml).toContain("Your");
    expect(emptyHtml).toContain("Name");
  });

  it("never leaks undefined / NaN into the markup", () => {
    for (const resume of [fullResume, sparseResume, emptyResume]) {
      const html = render(tpl.Render, resume);
      expect(html, `${tpl.id} leaked a bad token`).not.toMatch(
        /undefined|NaN/,
      );
    }
  });
});

// Ghost-bullet placeholders are an editor-only affordance provided by the
// shared BulletList; templates that roll their own bullet markup opt out by
// design, so this guards the shared code path on a template that uses it.
describe("shared BulletList ghost bullets", () => {
  const classic = getTemplate("classic");
  it("shows the placeholder only when showGhostBullets is set", () => {
    expect(
      render(classic.Render, ghostResume, { showGhostBullets: false }),
    ).not.toContain(GHOST_BULLET);
    expect(
      render(classic.Render, ghostResume, { showGhostBullets: true }),
    ).toContain(GHOST_BULLET);
  });
});
