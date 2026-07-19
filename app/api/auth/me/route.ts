import { NextResponse } from "next/server";
import { readSession, isOwner } from "@/lib/auth";

export async function GET() {
  const s = await readSession();
  if (!s) return NextResponse.json({ login: null });
  return NextResponse.json({ login: s.login, owner: isOwner(s.login) });
}
