"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Resume } from "@/lib/types";
import { getTemplate } from "@/templates";
import { PAGE_DESIGN_WIDTH, fitDesignWidth } from "@/lib/fit";

/** US Letter at 96dpi: 8.5in × 96 = 816px wide. */
const LETTER_WIDTH_PX = 816;

interface PrintData {
  resume: Resume;
  template: string;
}

declare global {
  interface Window {
    __PRINT_DATA__?: PrintData;
  }
}

/**
 * Headless-only page used by /api/pdf. The PDF service injects
 * `window.__PRINT_DATA__` before navigation; we compute the same
 * shrink-to-fit-one-page width the on-screen preview uses (lib/fit) and render
 * the template scaled to the Letter page width, so the PDF matches the preview
 * exactly. When the resume is too long to fit even at the shrink floor,
 * Chromium fragments the (zoomed) content across pages as before. We only
 * signal `data-print-ready` once fonts are loaded and the fit is measured.
 */
export default function PrintPage() {
  const [data, setData] = useState<PrintData | null>(null);
  const [dw, setDw] = useState(PAGE_DESIGN_WIDTH);
  const [ready, setReady] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // read the data the PDF service injected before navigation (post-mount)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(window.__PRINT_DATA__ ?? null);
  }, []);

  useLayoutEffect(() => {
    if (!data) return;
    let cancelled = false;
    (async () => {
      // measure only after webfonts settle, so heights are accurate
      try {
        await (
          document as Document & { fonts?: { ready: Promise<unknown> } }
        ).fonts?.ready;
      } catch {
        /* fonts API best-effort */
      }
      if (cancelled) return;
      const el = measureRef.current;
      if (el) setDw(fitDesignWidth(el).designWidth);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  if (!data) return null;
  const { Render } = getTemplate(data.template);
  const content = (
    <Render
      resume={data.resume}
      keywordTerms={[]}
      highlightKey={null}
      showGhostBullets={false}
    />
  );

  return (
    <>
      {/* hidden measurer — width is mutated by fitDesignWidth while probing */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -99999,
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <div ref={measureRef} className="bg-white" style={{ width: PAGE_DESIGN_WIDTH }}>
          {content}
        </div>
      </div>

      <div className="pdf-sheet bg-white" {...(ready ? { "data-print-ready": true } : {})}>
        <div style={{ zoom: LETTER_WIDTH_PX / dw, width: dw } as CSSProperties}>
          {content}
        </div>
      </div>
    </>
  );
}
