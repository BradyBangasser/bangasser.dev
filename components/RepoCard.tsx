import type { GeneratedRepo } from "@/lib/content";

export function RepoCard({ repo }: { repo: GeneratedRepo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card group block px-5 py-4 no-underline sm:px-6 sm:py-5"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
        <span>from github</span>
        {repo.language && (
          <>
            <span aria-hidden="true">·</span>
            <span>{repo.language}</span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>★ {repo.stars}</span>
      </div>
      <h3 className="text-lg font-medium text-ink group-hover:text-accent sm:text-xl">
        {repo.name}
      </h3>
      {repo.description && (
        <p className="mt-1.5 text-sm text-ink-muted">{repo.description}</p>
      )}
    </a>
  );
}
