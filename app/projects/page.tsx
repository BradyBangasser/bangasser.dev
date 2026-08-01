import { Suspense } from "react";
import type { Metadata } from "next";
import { TagFilter } from "@/components/TagFilter";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllProjects, getAllProjectTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "HPC, cloud infrastructure, cryptography, and compiler projects, pulled live from GitHub.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const activeTag = tag ?? null;

  const allProjects = getAllProjects();
  const tags = getAllProjectTags(allProjects);
  const projects = activeTag
    ? allProjects.filter((p) => p.tags?.includes(activeTag))
    : allProjects;

  const activeCount = allProjects.filter((p) => p.active).length;

  return (
    <div className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <p className="eyebrow mb-4">// projects</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Projects</h1>
      <p className="mt-3 max-w-prose text-ink-muted">
        Every repo, pulled live from GitHub at build time
        {activeCount > 0 ? ` - ${activeCount} active right now` : ""}. A README is
        the project&apos;s overview; a curated write-up, when present, adds narration.
      </p>

      {tags.length > 0 && (
        <div className="mt-8">
          <Suspense fallback={null}>
            <TagFilter tags={tags} activeTag={activeTag} basePath="/projects" />
          </Suspense>
        </div>
      )}

      {projects.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-ink-faint">
          No projects found{activeTag ? ` tagged "${activeTag}"` : ""}.
        </p>
      )}
    </div>
  );
}
