# Projects

Every non-fork, non-archived repo with a `README.md` becomes a project.

- **Hide a repo:** add an empty `.nosite` file to it.
- **Include a repo you do not own:** add `owner/name` to `.include_repo.txt` in
  the `bangasser.dev` repo, one per line.
- **Active** means pushed within `ACTIVE_DAYS` (60) in `scripts/fetch_github.py`.

Optional narration: `content/projects/<slug>.mdx` with frontmatter (`title`,
`summary`, `tags`, `featured`) overrides fields and adds prose beside the README.

Per-repo files that are read (over raw, no API cost): `README.md` (overview),
`docs/` (a docs site, see Operations), `blog/index.txt` + `blog/*.md` (articles),
`.resume.yml` (a resume entry), `.related.txt` (related slugs).
