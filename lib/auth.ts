// Minimal GitHub-login session: an HMAC-signed cookie holding the user's
// GitHub login. No external auth dependency. Requires env:
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_SECRET, RESUME_OWNER_LOGIN
import { cookies } from "next/headers";

const COOKIE = "bb_session";
const enc = new TextEncoder();

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" },
    false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Buffer.from(sig).toString("base64url");
}

export async function makeSession(login: string): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "";
  const payload = `${login}.${Date.now()}`;
  const sig = await hmac(payload, secret);
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export async function readSession(): Promise<{ login: string } | null> {
  const secret = process.env.AUTH_SECRET ?? "";
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || !secret) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const payload = Buffer.from(body, "base64url").toString();
  if ((await hmac(payload, secret)) !== sig) return null;
  const [login, ts] = payload.split(".");
  // 30-day expiry
  if (Date.now() - Number(ts) > 30 * 864e5) return null;
  return { login };
}

export const SESSION_COOKIE = COOKIE;
export function isOwner(login: string | undefined | null): boolean {
  const owner = (process.env.RESUME_OWNER_LOGIN ?? "").toLowerCase();
  return !!login && login.toLowerCase() === owner;
}
