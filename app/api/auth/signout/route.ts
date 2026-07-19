import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export function GET(req: Request) {
  const res = NextResponse.redirect(`${new URL(req.url).origin}/resume`);
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
