import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { relativeTime, languageColor } from "@/lib/repo-meta";
import { siteConfig } from "@/lib/site-config";

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
      publishedTime: project.date,
      url: `${siteConfig.url}/projects/${project.slug}`,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const content = await renderMarkdown(project.content);
  const hasDocs = (project.docs?.length ?? 0) > 0;

  return (
    <article className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <Link href="/projects" className="font-mono text-xs text-ink-muted no-underline hover:text-accent">
        ← projects
      </Link>

      <header className="mt-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-prose">
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-ink-faint">
              <span className="inline-flex items-center gap-1.5">
                <span className={`status-dot ${project.active ? "status-dot--active" : "status-dot--idle"}`} aria-hidden="true" />
                <span className={project.active ? "text-cyan" : ""}>
                  {project.active ? "active" : `updated ${relativeTime(project.pushedAt ?? project.date)}`}
                </span>
              </span>
              {project.language && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: languageColor(project.language) }} aria-hidden="true" />
                  {project.language}
                </span>
              )}
              {typeof project.stars === "number" && project.stars > 0 && <span>★ {project.stars}</span>}
              {typeof project.openIssues === "number" && project.openIssues > 0 && <span>{project.openIssues} open</span>}
            </div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{project.title}</h1>
            <p className="mt-3 text-ink-muted">{project.summary}</p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {project.repo && (
                <a
                  href={`https://github.com/${project.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3.5 py-2 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  View source
                </a>
              )}
              {project.externalUrl && (
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3.5 py-2 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                  Live site
                </a>
              )}
            </div>

            {project.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {hasDocs && (
            <Link
              href={`/projects/${project.slug}/docs`}
              className="group flex shrink-0 flex-col gap-3 rounded-xl border border-accent/30 bg-accent/5 p-5 no-underline transition-colors hover:border-accent/60 hover:bg-accent/10 lg:w-60"
            >
              <span className="flex items-center gap-2 text-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span className="text-lg font-semibold">Documentation</span>
              </span>
              <span className="text-sm text-ink-muted">
                {project.docs!.length} page{project.docs!.length === 1 ? "" : "s"}, browsable with search.
              </span>
              <span className="mt-1 font-mono text-xs text-accent group-hover:underline">open docs →</span>
            </Link>
          )}
        </div>
      </header>

      <div
        className="prose prose-invert mt-10 max-w-prose"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {project.posts && project.posts.length > 0 && (
        <section className="mt-16 max-w-prose">
          <h2 className="mb-4 text-xl font-semibold">Writing from this project</h2>
          <ul className="space-y-3">
            {project.posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${project.slug}/content/${post.slug}`}
                  className="group flex items-baseline justify-between gap-4 no-underline"
                >
                  <span className="text-ink group-hover:text-accent">{post.title}</span>
                  <time className="shrink-0 font-mono text-xs text-ink-faint" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
