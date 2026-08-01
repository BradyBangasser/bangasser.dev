import Link from "next/link";
import type { WritingItem } from "@/lib/content";

export function WritingCard({ item }: { item: WritingItem }) {
  return (
    <Link href={item.href} className="card group flex flex-col px-5 py-5 no-underline sm:px-6">
      <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
        <time dateTime={item.date}>
          {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </time>
        <span aria-hidden="true">·</span>
        {item.kind === "article" ? (
          <Link
            href={`/projects/${item.projectSlug}`}
            className="text-cyan no-underline hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            from {item.projectTitle}
          </Link>
        ) : (
          <span className={item.postType === "long" ? "text-accent-soft" : "text-cyan"}>
            {item.postType === "long" ? "deep dive" : "note"}
          </span>
        )}
        <span aria-hidden="true">·</span>
        <span>{item.readingMinutes} min read</span>
      </div>
      <h3 className="text-lg font-medium text-ink group-hover:text-accent sm:text-xl">{item.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{item.summary}</p>
      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((t) => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
