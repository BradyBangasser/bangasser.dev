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

      <header className="mt-6 max-w-prose">
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
        <div className="mt-4 flex flex-wrap gap-3">
          {project.repo && (
            <a
              href={`https://github.com/${project.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-accent no-underline hover:underline"
            >
              github.com/{project.repo} ↗
            </a>
          )}
          {project.externalUrl && (
            <a
              href={project.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-accent no-underline hover:underline"
            >
              live link ↗
            </a>
          )}
        </div>
        {project.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        className="prose prose-invert mt-10 max-w-prose"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {hasDocs && (
        <section className="mt-12 max-w-prose">
          <Link
            href={`/projects/${project.slug}/docs`}
            className="group flex items-center justify-between rounded-xl border border-border bg-bg-elevated px-5 py-4 no-underline transition-colors hover:border-accent/40"
          >
            <span>
              <span className="block font-medium text-ink group-hover:text-accent">Documentation</span>
              <span className="block text-sm text-ink-muted">
                {project.docs!.length} page{project.docs!.length === 1 ? "" : "s"}, browsable with search
              </span>
            </span>
            <span className="font-mono text-sm text-ink-faint group-hover:text-accent">open docs →</span>
          </Link>
        </section>
      )}

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
