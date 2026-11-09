"use client";

import { useEffect, useRef, useState } from "react";
import { ResumePreview } from "@/components/ResumePreview";
import { sampleResume } from "@/lib/sample";
import type { Resume } from "@/lib/types";
import { PAGE_MIN_HEIGHT, PAGE_WIDTH } from "@/templates";

function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function hasContent(resume: Resume): boolean {
  return Boolean(
    resume.contact.name ||
      resume.experience.some((e) => e.bullets.some((b) => b.trim())),
  );
}

/**
 * Live template thumbnail: renders the real ResumePreview scaled to the
 * container width. By default it shows the FULL page at true page
 * proportions — identical to the final output; pass `cropHeight` for a
 * fixed-height crop (e.g. small dashboard cards). Shows the user's own
 * resume when it has content, sample data otherwise.
 */
export function TemplateThumb({
  template,
  resume,
  cropHeight,
}: {
  template: string;
  resume: Resume;
  cropHeight?: number;
}) {
  const [ref, width] = useMeasuredWidth<HTMLDivElement>();
  const previewResume = hasContent(resume) ? resume : sampleResume;
  const fullHeight = width * (PAGE_MIN_HEIGHT / PAGE_WIDTH);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-lg border border-[#eef1f6] bg-[#fbfcfe]"
      style={{ height: cropHeight ?? (width > 0 ? fullHeight : undefined) }}
    >
      {width > 0 && (
        <ResumePreview
          resume={previewResume}
          template={template}
          width={width}
        />
      )}
    </div>
  );
}
