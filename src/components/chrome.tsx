"use client";

import type { ReactNode } from "react";

/**
 * Prints just one resume sheet: marks the wrapper `.print-active` so the
 * print CSS can isolate it from the rest of the page (and from the other
 * previews on the same page).
 */
export function printElement(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("print-active");
  const cleanup = () => {
    el.classList.remove("print-active");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-[7px] bg-primary font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      R
    </div>
  );
}

export function ProgressBars({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 w-[34px] rounded-[3px] ${i <= current ? "bg-primary" : "bg-line"}`}
        />
      ))}
    </div>
  );
}

export function Toggle({
  on,
  onChange,
  size = "md",
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  size?: "sm" | "md";
}) {
  const dims =
    size === "md"
      ? { w: 46, h: 26, knob: 20 }
      : { w: 38, h: 22, knob: 16 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex rounded-full p-[3px] transition-colors ${on ? "justify-end bg-primary" : "justify-start bg-input2"}`}
      style={{
        width: dims.w,
        height: dims.h,
        boxShadow: "inset 0 1px 2px rgba(0,0,0,.12)",
      }}
    >
      <span
        className="rounded-full bg-white"
        style={{
          width: dims.knob,
          height: dims.knob,
          boxShadow: "0 1px 2px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

/** The ✦ AI icon tile used across suggestion chips and toggles. */
export function AiIcon({ size = 20 }: { size?: number }) {
  return (
    <div
      className="grid flex-none place-items-center rounded-md bg-primary font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      ✦
    </div>
  );
}

export function MatchRing({
  score,
  size = 84,
  thickness,
  color = "#2f6bdf",
  children,
}: {
  score: number;
  size?: number;
  thickness?: number;
  color?: string;
  children?: ReactNode;
}) {
  const deg = Math.round((Math.max(0, Math.min(100, score)) / 100) * 360);
  const inner = size - 2 * (thickness ?? Math.round(size * 0.12));
  return (
    <div
      className="grid flex-none place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} 0 ${deg}deg, #e3e9f1 ${deg}deg 360deg)`,
      }}
    >
      <div
        className="grid place-items-center rounded-full bg-white"
        style={{ width: inner, height: inner }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Slim action bar at the top of a wizard step — actions only, right-aligned
 * (the step chrome deliberately carries no logo/title clutter).
 */
export function StepActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[60px] items-center justify-end gap-3.5 border-b border-line bg-white px-10">
      {children}
    </div>
  );
}
