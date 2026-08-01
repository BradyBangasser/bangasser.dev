# Editing this site

Content comes from three places: **your GitHub repos** (auto-discovered at build
time), **local content files** in this repo, and **`lib/site-config.ts`** for
site-wide copy and settings. Nothing generated is committed.

## How a build works

`npm run build` / `npm run dev` first runs `prebuild`, in order:

1. `python3 scripts/fetch_github.py` scans your account and writes
   `content/projects/_generated.json`.
2. `npm run build-resumes` compiles every resume variant to PDF.
3. `npm run build-search` writes the search index.

All outputs are gitignored. The build host needs `node` and `python3` (stdlib
only). Set `GITHUB_TOKEN` to avoid API rate limits.

## Projects (from your repos)

Every non-fork, non-archived repo with a `README.md` becomes a project.

- **Hide a repo:** add an empty `.nosite` file to it.
- **Include a repo you do not own:** add `owner/name` to `.include_repo.txt` in
  the `bangasser.dev` repo (one per line).
- **Slug** comes from the repo name; on a collision the newer push wins (warned).
- **Active** = pushed within `ACTIVE_DAYS` (60) in `scripts/fetch_github.py`;
  only frames what is newest, never hides.

Per-repo files (read over raw.githubusercontent.com, no API cost):

| File | Effect |
| --- | --- |
| `README.md` | Project overview; relative links rewritten to absolute. Required. |
| `docs/README.md` or `docs/index.md` | Documentation section + link to the docs folder. |
| `blog/index.txt` + `blog/*.md` | Repo articles (see Writing). |
| `.resume.yml` | Resume project entry (see Resume). |
| `.related.txt` | Related repo slugs, one per line. |

Optional narration: `content/projects/<slug>.mdx` with frontmatter
(`title`, `summary`, `tags`, `featured`) overrides fields and adds prose.

## Writing

- **Site posts:** `content/blog/<slug>.mdx` at `/blog/<slug>`.
- **Repo articles:** files listed in a repo `blog/index.txt`, served at
  `/blog/<project-slug>/content/<slug>`.

Both appear in the unified `/blog` feed; the latest per project appears in the
home-page "In the pipeline" carousel.

Repo article files use frontmatter (`title`, `date`, `summary`, `tags`) then a
Markdown body. Without `blog/index.txt` the folder is not scanned.

## Resume

Master is `resume/resume.yml`. A repo may add a `.resume.yml` that is indexed as
the ultimate truth for that project (replaces a same-id hand-authored entry):

```yaml
# .resume.yml  - omit or set `resume: false` to opt out
name: "Erid: Cloud Images"
period: "2026"
tags: [cloud, sre]        # defaults to [software]
tech: [Packer, Terraform]
bullets:
  - text: "Reproducible golden images across five clouds."
    tags: [cloud, sre]
    priority: 1
```

Bad YAML or no bullets is skipped with a warning, never failing the build.

## Site-wide settings - `lib/site-config.ts`

Drives name, role, tagline, bio, focus areas, education, social links,
consulting content, SEO, and photos.

- **`features.consulting`** - `false` removes the consulting page, nav link, and
  home mention.
- **`photo.hero` / `photo.about`** - hero portrait and about photo.
- **`photo.gallery`** - `{ src, alt }[]` for the About gallery; missing files are
  skipped, so nothing renders broken.

## Photos

Drop files in `public/photos/` and reference them by `/photos/name.jpg` in
`lib/site-config.ts`. Missing files fall back to a monogram or are skipped.

## Metrics (Prometheus)

`GET /metrics` returns Prometheus exposition format:

- default Node.js process metrics (cpu, memory, event loop, gc),
- `bangasser_dev_build_info` (version/commit/node labels),
- `bangasser_dev_http_requests_total{method,route}` - requests by route,
- `bangasser_dev_http_request_errors_total{route,status}` - 5xx errors.

The 500 error rate is a PromQL query over the two counters:

```
rate(bangasser_dev_http_request_errors_total[5m])
  / rate(bangasser_dev_http_requests_total[5m])
```

Request counting uses a Node-runtime `middleware.ts`; error counting uses
`instrumentation.ts` (onRequestError). Point a scrape at `https://<host>/metrics`
(most useful on the long-running Docker deployment).

## Deploying (Docker + GitHub Actions)

Pushing to `main` builds a standalone image and pushes to GHCR via
`.github/workflows/docker-build.yml`. The builder installs `python3` so the repo
scan runs; uncomment the SSH step to auto-deploy.
