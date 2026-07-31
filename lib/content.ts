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
  // repo-derived (auto-discovery)
  url?: string;
  language?: string | null;
  stars?: number;
  openIssues?: number;
  active?: boolean;
  hasDocs?: boolean;
  hasBlog?: boolean;
  hasResumeYml?: boolean;
  related?: string[];
  external?: boolean;
  pushedAt?: string;
  docsReadme?: string | null;
  docsUrl?: string | null;
  posts?: RepoBlogPost[];
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

export interface RepoBlogPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  content: string;
}

export interface GeneratedProject {
  slug: string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  openIssues: number;
  topics: string[];
  pushedAt: string;
  active: boolean;
  defaultBranch: string;
  hasDocs: boolean;
  docsReadme: string | null;
  docsUrl: string | null;
  hasBlog: boolean;
  posts: RepoBlogPost[];
  hasResumeYml: boolean;
  resumeYml: string | null;
  related: string[];
  readme: string | null;
  external: boolean;
}

export function getGeneratedProjects(): GeneratedProject[] {
  const file = path.join(CONTENT_DIR, "projects", "_generated.json");
  if (!fs.existsSync(file)) return [];
  try {
    return (JSON.parse(fs.readFileSync(file, "utf8")).projects ?? []) as GeneratedProject[];
  } catch {
    return [];
  }
}

// Projects are auto-discovered from repos (opt-out). A curated
// content/projects/{slug}.md, if present, overrides frontmatter fields and
// supplies narration; otherwise the README is the project's main content.
function mergeProject(g: GeneratedProject): Project {
  let fm: Partial<ProjectFrontmatter> = {};
  let narration = "";
  try {
    if (
      fs.existsSync(path.join(PROJECTS_DIR, `${g.slug}.md`)) ||
      fs.existsSync(path.join(PROJECTS_DIR, `${g.slug}.mdx`))
    ) {
      const { data, content } = readOne<ProjectFrontmatter>(PROJECTS_DIR, g.slug);
      fm = data;
      narration = content;
    }
  } catch {
    /* no curated file */
  }
  return {
    slug: g.slug,
    title: fm.title ?? g.name,
    summary: fm.summary ?? g.description ?? "",
    tags: fm.tags ?? g.topics ?? [],
    status: fm.status ?? (g.active ? "active" : "archived"),
    date: g.pushedAt,
    repo: g.fullName,
    externalUrl: fm.externalUrl ?? g.homepage ?? undefined,
    featured: fm.featured,
    draft: fm.draft,
    content: narration || g.readme || "",
    url: g.url,
    language: g.language,
    stars: g.stars,
    openIssues: g.openIssues,
    active: g.active,
    hasDocs: g.hasDocs,
    hasBlog: g.hasBlog,
    hasResumeYml: g.hasResumeYml,
    related: g.related,
    external: g.external,
    pushedAt: g.pushedAt,
    docsReadme: g.docsReadme,
    docsUrl: g.docsUrl,
    posts: g.posts ?? [],
  };
}

// Repo blog posts flattened across all projects, routed at
// /blog/{projectSlug}/content/{slug}. Distinct from site posts (/blog/{slug}).
export interface RepoPost extends RepoBlogPost {
  projectSlug: string;
  projectTitle: string;
  readingMinutes: number;
}

export function getGeneratedPosts(): RepoPost[] {
  const out: RepoPost[] = [];
  for (const g of getGeneratedProjects()) {
    for (const p of g.posts ?? []) {
      out.push({
        ...p,
        projectSlug: g.slug,
        projectTitle: g.name,
        readingMinutes: Math.max(1, Math.round(readingTime(p.content).minutes)),
      });
    }
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getRepoPost(projectSlug: string, slug: string): RepoPost | null {
  return getGeneratedPosts().find((p) => p.projectSlug === projectSlug && p.slug === slug) ?? null;
}

// "In the pipeline": the latest article from each project that has one, newest
// first. Status-agnostic — every project with writing is represented once.
export function getPipelineArticles(): RepoPost[] {
  const latestByProject = new Map<string, RepoPost>();
  for (const p of getGeneratedPosts()) {
    if (!latestByProject.has(p.projectSlug)) latestByProject.set(p.projectSlug, p);
  }
  return Array.from(latestByProject.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllProjects(): Project[] {
  return getGeneratedProjects()
    .map(mergeProject)
    .filter((p) => includeDrafts || !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getProjectBySlug(slug: string): Project | null {
  const g = getGeneratedProjects().find((p) => p.slug === slug);
  return g ? mergeProject(g) : null;
}

export function getAllProjectTags(projects: Project[]): string[] {
  const tags = new Set<string>();
  projects.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}
