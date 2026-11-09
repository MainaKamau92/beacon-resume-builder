"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Resume } from "@/lib/types";
import { getTemplate } from "@/templates";
import { fitDesignWidth } from "@/lib/fit";

/**
 * On-screen answer to "what will the PDF look like." It shrinks a
 * slightly-too-long resume to fit a single US-Letter page (rendering the
 * design a bit wider so text reflows smaller but still fills the width — see
 * lib/fit), and only falls back to multiple page cards when the content is too
 * long to fit even at the shrink floor. Same fit math as the PDF export, so
 * preview and download agree. Chromium's real print fragmentation stays the
 * source of truth for the multi-page case.
 */

const BREAK_SELECTOR = "[data-shead],[data-entry-head],[data-entry],li";

export function PaginatedSheet({
  resume,
  template,
  width = 560,
}: {
  resume: Resume;
  template: string;
  width?: number;
}) {
  const { Render } = getTemplate(template);
  const measureRef = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState<{
    dw: number;
    breaks: number[];
    total: number;
  }>({ dw: width, breaks: [0], total: 0 });

  const inch = width / 8.5;
  const pageH = 11 * inch;
  const marginV = 0.5 * inch;
  const pageContentH = pageH - 2 * marginV; // usable height per page (10in)

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;

    function compute() {
      const node = measureRef.current;
      if (!node) return;
      const { designWidth, naturalHeight } = fitDesignWidth(node);
      const scale = width / designWidth;
      // one page holds this much *natural* (pre-scale) height
      const pageUsableNat = pageContentH / scale;

      const rootTop = node.getBoundingClientRect().top;
      const cands = Array.from(node.querySelectorAll(BREAK_SELECTOR))
        .map((c) => ({
          top: c.getBoundingClientRect().top - rootTop,
          head: c.matches("[data-shead],[data-entry-head]"),
        }))
        .filter((c) => c.top > 1)
        .sort((a, b) => a.top - b.top);

      const breaks = [0];
      let start = 0;
      let guard = 0;
      while (start + pageUsableNat < naturalHeight && guard++ < 200) {
        const limit = start + pageUsableNat;
        let idx = -1;
        for (let i = 0; i < cands.length; i++) {
          if (cands[i].top > start + 8 && cands[i].top <= limit) idx = i;
          else if (cands[i].top > limit) break;
        }
        let next: number;
        if (idx < 0) next = limit;
        else if (
          !cands[idx].head &&
          idx > 0 &&
          cands[idx - 1].head &&
          cands[idx - 1].top > start + 8
        )
          next = cands[idx - 1].top; // don't orphan a head at the page bottom
        else next = cands[idx].top;
        if (next <= start) next = limit;
        breaks.push(next);
        start = next;
      }
      setSt({ dw: designWidth, breaks, total: naturalHeight });
    }

    compute();
    (
      document as Document & { fonts?: { ready: Promise<unknown> } }
    ).fonts?.ready.then(compute);
  }, [resume, template, width, pageContentH]);

  const { dw, breaks, total } = st;
  const scale = width / dw;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* hidden measurer — the one node fit math + break offsets read from */}
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
        <div ref={measureRef} className="bg-white" style={{ width }}>
          <Render
            resume={resume}
            keywordTerms={[]}
            highlightKey={null}
            showGhostBullets={false}
          />
        </div>
      </div>

      {breaks.map((from, p) => {
        const to = breaks[p + 1] ?? Math.max(total, from + 1);
        const sliceH = Math.max(0, to - from) * scale;
        return (
          <div
            key={p}
            className="relative overflow-hidden rounded-[3px] border border-line bg-white"
            style={{
              width,
              height: pageH,
              boxShadow: "0 8px 24px rgba(20,32,46,.12)",
            }}
          >
            <div style={{ height: marginV }} />
            <div style={{ height: sliceH, overflow: "hidden" }}>
              <div style={{ zoom: scale, width: dw } as CSSProperties}>
                <div style={{ transform: `translateY(${-from}px)` }}>
                  <Render
                    resume={resume}
                    keywordTerms={[]}
                    highlightKey={null}
                    showGhostBullets={false}
                  />
                </div>
              </div>
            </div>
            {breaks.length > 1 && (
              <div className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-medium text-ghost2">
                {p + 1} / {breaks.length}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
