import { NextResponse } from "next/server";

/**
 * Zero-work liveness endpoint. External uptime pingers hit this every few
 * minutes to keep the free Render instance from spinning down (15 min idle
 * → ~50s cold start). Returns no data worth caching or scraping.
 */
export async function GET() {
  return NextResponse.json({ ok: true });
}
