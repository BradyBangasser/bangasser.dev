import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
import { siteConfig } from "@/lib/site-config";
import { publicFileExists } from "@/lib/photo";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      url: `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const content = await renderMDX(post.content);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    url: `${siteConfig.url}/blog/${post.slug}`,
  };

  return (
    <article className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Link href="/blog" className="font-mono text-xs text-ink-muted no-underline hover:text-accent">
        ← blog
      </Link>

      <header className="mt-6 max-w-prose">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <span aria-hidden="true">·</span>
          <span className={post.type === "long" ? "text-accent-soft" : "text-cyan"}>
            {post.type === "long" ? "deep dive" : "note"}
          </span>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
        <h1 className="text-3xl font-semibold sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-ink-muted">{post.summary}</p>
        {post.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.coverImage && publicFileExists(post.coverImage) && (
        <figure className="relative mt-8 aspect-[16/9] max-w-prose overflow-hidden rounded-xl border border-border bg-bg-elevated">
          <Image
            src={post.coverImage}
            alt={post.coverAlt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
            priority
          />
        </figure>
      )}

      <div className="prose prose-invert mt-10 max-w-prose">{content}</div>
    </article>
  );
}
