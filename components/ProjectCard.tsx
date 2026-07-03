import Link from "next/link";
import type { Project } from "@/lib/content";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="card group block px-5 py-4 no-underline sm:px-6 sm:py-5"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
        <span
          className={
            project.status === "active"
              ? "text-cyan"
              : project.status === "concept"
                ? "text-signal"
                : "text-ink-faint"
          }
        >
          {project.status}
        </span>
      </div>
      <h3 className="text-lg font-medium text-ink group-hover:text-accent sm:text-xl">
        {project.title}
      </h3>
      <p className="mt-1.5 text-sm text-ink-muted">{project.summary}</p>
      {project.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
