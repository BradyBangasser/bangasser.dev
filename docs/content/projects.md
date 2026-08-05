# Projects

Projects are discovered from GitHub at build time. There is no list to maintain
and nothing to register: `scripts/fetch_github.py` enumerates your account, and
every repo that qualifies becomes a project page at `/projects/<slug>`.

## What qualifies

A repo becomes a project when all of these hold:

- it is not a fork and not archived,
- it is not private (only public repos are fetched),
- it has a `README.md` (or `readme.md`) at the root.

The **slug** is the repo name lowercased. If two repos slugify to the same
value, the more recently pushed one wins and the build prints a warning.

## Controlling what appears

| You want | Do this |
| --- | --- |
| Hide a repo | Add an empty `.nosite` file to the repo root. |
| Show a repo you do not own | Add `owner/name` to `.include_repo.txt` in the `bangasser.dev` repo, one per line. |
| Rename or re-describe | Add `content/projects/<slug>.mdx` (see Overrides). |
| Mark it inactive | Nothing to do: "active" is derived from the last push date (`ACTIVE_DAYS`, default 60, in `scripts/fetch_github.py`). |

## Per-repo files that are read

All of these are fetched over `raw.githubusercontent.com`, so they cost no API
calls. Only the docs tree uses one API call, and only when `docs/` exists.

| File | Effect |
| --- | --- |
| `README.md` | The project overview. Relative links and images are rewritten to absolute GitHub URLs so they resolve off-site. Required. |
| `docs/` | A full ReadTheDocs-style docs site at `/projects/<slug>/docs`. See Operations > The docs system. |
| `blog/index.txt` + `blog/*.md` | Repo articles. See Writing. |
| `.resume.yml` | A resume entry for that project. See Resume. |
| `.related.txt` | Related repo slugs, one per line, shown as a related-projects list. |

## Overrides and narration

The README is the default content. To change the title, summary, tags, or add
prose that sits above the README, create `content/projects/<slug>.mdx`:

```mdx
---
title: "Erid: Unified Cloud Images"
summary: "One Packer pipeline, identical images across five clouds and on-prem."
tags: [cloud, sre, reliability]
featured: true
---

Narration in Markdown appears before the README on the project page.
```

Frontmatter fields are all optional; anything you omit falls back to the repo
(name, description, topics).

## The live status line

Each project card and detail header shows live repo state pulled at build: a
pulsing cyan dot when active, the primary language with its GitHub color, star
count, and open-issue count. This comes straight from the GitHub API listing, so
it is always current as of the last deploy.

## Testing

Run `python3 scripts/fetch_github.py` (needs `GITHUB_TOKEN` to avoid rate
limits) and inspect `content/projects/_generated.json`. Each project object
carries `slug`, `readme`, `docs`, `posts`, and the repo metadata. `npm run dev`
runs the fetch automatically.
