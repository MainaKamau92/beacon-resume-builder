import { NextResponse } from "next/server";
import { metric } from "@/lib/metric";
import puppeteer, { type Browser } from "puppeteer";
import type { Resume } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Pixel-perfect PDF generation: headless Chromium loads the app's own
 * /print route (same React templates, same compiled CSS, same fonts) with
 * the resume injected, and prints to US Letter. Text stays selectable, so
 * the output remains ATS-parseable.
 */

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    // --no-sandbox is required to run Chromium as root inside a container;
    // safe here because we only ever load our own trusted /print route.
    browserPromise = puppeteer
      .launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          // containers mount a tiny /dev/shm; without this Chromium crashes
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      })
      .then((b) => {
      b.on("disconnected", () => {
        browserPromise = null;
      });
      return b;
    });
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

function sanitizeFilename(name: string): string {
  return (name || "resume").replace(/[^\w.-]+/g, "-").slice(0, 120);
}

export async function POST(request: Request) {
  const { resume, template, filename } = (await request.json()) as {
    resume: Resume;
    template: string;
    filename?: string;
  };
  if (!resume) {
    return NextResponse.json({ error: "Missing resume" }, { status: 400 });
  }

  // Navigate Chromium to this same server directly — behind a proxy (Render),
  // request.url is the public HTTPS origin and looping out through it is slow
  // and fragile. The app itself serves /print plus all assets and fonts.
  // In dev there is no proxy, and `next dev` may have fallen back to another
  // port with PORT unset — the request's own port is the reliable one there.
  const port =
    process.env.NODE_ENV === "development"
      ? new URL(request.url).port || "3000"
      : (process.env.PORT ?? "3000");
  const origin = `http://127.0.0.1:${port}`;
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.evaluateOnNewDocument(
      (data: unknown) => {
        (window as unknown as Record<string, unknown>).__PRINT_DATA__ = data;
      },
      { resume, template },
    );
    // render with screen styles: the app's @media print rules exist for the
    // in-browser print-dialog fallback and would blank this page
    await page.emulateMediaType("screen");
    await page.goto(`${origin}/print`, { waitUntil: "networkidle0" });
    await page.waitForSelector("[data-print-ready]", { timeout: 15_000 });
    // make sure webfonts are in before printing
    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "letter",
      printBackground: true,
      // top/bottom margins reserve whitespace on *every* page so content
      // never prints to the edge or gets sliced at a page break. Left/right
      // stay 0 — the template fills the full width with its own side padding.
      margin: { top: "0.5in", right: 0, bottom: "0.5in", left: 0 },
    });

    metric("pdf-ok", { template, kb: Math.round(pdf.length / 1024) });
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(
          filename ?? "resume",
        )}.pdf"`,
      },
    });
  } catch (err) {
    metric("pdf-failed");
    console.error("pdf generation failed:", err);
    return NextResponse.json(
      { error: `PDF generation failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  } finally {
    await page.close().catch(() => {});
  }
}
