// ---------------------------------------------------------------------------
// Build-time project discovery. Runs before `npm run dev` / `npm run build`.
//
// Every repo in the account is a project (opt-out), plus any repos listed in
// `.include_repo.txt` in the bangasser.dev repo. For each we record metadata,
// detect docs/ and blog/ folders and a .resume.yml, read .related.txt, and
// pull the README (relative links rewritten to absolute). The result is written
// to content/projects/_generated.json (gitignored — never committed).
//
// Auth: set GITHUB_TOKEN to raise the rate limit (5000/hr vs 60/hr). With no
// token, the fetcher SLOWS DOWN — it spaces requests out and waits for the
// rate-limit window to reset rather than failing.
// ---------------------------------------------------------------------------

import fs from "fs";
import path from "path";

const USERNAME = process.env.GITHUB_USERNAME || "BradyBangasser";
const TOKEN = process.env.GITHUB_TOKEN;
const SITE_REPO = process.env.GITHUB_SITE_REPO || `${USERNAME}/bangasser.dev`;
const OUT_DIR = path.join(process.cwd(), "content", "projects");
const OUT_FILE = path.join(OUT_DIR, "_generated.json");

const ACTIVE_DAYS = 60; // a repo pushed within this window is framed as "active"
const OPT_OUT_FILE = ".nosite"; // a repo with this file is skipped
const UNAUTH_SPACING_MS = 1500; // spread unauthenticated calls to be gentle

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Repo {
  name: string; full_name: string; description: string | null; html_url: string;
  homepage: string | null; language: string | null; stargazers_count: number;
  open_issues_count: number; topics: string[]; pushed_at: string;
  archived: boolean; fork: boolean; private: boolean; default_branch: string;
  owner: { login: string };
}

// Rate-limit-aware GitHub API GET. Waits for the reset window instead of failing.
async function api(url: string, tries = 6): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "bangasser.dev-build",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  for (let attempt = 0; attempt < tries; attempt++) {
    if (!TOKEN) await sleep(UNAUTH_SPACING_MS);
    const res = await fetch(url, { headers });
    const remaining = Number(res.headers.get("x-ratelimit-remaining") ?? "1");
    const reset = Number(res.headers.get("x-ratelimit-reset") ?? "0") * 1000;
    const retryAfter = Number(res.headers.get("retry-after") ?? "0");

    if (res.status === 403 || res.status === 429) {
      const waitMs = retryAfter > 0 ? retryAfter * 1000
        : reset > Date.now() ? reset - Date.now() + 1000 : 60_000;
      console.warn(`[fetch-github] rate-limited; waiting ${Math.ceil(waitMs / 1000)}s for reset...`);
      await sleep(waitMs);
      continue;
    }
    // proactively pause if we're about to run out
    if (res.ok && remaining <= 1 && reset > Date.now()) {
      console.warn(`[fetch-github] 0 requests left; waiting ${Math.ceil((reset - Date.now()) / 1000)}s...`);
      await sleep(reset - Date.now() + 1000);
    }
    return res;
  }
  throw new Error(`GitHub API gave up after ${tries} attempts: ${url}`);
}

// raw.githubusercontent.com does NOT count against the API rate limit.
async function raw(owner: string, repo: string, branch: string, file: string): Promise<string | null> {
  const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file}`);
  return res.ok ? res.text() : null;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Rewrite relative README links/images to absolute GitHub URLs.
function absolutizeReadme(md: string, owner: string, repo: string, branch: string): string {
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
  const blobBase = `https://github.com/${owner}/${repo}/blob/${branch}/`;
  const isAbs = (u: string) => /^(https?:|mailto:|#|\/\/)/i.test(u.trim());
  const norm = (u: string) => u.replace(/^\.?\//, "");
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, u) =>
    isAbs(u) ? m : `![${alt}](${rawBase}${norm(u)})`);
  md = md.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, u) =>
    isAbs(u) ? m : `[${txt}](${blobBase}${norm(u)})`);
  md = md.replace(/\ssrc=["']([^"']+)["']/g, (m, u) =>
    isAbs(u) ? m : ` src="${rawBase}${norm(u)}"`);
  return md;
}

async function loadIncludeRepos(): Promise<string[]> {
  const [owner, repo] = SITE_REPO.split("/");
  for (const branch of ["main", "master"]) {
    const txt = await raw(owner, repo, branch, ".include_repo.txt");
    if (txt != null) {
      return txt.split("\n").map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#") && l.includes("/"));
    }
  }
  return [];
}

async function listAccountRepos(): Promise<Repo[]> {
  const out: Repo[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await api(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed&page=${page}`);
    if (!res.ok) throw new Error(`list repos ${res.status}`);
    const batch = (await res.json()) as Repo[];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

async function getRepo(fullName: string): Promise<Repo | null> {
  const res = await api(`https://api.github.com/repos/${fullName}`);
  return res.ok ? ((await res.json()) as Repo) : null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const projects: any[] = [];
  const bySlug = new Map<string, any>();
  try {
    const account = (await listAccountRepos()).filter((r) => !r.private && !r.fork && !r.archived);
    const extra: Repo[] = [];
    for (const fn of await loadIncludeRepos()) {
      const r = await getRepo(fn);
      if (r && !r.private) extra.push(r);
    }
    const candidates = [...account, ...extra];

    for (const r of candidates) {
      const owner = r.owner?.login ?? r.full_name.split("/")[0];
      const branch = r.default_branch || "main";
      // top-level contents: detect README, docs/, blog/, .resume.yml, .related.txt, opt-out
      const cRes = await api(`https://api.github.com/repos/${r.full_name}/contents`);
      if (!cRes.ok) continue;
      const entries = (await cRes.json()) as { name: string; type: string }[];
      const names = new Set(entries.map((e) => e.name));
      if (names.has(OPT_OUT_FILE)) continue;                 // explicit opt-out
      const readmeEntry = entries.find((e) => /^readme\.md$/i.test(e.name) && e.type === "file");
      if (!readmeEntry) continue;                            // skip repos with no README

      const hasDocs = entries.some((e) => e.type === "dir" && e.name === "docs");
      const hasBlog = entries.some((e) => e.type === "dir" && e.name === "blog");
      const hasResumeYml = names.has(".resume.yml");
      let readme = await raw(owner, r.name, branch, readmeEntry.name);
      if (readme) readme = absolutizeReadme(readme, owner, r.name, branch);
      let related: string[] = [];
      if (names.has(".related.txt")) {
        const rel = await raw(owner, r.name, branch, ".related.txt");
        if (rel) related = rel.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
      }

      const active = (Date.now() - new Date(r.pushed_at).getTime()) / 86_400_000 <= ACTIVE_DAYS;
      const slug = slugify(r.name);
      const project = {
        slug, name: r.name, fullName: r.full_name,
        description: r.description, url: r.html_url, homepage: r.homepage,
        language: r.language, stars: r.stargazers_count, openIssues: r.open_issues_count,
        topics: r.topics ?? [], pushedAt: r.pushed_at, active, defaultBranch: branch,
        hasDocs, hasBlog, hasResumeYml, related, readme,
        external: owner.toLowerCase() !== USERNAME.toLowerCase(),
      };
      if (bySlug.has(slug)) console.warn(`[fetch-github] duplicate slug "${slug}" — ${bySlug.get(slug).fullName} overwritten by ${r.full_name}`);
      bySlug.set(slug, project);
    }

    for (const p of bySlug.values()) projects.push(p);
    projects.sort((a, b) => (a.pushedAt < b.pushedAt ? 1 : -1));
    fs.writeFileSync(OUT_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), username: USERNAME, projects }, null, 2));
    console.log(`[fetch-github] wrote ${projects.length} projects (${projects.filter((p) => p.active).length} active)`);
  } catch (err) {
    console.warn(`[fetch-github] error: ${(err as Error).message}`);
    if (!fs.existsSync(OUT_FILE)) {
      fs.writeFileSync(OUT_FILE, JSON.stringify({ fetchedAt: null, username: USERNAME, projects: [] }, null, 2));
    }
  }
}

main();
