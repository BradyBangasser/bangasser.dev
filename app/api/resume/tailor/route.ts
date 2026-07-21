import { NextResponse } from "next/server";
import { readSession, isOwner } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import manifest from "@/public/manifest.json";

export const runtime = "nodejs";

// Given a pasted job description, pick the best prebuilt resume variant.
// v1 selects field + length + template (all real, prebuilt) and explains why.
// Only the owner or a signed-in GitHub user can call it; others get presets.
export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { needAuth: true, signIn: "/api/auth/github" }, { status: 401 },
    );
  }
  const owner = isOwner(session.login);
  const limit = rateLimit(`tailor:${session.login}`, owner ? 1000 : 10);
  if (!limit.ok) {
    return NextResponse.json({ error: "Rate limit reached, try again later." }, { status: 429 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "AI not configured." }, { status: 501 });

  const { jd } = await req.json().catch(() => ({ jd: "" }));
  if (typeof jd !== "string" || jd.trim().length < 30) {
    return NextResponse.json({ error: "Paste a longer job description." }, { status: 400 });
  }
  const clipped = jd.slice(0, 6000); // cap input to control cost

  const presets = Object.entries(manifest.presets)
    .map(([id, p]: [string, any]) => `${id}: ${p.label} — ${p.headline}`)
    .join("\n");

  const system =
    "You match a job description to the best-fitting prebuilt resume variant. " +
    "Reply with ONLY strict JSON, no prose, shaped as " +
    '{"preset":"<id>","length":"onepage|twopage|full","template":"designed|ats","rationale":"<one or two sentences>"}. ' +
    "Choose the preset whose focus best matches the role. Use 'ats' only if the posting mentions an application portal or ATS; otherwise 'designed'. " +
    "Default length is onepage unless the role is senior or research-heavy (then twopage).";

  const user = `Available presets:\n${presets}\n\nLengths: onepage, twopage, full\nTemplates: designed, ats\n\nJOB DESCRIPTION:\n${clipped}`;

  let choice: any;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.RESUME_AI_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    const data = await r.json();
    const text = (data.content ?? []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    choice = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return NextResponse.json({ error: "Could not parse AI response." }, { status: 502 });
  }

  // Validate strictly against what actually exists.
  const presetIds = Object.keys(manifest.presets);
  const preset = presetIds.includes(choice?.preset) ? choice.preset : "sre";
  const length = (manifest.lengths as string[]).includes(choice?.length) ? choice.length : "onepage";
  const template = (manifest.templates as string[]).includes(choice?.template) ? choice.template : "designed";
  const entry = (manifest.files as any)[`${preset}-${length}-${template}`];
  if (!entry) return NextResponse.json({ error: "No matching resume." }, { status: 500 });

  return NextResponse.json({
    preset, length, template,
    typ: entry.typ, data: entry.data, pages: entry.pages,
    rationale: String(choice?.rationale ?? "").slice(0, 400),
    remaining: limit.remaining,
    owner,
  });
}
