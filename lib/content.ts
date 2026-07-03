import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "content");
const BLOG_DIR = path.join(CONTENT_DIR, "blog");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");

export type PostType = "short" | "long";

export interface PostFrontmatter {
  title: string;
  date: string; // ISO date string, e.g. "2026-06-01"
  summary: string;
  tags: string[];
  type: PostType;
  draft?: boolean;
  coverImage?: string;
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string; // raw MDX body
  readingMinutes: number;
}

export type ProjectStatus = "active" | "archived" | "concept";

export interface ProjectFrontmatter {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  status: ProjectStatus;
  repo?: string; // e.g. "BradyBangasser/some-repo" — links a curated write-up to a GitHub repo
  externalUrl?: string;
  draft?: boolean;
  coverImage?: string;
  featured?: boolean;
}

export interface Project extends ProjectFrontmatter {
  slug: string;
  content: string;
}

function readAllSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

function readOne<T>(dir: string, slug: string): { data: T; content: string } {
  const fullPath = fs.existsSync(path.join(dir, `${slug}.mdx`))
    ? path.join(dir, `${slug}.mdx`)
    : path.join(dir, `${slug}.md`);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  return { data: data as T, content };
}

const includeDrafts = process.env.NODE_ENV !== "production";

export function getAllPosts(): Post[] {
  const slugs = readAllSlugs(BLOG_DIR);
  const posts = slugs.map((slug) => {
    const { data, content } = readOne<PostFrontmatter>(BLOG_DIR, slug);
    return {
      slug,
      ...data,
      content,
      readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    };
  });
  return posts
    .filter((p) => includeDrafts || !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const { data, content } = readOne<PostFrontmatter>(BLOG_DIR, slug);
    return {
      slug,
      ...data,
      content,
      readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    };
  } catch {
    return null;
  }
}

export function getAllTags(posts: Post[]): string[] {
  const tags = new Set<string>();
  posts.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function getAllProjects(): Project[] {
  const slugs = readAllSlugs(PROJECTS_DIR);
  const projects = slugs.map((slug) => {
    const { data, content } = readOne<ProjectFrontmatter>(PROJECTS_DIR, slug);
    return { slug, ...data, content };
  });
  return projects
    .filter((p) => includeDrafts || !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getProjectBySlug(slug: string): Project | null {
  try {
    const { data, content } = readOne<ProjectFrontmatter>(PROJECTS_DIR, slug);
    return { slug, ...data, content };
  } catch {
    return null;
  }
}

export function getAllProjectTags(projects: Project[]): string[] {
  const tags = new Set<string>();
  projects.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

// ---------------------------------------------------------------------------
// GitHub-scanned repos (generated at build time — see scripts/fetch-github.ts)
// These are separate from curated /content/projects write-ups. A curated
// project can reference a repo via `repo: "owner/name"` to pull in live
// stars/language/description; repos with no curated write-up still show up
// as lightweight auto-generated cards.
// ---------------------------------------------------------------------------

export interface GeneratedRepo {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  topics: string[];
  updatedAt: string;
  archived: boolean;
  fork: boolean;
}

export function getGeneratedRepos(): GeneratedRepo[] {
  const file = path.join(CONTENT_DIR, "projects", "_generated.json");
  if (!fs.existsSync(file)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return raw.repos ?? [];
  } catch {
    return [];
  }
}
