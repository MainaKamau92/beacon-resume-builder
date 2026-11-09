"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Render-prop wrapper that measures its own width and hands children
 * `min(max, containerWidth)`. Fixed-width previews (ResumePreview & co.)
 * pass the value straight to their `width` prop so they shrink to fit
 * narrow screens instead of overflowing the viewport.
 */
export function FitWidth({
  max,
  children,
}: {
  max: number;
  children: (width: number) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(max);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setWidth(Math.max(200, Math.min(max, el.clientWidth)));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial measure must happen before paint to avoid a flash of overflow
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [max]);

  return (
    <div ref={ref} className="flex w-full justify-center">
      {children(width)}
    </div>
  );
}
