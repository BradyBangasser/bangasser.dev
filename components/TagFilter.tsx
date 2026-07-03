"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TagFilter({
  tags,
  activeTag,
  basePath,
}: {
  tags: string[];
  activeTag: string | null;
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setTag(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by tag"
    >
      <button
        type="button"
        onClick={() => setTag(null)}
        className="tag-pill"
        data-active={activeTag === null}
      >
        all
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => setTag(tag)}
          className="tag-pill"
          data-active={activeTag === tag}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
