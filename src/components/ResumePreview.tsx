"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Resume } from "@/lib/types";
import { PAGE_MIN_HEIGHT, PAGE_WIDTH, getTemplate } from "@/templates";

/**
 * The resume page shell. Looks up the template module from the registry and
 * renders it on a full US-Letter-proportioned sheet; `width` scales the whole
 * page down (thumbnails, export preview) while keeping it pixel-identical to
 * the final output. The wrapper's layout height tracks the *scaled* sheet
 * height so scaled previews don't leave phantom whitespace.
 */
export function ResumePreview({
  resume,
  template,
  width = PAGE_WIDTH,
  highlightKey = null,
  keywordTerms = [],
  showGhostBullets = false,
  className = "",
  paginate = false,
  children,
}: {
  resume: Resume;
  template: string;
  width?: number;
  highlightKey?: string | null;
  keywordTerms?: string[];
  showGhostBullets?: boolean;
  className?: string;
  /** PDF/print mode: scale with `zoom` so content flows across real pages. */
  paginate?: boolean;
  children?: ReactNode;
}) {
  const scale = width / PAGE_WIDTH;
  const sheetRef = useRef<HTMLDivElement>(null);
  const [naturalHeight, setNaturalHeight] = useState(PAGE_MIN_HEIGHT);

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNaturalHeight(el.offsetHeight));
    ro.observe(el);
    setNaturalHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const { Render } = getTemplate(template);

  // Print/PDF: `transform: scale()` renders the sheet as one atomic layer
  // Chromium can't paginate, so multi-page resumes overlap. `zoom` scales the
  // box in layout, so content reflows and breaks across pages normally. No
  // fixed height (let it grow) and no on-screen chrome.
  if (paginate) {
    return (
      <div
        className="resume-sheet bg-white"
        // `zoom` isn't in the standard CSS types but Chromium honors it
        style={{ width: PAGE_WIDTH, zoom: scale } as React.CSSProperties}
      >
        {children}
        <Render
          resume={resume}
          keywordTerms={keywordTerms}
          highlightKey={highlightKey}
          showGhostBullets={showGhostBullets}
        />
      </div>
    );
  }

  return (
    <div
      style={{ width, height: naturalHeight * scale }}
      className={className}
    >
      <div
        ref={sheetRef}
        className="resume-sheet relative rounded border border-line bg-white shadow-sheet"
        style={{
          width: PAGE_WIDTH,
          minHeight: PAGE_MIN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
        <Render
          resume={resume}
          keywordTerms={keywordTerms}
          highlightKey={highlightKey}
          showGhostBullets={showGhostBullets}
        />
      </div>
    </div>
  );
}
