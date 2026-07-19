import { NextResponse } from "next/server";
import { makeSession, SESSION_COOKIE } from "@/lib/auth";

// Exchange the OAuth code for the user's GitHub login, set a signed cookie.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const code = new URL(req.url).searchParams.get("code");
  const id = process.env.GITHUB_CLIENT_ID;
  const secret = process.env.GITHUB_CLIENT_SECRET;
  if (!code || !id || !secret) {
    return NextResponse.redirect(`${origin}/resume?auth=error`);
  }
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: id, client_secret: secret, code }),
  });
  const { access_token } = await tokenRes.json();
  if (!access_token) return NextResponse.redirect(`${origin}/resume?auth=error`);

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}`, Accept: "application/vnd.github+json" },
  });
  const user = await userRes.json();
  if (!user?.login) return NextResponse.redirect(`${origin}/resume?auth=error`);

  const res = NextResponse.redirect(`${origin}/resume?auth=ok`);
  res.cookies.set(SESSION_COOKIE, await makeSession(user.login), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 864e2,
  });
  return res;
}
