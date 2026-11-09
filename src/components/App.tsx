"use client";

import { useState } from "react";
import { Logo, ProgressBars } from "@/components/chrome";
import { useAppStore } from "@/lib/store";
import { LandingSection } from "@/components/sections/LandingSection";
import { ImportStep } from "@/components/sections/ImportSection";
import { JdStep } from "@/components/sections/JdStep";
import { TemplateStep } from "@/components/sections/TemplatesSection";
import { EditorStep } from "@/components/sections/EditorSection";
import { TailorStep } from "@/components/sections/TailorSection";
import { ExportStep } from "@/components/sections/ExportSection";
import { DashboardStep } from "@/components/sections/DashboardSection";

export type StepId =
  | "import"
  | "template"
  | "editor"
  | "jd"
  | "tailor"
  | "export"
  | "dashboard";

/**
 * Flow: bring a resume in → pick a template → fill it in (editor) → *then*
 * optionally tailor to a job (jd → tailor) → export. Choosing the template up
 * front means the editor always shows a layout the user actually picked, and
 * the extraction drops straight into it — no separate "review what we parsed"
 * step.
 */
const ORDER: StepId[] = [
  "import",
  "template",
  "editor",
  "jd",
  "tailor",
  "export",
  "dashboard",
];

/** Steps that get a progress bar (jd shares tailor's; dashboard = done). */
const MAIN: StepId[] = ["import", "template", "editor", "tailor", "export"];

function progressIndex(step: StepId): number {
  if (step === "jd") return MAIN.indexOf("tailor");
  if (step === "dashboard") return MAIN.length;
  return MAIN.indexOf(step);
}

export function App() {
  const [phase, setPhase] = useState<"landing" | "flow">("landing");
  const [step, setStep] = useState<StepId>("import");

  // anonymous funnel breadcrumb — a bare step name, nothing else
  function beacon(step: string) {
    fetch("/api/hit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step }),
      keepalive: true,
    }).catch(() => {});
  }

  function go(next: StepId) {
    beacon(next);
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function start() {
    beacon("start");
    setStep("import");
    setPhase("flow");
    window.scrollTo({ top: 0 });
  }

  function back() {
    const i = ORDER.indexOf(step);
    if (i <= 0) {
      setPhase("landing");
      return;
    }
    go(ORDER[i - 1]);
  }

  if (phase === "landing") {
    return (
      <div className="step-anim">
        <LandingSection onGetStarted={start} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white px-6">
        <button
          type="button"
          onClick={back}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-page hover:text-ink"
        >
          <span aria-hidden>←</span> Back
        </button>
        <ProgressBars current={progressIndex(step)} total={MAIN.length} />
        <button
          type="button"
          onClick={() => setPhase("landing")}
          aria-label="Back to start"
          className="rounded-lg p-1 transition-opacity hover:opacity-80"
        >
          <Logo size={24} />
        </button>
      </header>

      <div key={step} className="step-anim flex flex-1 flex-col">
        {step === "import" && <ImportStep onContinue={() => go("template")} />}
        {step === "template" && (
          <TemplateStep onContinue={() => go("editor")} />
        )}
        {step === "editor" && <EditorStep onContinue={() => go("jd")} />}
        {step === "jd" && (
          <JdStep
            // tailoring is optional: with a JD analyzed, go tailor; if skipped
            // (no active version), jump straight to export
            onContinue={() =>
              go(useAppStore.getState().activeVersionId ? "tailor" : "export")
            }
          />
        )}
        {step === "tailor" && <TailorStep onContinue={() => go("export")} />}
        {step === "export" && (
          <ExportStep
            onBackToEditor={() => go("editor")}
            onDone={() => go("dashboard")}
          />
        )}
        {step === "dashboard" && (
          <DashboardStep
            onOpenVersion={() => go("tailor")}
            onNewVersion={() => go("jd")}
            onEditResume={() => go("editor")}
            onExport={() => go("export")}
          />
        )}
      </div>
    </div>
  );
}
