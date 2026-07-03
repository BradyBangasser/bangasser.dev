// ---------------------------------------------------------------------------
// Runs automatically before `npm run dev` / `npm run build` (see package.json
// "predev" / "prebuild"). It pulls public repo metadata from GitHub and
// writes it to content/projects/_generated.json, which lib/content.ts reads.
//
// This is intentionally a *build-time* scan, not a runtime API call:
//   - no GitHub rate-limit exposure to site visitors
//   - the site still works if GitHub is unreachable (falls back to the
//     previous snapshot, or an empty list on the very first run)
//
// Configure the account via GITHUB_USERNAME (defaults to BradyBangasser).
// Optionally set GITHUB_TOKEN to raise the API rate limit / include repos
// visible to that token.
// ---------------------------------------------------------------------------

import fs from "fs";
import path from "path";

const USERNAME = process.env.GITHUB_USERNAME || "BradyBangasser";
const TOKEN = process.env.GITHUB_TOKEN;
const OUT_DIR = path.join(process.cwd(), "content", "projects");
const OUT_FILE = path.join(OUT_DIR, "_generated.json");

// Repos to skip even if public (forks, playgrounds, dotfiles, etc).
// Edit this list as your account grows.
const EXCLUDE = new Set<string>([`${USERNAME}/${USERNAME}`]);
const EXCLUDE_FORKS = true;
const EXCLUDE_ARCHIVED = false;

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  updated_at: string;
  archived: boolean;
  fork: boolean;
  private: boolean;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const url = `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`;

  try {
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`GitHub API responded ${res.status} ${res.statusText}`);
    }

    const repos = (await res.json()) as GitHubRepo[];

    const cleaned = repos
      .filter((r) => !r.private)
      .filter((r) => !EXCLUDE.has(r.full_name))
      .filter((r) => !EXCLUDE_FORKS || !r.fork)
      .filter((r) => !EXCLUDE_ARCHIVED || !r.archived)
      .map((r) => ({
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage,
        language: r.language,
        stars: r.stargazers_count,
        topics: r.topics ?? [],
        updatedAt: r.updated_at,
        archived: r.archived,
        fork: r.fork,
      }))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

    fs.writeFileSync(
      OUT_FILE,
      JSON.stringify(
        { fetchedAt: new Date().toISOString(), username: USERNAME, repos: cleaned },
        null,
        2
      )
    );

    console.log(`[fetch-github] wrote ${cleaned.length} repos to ${path.relative(process.cwd(), OUT_FILE)}`);
  } catch (err) {
    console.warn(`[fetch-github] skipped (${(err as Error).message}).`);
    // Don't fail the build if GitHub is unreachable — keep whatever
    // snapshot already exists, or write an empty one on first run.
    if (!fs.existsSync(OUT_FILE)) {
      fs.writeFileSync(
        OUT_FILE,
        JSON.stringify({ fetchedAt: null, username: USERNAME, repos: [] }, null, 2)
      );
    }
  }
}

main();
