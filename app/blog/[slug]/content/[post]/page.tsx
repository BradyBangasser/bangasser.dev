import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGeneratedPosts, getRepoPost } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { siteConfig } from "@/lib/site-config";

export async function generateStaticParams() {
  return getGeneratedPosts().map((p) => ({ slug: p.projectSlug, post: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; post: string }>;
}): Promise<Metadata> {
  const { slug, post } = await params;
  const p = getRepoPost(slug, post);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    openGraph: {
      title: p.title,
      description: p.summary,
      type: "article",
      publishedTime: p.date,
      url: `${siteConfig.url}/blog/${slug}/content/${post}`,
    },
  };
}

export default async function RepoPostPage({
  params,
}: {
  params: Promise<{ slug: string; post: string }>;
}) {
  const { slug, post } = await params;
  const p = getRepoPost(slug, post);
  if (!p) notFound();

  const html = await renderMarkdown(p.content);

  return (
    <article className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <Link
        href={`/projects/${p.projectSlug}`}
        className="font-mono text-xs text-ink-muted no-underline hover:text-accent"
      >
        ← {p.projectTitle}
      </Link>

      <header className="mt-6 max-w-prose">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          <span className="text-cyan">from {p.projectTitle}</span>
          <time dateTime={p.date}>
            {new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </time>
          <span>{p.readingMinutes} min</span>
        </div>
        <h1 className="text-3xl font-semibold sm:text-4xl">{p.title}</h1>
        {p.summary && <p className="mt-3 text-ink-muted">{p.summary}</p>}
        {p.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.tags.map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-invert mt-10 max-w-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
