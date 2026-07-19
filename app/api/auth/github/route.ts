import { NextResponse } from "next/server";

// Start the GitHub OAuth web flow.
export function GET(req: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GitHub auth not configured" }, { status: 501 });
  }
  const origin = new URL(req.url).origin;
  const redirect = `${origin}/api/auth/github/callback`;
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("scope", "read:user");
  return NextResponse.redirect(url.toString());
}
