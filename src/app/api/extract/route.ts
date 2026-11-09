import { NextResponse } from "next/server";
import { metric } from "@/lib/metric";
import { ExtractionError, extractFromText } from "@/lib/extract";
import { recoverWithAi } from "@/lib/extract-ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Resume extraction endpoint. Parses the uploaded file to text (PDF via
 * pdf.js with line reconstruction, DOCX via mammoth, TXT as-is) and runs the
 * deterministic rule engine in src/lib/extract.ts. An LLM refinement pass
 * can later slot in after the rule engine for messier documents.
 */

interface PdfItem {
  x: number;
  x2: number;
  y: number;
  str: string;
}

// Column gutters are wide (15pt+); word gaps within a line are only ~3–6pt.
const MIN_GUTTER = 10;

/**
 * Split a page's items into columns by finding a vertical gutter that no
 * item crosses, with real content on both sides. Without this, two-column
 * resumes interleave sidebar lines into the main flow ("EXPERIENCE SKILLS").
 */
function splitColumns(items: PdfItem[], depth = 0): PdfItem[][] {
  if (depth >= 2 || items.length < 16) return [items];
  const starts = [...new Set(items.map((i) => Math.round(i.x)))].sort(
    (a, b) => a - b,
  );
  let best: { x: number; gap: number } | null = null;
  for (const x of starts.slice(1)) {
    const left: PdfItem[] = [];
    const right: PdfItem[] = [];
    let crosses = false;
    for (const item of items) {
      if (item.x2 <= x + 1) left.push(item);
      else if (item.x >= x - 1) right.push(item);
      else {
        crosses = true;
        break;
      }
    }
    if (crosses || left.length < 8 || right.length < 8) continue;
    const gap = x - Math.max(...left.map((i) => i.x2));
    if (gap < MIN_GUTTER) continue;
    if (!best || gap > best.gap) best = { x, gap };
  }
  if (!best) return [items];
  const cut = best.x;
  return [
    ...splitColumns(items.filter((i) => i.x2 <= cut + 1), depth + 1),
    ...splitColumns(items.filter((i) => i.x2 > cut + 1), depth + 1),
  ];
}

/** Rebuild reading lines from pdf.js positioned text items, column-aware. */
async function pdfToText(buffer: Buffer): Promise<string> {
  const { getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const pages: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const items: PdfItem[] = [];
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      items.push({
        x: item.transform[4],
        x2: item.transform[4] + item.width,
        y: item.transform[5],
        str: item.str,
      });
    }
    // each column reads top→bottom before moving right to the next one
    const columns = splitColumns(items).map((col) => {
      const rows = new Map<number, PdfItem[]>();
      for (const item of col) {
        const y = Math.round(item.y / 2) * 2;
        const row = rows.get(y) ?? [];
        row.push(item);
        rows.set(y, row);
      }
      return [...rows.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, rowItems]) =>
          rowItems
            .sort((a, b) => a.x - b.x)
            .map((i) => i.str)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim(),
        )
        .join("\n");
    });
    pages.push(columns.join("\n"));
  }
  return pages.join("\n");
}

async function docxToText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

export async function POST(request: Request) {
  const started = Date.now();
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is larger than 10 MB" },
      { status: 413 },
    );
  }
  const refine = form?.get("refine") !== "false";
  const filename = file.name || "resume";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let text: string;
    if (ext === "pdf" || file.type === "application/pdf") {
      text = await pdfToText(buffer);
    } else if (
      ext === "docx" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await docxToText(buffer);
    } else if (ext === "txt" || file.type.startsWith("text/")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type — use PDF, DOCX, or TXT" },
        { status: 415 },
      );
    }

    let result = extractFromText(text, filename, refine);
    // AI recovery only runs for sections the rule engine wasn't sure about
    result = await recoverWithAi(result, refine);
    result.seconds = Math.max(0.1, (Date.now() - started) / 1000);
    // round for display
    result.seconds = Math.round(result.seconds * 10) / 10;
    metric("extract-ok", {
      ext,
      kb: Math.round(file.size / 1024),
      secs: result.seconds,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ExtractionError) {
      metric("extract-unreadable", { ext, kb: Math.round(file.size / 1024) });
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("extract failed:", err);
    return NextResponse.json(
      { error: "We couldn't read that file — it may be corrupted or scanned." },
      { status: 422 },
    );
  }
}
