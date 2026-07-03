import { Suspense } from "react";
import type { Metadata } from "next";
import { TagFilter } from "@/components/TagFilter";
import { ProjectCard } from "@/components/ProjectCard";
import { RepoCard } from "@/components/RepoCard";
import { getAllProjects, getAllProjectTags, getGeneratedRepos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "HPC, cloud infrastructure, cryptography, and compiler projects.",
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

  const curatedRepoNames = new Set(
    allProjects.map((p) => p.repo).filter(Boolean) as string[]
  );
  const repos = getGeneratedRepos().filter(
    (r) => !curatedRepoNames.has(r.fullName)
  );

  return (
    <div className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <p className="eyebrow mb-4">// projects</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Projects</h1>
      <p className="mt-3 max-w-prose text-ink-muted">
        Write-ups on systems I&apos;ve built or broken. Add a new one by dropping
        an .mdx file into <code className="font-mono text-accent-soft">/content/projects</code>.
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
          No write-ups yet{activeTag ? ` tagged "${activeTag}"` : ""}.
        </p>
      )}

      {repos.length > 0 && (
        <div className="mt-16">
          <p className="eyebrow mb-6">// more on github</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <RepoCard key={repo.fullName} repo={repo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
