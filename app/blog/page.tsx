import { Suspense } from "react";
import type { Metadata } from "next";
import { TagFilter } from "@/components/TagFilter";
import { PostCard } from "@/components/PostCard";
import { getAllPosts, getAllTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes and deep dives on HPC, cryptography, compilers, and cloud security.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const activeTag = tag ?? null;

  const allPosts = getAllPosts();
  const tags = getAllTags(allPosts);
  const posts = activeTag
    ? allPosts.filter((p) => p.tags?.includes(activeTag))
    : allPosts;

  return (
    <div className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <p className="eyebrow mb-4">// blog</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Blog</h1>
      <p className="mt-3 max-w-prose text-ink-muted">
        Short notes and longer deep dives. Add a post by dropping an .mdx file
        into <code className="font-mono text-accent-soft">/content/blog</code>{" "}
        with <code className="font-mono text-accent-soft">type: &quot;short&quot;</code> or{" "}
        <code className="font-mono text-accent-soft">&quot;long&quot;</code>.
      </p>

      {tags.length > 0 && (
        <div className="mt-8">
          <Suspense fallback={null}>
            <TagFilter tags={tags} activeTag={activeTag} basePath="/blog" />
          </Suspense>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-ink-faint">
          No posts yet{activeTag ? ` tagged "${activeTag}"` : ""}.
        </p>
      )}
    </div>
  );
}
