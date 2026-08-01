import { NextResponse, type NextRequest } from "next/server";
import { recordRequest, normalizeRoute } from "@/lib/metrics-store";

// Node runtime so the request counter shares one globalThis with the /metrics
// route (the Edge runtime is a separate context and would not share state).
export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|metrics|.*\\.).*)"],
};

export function middleware(req: NextRequest) {
  recordRequest(req.method, normalizeRoute(req.nextUrl.pathname));
  return NextResponse.next();
}
