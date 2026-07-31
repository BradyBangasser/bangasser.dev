"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Entry = { type: string; title: string; url: string; summary: string; tags: string[]; text: string };

const TYPE_LABEL: Record<string, string> = {
  project: "project", article: "article", post: "post", page: "page",
};

function scoreEntry(e: Entry, tokens: string[]): number {
  const title = e.title.toLowerCase();
  const tags = (e.tags ?? []).join(" ").toLowerCase();
  const summary = (e.summary ?? "").toLowerCase();
  const text = (e.text ?? "").toLowerCase();
  let score = 0;
  for (const t of tokens) {
    let hit = 0;
    if (title.includes(t)) hit += title.startsWith(t) ? 7 : 5;
    if (tags.includes(t)) hit += 3;
    if (summary.includes(t)) hit += 2;
    if (text.includes(t)) hit += 1;
    if (hit === 0) return 0; // every token must match somewhere (AND)
    score += hit;
  }
  return score;
}

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const load = useCallback(() => {
    if (index) return;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((d) => setIndex(d.entries ?? []))
      .catch(() => setIndex([]));
  }, [index]);

  const openDialog = useCallback(() => { setOpen(true); load(); }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        load();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => openDialog();
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, [load, openDialog]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const results = useMemo(() => {
    if (!index) return [];
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    return index
      .map((e) => ({ e, s: scoreEntry(e, tokens) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 20)
      .map((x) => x.e);
  }, [index, query]);

  useEffect(() => { setActive(0); }, [query]);

  const go = useCallback((url: string) => {
    setOpen(false);
    router.push(url);
  }, [router]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active].url); }
  };

  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg/70 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border-subtle px-4">
          <span className="font-mono text-sm text-ink-faint">/</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search projects, articles, pages…"
            className="w-full bg-transparent py-4 text-sm text-ink outline-none placeholder:text-ink-faint"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-ink-faint sm:block">esc</kbd>
        </div>

        {query && (
          <ul ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
            {results.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-ink-faint">No results for “{query}”.</li>
            ) : (
              results.map((r, i) => (
                <li key={r.url} data-i={i}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.url)}
                    className={`flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors ${
                      i === active ? "bg-accent/10" : "hover:bg-bg"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-cyan">{TYPE_LABEL[r.type] ?? r.type}</span>
                      <span className={`text-sm ${i === active ? "text-accent" : "text-ink"}`}>{r.title}</span>
                    </span>
                    {r.summary && <span className="line-clamp-1 text-xs text-ink-muted">{r.summary}</span>}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
