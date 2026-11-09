import { NextResponse } from "next/server";
import { metric } from "@/lib/metric";

/** Client-side funnel beacon. Accepts only a short step name — nothing else. */
export async function POST(request: Request) {
  try {
    const { step } = (await request.json()) as { step?: string };
    if (typeof step === "string" && /^[a-z-]{2,24}$/.test(step)) {
      metric("step", { step });
    }
  } catch {
    /* malformed beacons are ignored */
  }
  return NextResponse.json({ ok: true });
}
