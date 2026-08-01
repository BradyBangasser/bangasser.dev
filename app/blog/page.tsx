import { Suspense } from "react";
import type { Metadata } from "next";
import { TagFilter } from "@/components/TagFilter";
import { WritingCard } from "@/components/WritingCard";
import { getAllWriting, getAllWritingTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes and deep dives on HPC, cryptography, compilers, and cloud security — plus writing from across the projects.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const activeTag = tag ?? null;

  const all = getAllWriting();
  const tags = getAllWritingTags(all);
  const items = activeTag ? all.filter((p) => p.tags?.includes(activeTag)) : all;
  const fromProjects = all.filter((i) => i.kind === "article").length;

  return (
    <div className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <p className="eyebrow mb-4">// writing</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Writing</h1>
      <p className="mt-3 max-w-prose text-ink-muted">
        Notes and deep dives{fromProjects > 0 ? ", including writing pulled straight from the projects" : ""}.
      </p>

      {tags.length > 0 && (
        <div className="mt-8">
          <Suspense fallback={null}>
            <TagFilter tags={tags} activeTag={activeTag} basePath="/blog" />
          </Suspense>
        </div>
      )}

      {items.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <WritingCard key={item.href} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-ink-faint">
          No writing yet{activeTag ? ` tagged "${activeTag}"` : ""}.
        </p>
      )}
    </div>
  );
}
