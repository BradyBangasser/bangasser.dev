import Link from "next/link";
import type { Post } from "@/lib/content";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card group block px-5 py-4 no-underline sm:px-6 sm:py-5"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
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
      <h3 className="text-lg font-medium text-ink group-hover:text-accent sm:text-xl">
        {post.title}
      </h3>
      <p className="mt-1.5 text-sm text-ink-muted">{post.summary}</p>
      {post.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
