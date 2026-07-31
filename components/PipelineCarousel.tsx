"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { RepoPost } from "@/lib/content";

export function PipelineCarousel({ articles }: { articles: RepoPost[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="eyebrow">// in the pipeline</p>
          <p className="mt-1 text-sm text-ink-muted">Latest writing across projects.</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scrollBy(-1)}
            disabled={atStart}
            aria-label="Previous"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-30 disabled:hover:border-border disabled:hover:text-ink-muted"
          >
            ←
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={atEnd}
            aria-label="Next"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-30 disabled:hover:border-border disabled:hover:text-ink-muted"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {articles.map((a) => (
          <Link
            key={`${a.projectSlug}/${a.slug}`}
            href={`/blog/${a.projectSlug}/content/${a.slug}`}
            data-card
            className="group flex w-[290px] shrink-0 snap-start flex-col rounded-xl border border-border bg-bg-elevated p-5 no-underline transition-colors hover:border-accent/40 sm:w-[320px]"
          >
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              <span className="text-cyan">{a.projectTitle}</span>
              <time dateTime={a.date}>
                {new Date(a.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
              </time>
            </div>
            <h3 className="mt-3 text-base font-medium text-ink group-hover:text-accent">{a.title}</h3>
            {a.summary && <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{a.summary}</p>}
            <span className="mt-4 font-mono text-xs text-ink-faint group-hover:text-accent">read →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
