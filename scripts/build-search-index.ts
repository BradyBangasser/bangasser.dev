// Build-time site-wide search index. Runs in prebuild after fetch-github so it
// sees discovered projects and repo articles. Output is a single static JSON
// (gitignored) the client fetches lazily on first search.

import * as fs from "fs";
import * as path from "path";
import { getAllProjects, getGeneratedPosts, getAllPosts } from "../lib/content";

const ROOT = process.cwd();

// strip markdown to plain words, capped so the index stays light
function strip(md: string): string {
  return (md ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}

type Entry = { type: string; title: string; url: string; summary: string; tags: string[]; text: string };
const entries: Entry[] = [];

for (const p of getAllProjects()) {
  entries.push({ type: "project", title: p.title, url: `/projects/${p.slug}`,
    summary: p.summary ?? "", tags: p.tags ?? [], text: strip(p.content) });
}
for (const a of getGeneratedPosts()) {
  entries.push({ type: "article", title: a.title, url: `/blog/${a.projectSlug}/content/${a.slug}`,
    summary: a.summary ?? "", tags: a.tags ?? [], text: strip(a.content) });
}
for (const post of getAllPosts()) {
  entries.push({ type: "post", title: post.title, url: `/blog/${post.slug}`,
    summary: post.summary ?? "", tags: post.tags ?? [], text: strip(post.content) });
}
// key static pages
for (const pg of [
  { title: "About", url: "/about", summary: "Background, experience, education, and technical skills." },
  { title: "Consulting", url: "/consulting", summary: "Reliability, cloud security, and infrastructure consulting for teams." },
  { title: "Resume", url: "/resume", summary: "Download a resume tuned to the role — reliability, cloud, HPC, compilers, software, or sales." },
  { title: "Contact", url: "/contact", summary: "Get in touch." },
]) {
  entries.push({ type: "page", ...pg, tags: [], text: "" });
}

fs.mkdirSync(path.join(ROOT, "public"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "public", "search-index.json"), JSON.stringify({ entries }));
console.log(`[search] indexed ${entries.length} items`);
