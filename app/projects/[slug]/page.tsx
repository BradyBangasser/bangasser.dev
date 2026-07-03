import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
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

  const content = await renderMDX(project.content);

  return (
    <article className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <Link href="/projects" className="font-mono text-xs text-ink-muted no-underline hover:text-accent">
        ← projects
      </Link>

      <header className="mt-6 max-w-prose">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          <span className="text-cyan">{project.status}</span>
          <time dateTime={project.date}>
            {new Date(project.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
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

      <div className="prose prose-invert mt-10 max-w-prose">{content}</div>
    </article>
  );
}
