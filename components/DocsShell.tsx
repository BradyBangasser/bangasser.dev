"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DocNavNode } from "@/lib/content";

function filterNav(nodes: DocNavNode[], q: string): DocNavNode[] {
  if (!q) return nodes;
  const out: DocNavNode[] = [];
  for (const n of nodes) {
    const kids = filterNav(n.children, q);
    if (n.title.toLowerCase().includes(q) || kids.length) out.push({ ...n, children: kids });
  }
  return out;
}

function NavTree({ nodes, slug, active, depth = 0 }: { nodes: DocNavNode[]; slug: string; active: string; depth?: number }) {
  return (
    <ul className={depth === 0 ? "space-y-0.5" : "mt-0.5 space-y-0.5 border-l border-border-subtle pl-3"}>
      {nodes.map((n) => {
        const href = n.urlPath !== undefined ? `/projects/${slug}/docs${n.urlPath ? "/" + n.urlPath : ""}` : null;
        const isActive = n.urlPath !== undefined && n.urlPath === active;
        return (
          <li key={n.title + (n.urlPath ?? "")}>
            {href ? (
              <Link
                href={href}
                className={`block rounded px-2 py-1 text-sm no-underline transition-colors ${
                  isActive ? "bg-accent/10 font-medium text-accent" : "text-ink-muted hover:text-ink"
                }`}
              >
                {n.title}
              </Link>
            ) : (
              <span className="block px-2 pt-3 pb-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                {n.title}
              </span>
            )}
            {n.children.length > 0 && <NavTree nodes={n.children} slug={slug} active={active} depth={depth + 1} />}
          </li>
        );
      })}
    </ul>
  );
}

export function DocsShell({
  slug, projectTitle, nav, activePath, contentHtml, docsUrl,
}: {
  slug: string; projectTitle: string; nav: DocNavNode[]; activePath: string;
  contentHtml: string; docsUrl?: string | null;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => filterNav(nav, q.trim().toLowerCase()), [nav, q]);

  return (
    <div className="mx-auto max-w-page px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Link
            href={`/projects/${slug}`}
            className="mb-4 block font-mono text-xs text-ink-faint no-underline hover:text-accent"
          >
            ← {projectTitle}
          </Link>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search docs"
            className="mb-3 w-full rounded-md border border-border bg-bg-elevated px-2.5 py-1.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent/50"
            aria-label="Search docs"
          />
          <nav>
            {filtered.length ? (
              <NavTree nodes={filtered} slug={slug} active={activePath} />
            ) : (
              <p className="px-2 text-sm text-ink-faint">No matches.</p>
            )}
          </nav>
        </aside>

        <article className="min-w-0">
          <div className="mb-6 flex items-center justify-between border-b border-border-subtle pb-3">
            <p className="eyebrow">// docs</p>
            {docsUrl && (
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-ink-faint no-underline hover:text-accent"
              >
                edit on GitHub ↗
              </a>
            )}
          </div>
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>
      </div>
    </div>
  );
}
