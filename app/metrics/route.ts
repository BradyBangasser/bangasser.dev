// Prometheus scrape endpoint: default Node process metrics, build_info, HTTP
// request counts by route, and 5xx error counts.

import { NextResponse } from "next/server";
import { renderMetrics } from "@/lib/metrics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { body, contentType } = await renderMetrics();
  return new NextResponse(body, { status: 200, headers: { "Content-Type": contentType } });
}
