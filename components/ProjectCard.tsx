import Link from "next/link";
import type { Project } from "@/lib/content";
import { relativeTime, languageColor } from "@/lib/repo-meta";

export function ProjectCard({ project }: { project: Project }) {
  const active = project.active ?? project.status === "active";
  const features = [
    project.hasDocs && "docs",
    project.hasBlog && "writing",
    project.hasResumeYml && "résumé",
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="card group flex flex-col px-5 py-5 no-underline sm:px-6"
    >
      {/* live status line — the real repo state, pulled from GitHub */}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span className={`status-dot ${active ? "status-dot--active" : "status-dot--idle"}`} aria-hidden="true" />
          <span className={active ? "text-cyan" : ""}>
            {active ? "active" : project.pushedAt ? `updated ${relativeTime(project.pushedAt)}` : "archived"}
          </span>
        </span>
        {project.language && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: languageColor(project.language) }} aria-hidden="true" />
            {project.language}
          </span>
        )}
        {typeof project.stars === "number" && project.stars > 0 && <span>★ {project.stars}</span>}
        {project.external && <span className="text-signal">↗ external</span>}
      </div>

      <h3 className="text-lg font-medium text-ink group-hover:text-accent sm:text-xl">
        {project.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{project.summary}</p>

      {features.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
          {features.map((f) => (
            <span key={f} className="rounded border border-border-subtle px-1.5 py-0.5">{f}</span>
          ))}
        </div>
      )}

      {project.tags && project.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
