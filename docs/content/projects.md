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
| Rename or re-describe | Add YAML frontmatter to the repo `README.md` (see Metadata). |
| Mark it inactive | Nothing to do: "active" is derived from the last push date (`ACTIVE_DAYS`, default 60, in `scripts/fetch_github.py`). |

## Per-repo files that are read

All of these are fetched over `raw.githubusercontent.com`, so they cost no API
calls. Only the docs tree uses one API call, and only when `docs/` exists.

| File | Effect |
| --- | --- |
| `README.md` | The project overview. Relative links and images are rewritten to absolute GitHub URLs so they resolve off-site. Required. |
| `docs/` | A full ReadTheDocs-style docs site at `/projects/<slug>/docs`. See Operations > The docs system. |
| `blog/*.md` | Repo articles, autoscanned (no manifest). See Writing. |
| `.resume.yml` | A resume entry for that project. See Resume. |
| `.related.txt` | Related repo slugs, one per line, shown as a related-projects list. |

## Metadata via README frontmatter

The README body is the overview. To set the title, summary, tags, featured flag,
or SLO/SLA, add YAML frontmatter to the top of the README. See
**Files a repo can add** for the full field list. There are no per-project
override files in the website repo.


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
