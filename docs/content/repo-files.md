# Files a repo can add

Any repo you own can control how it appears on the site by adding a few
optional files. None are required except a `README.md`. All are read at build
time over `raw.githubusercontent.com` (only the docs tree uses one API call),
so there is no webhook or registration step: add a file, push, and the next
deploy picks it up.

## README.md

**Required to appear.** The repo's root `README.md` becomes the project
overview at `/projects/<slug>`. Relative links and images are rewritten to
absolute GitHub URLs so they resolve off-site. Nothing else is needed for a repo
to show up.

## .nosite

**Hides the repo.** An empty file named `.nosite` at the repo root removes it
from the site entirely. Use it for forks, experiments, and anything not worth
showing.

```
touch .nosite && git add .nosite && git commit -m "hide from site" && git push
```

## docs/

**A documentation site.** If the repo has `docs/README.md` (or
`docs/index.md`), the whole `docs/` tree is published at
`/projects/<slug>/docs` with a searchable, nested sidebar.

```
docs/
  README.md            # the docs landing page
  guides/
    README.md          # "Guides" section landing page
    setup.md           # /projects/<slug>/docs/guides/setup
```

- A folder becomes a nav section; its `README.md`/`index.md` is that section's page.
- Each page's title is its first `# H1`, falling back to the filename.
- `README`/`index` sorts first in a folder, then files alphabetically.

## blog/index.txt and blog/\*.md

**Articles that belong to the project.** List the post files in
`blog/index.txt` (one filename per line), then add the files. Each appears in
the site `/blog` feed and in the home "In the pipeline" carousel.

```
# blog/index.txt
golden-images.md
```

```md
---
title: "Building reproducible golden images"
date: 2026-07-18
summary: "One Packer pipeline, identical images across five clouds."
tags: [cloud]
---

Body in Markdown.
```

Without `blog/index.txt` the folder is not scanned.

## .resume.yml

**A resume entry for the project.** Indexed as the ultimate truth for that
project: it replaces any hand-authored entry with the same id in
`resume/resume.yml`, and competes in the resume builder by score like any entry
(give it a `weight`).

```yaml
# .resume.yml  - omit or set `resume: false` to opt out
name: "Erid: Cloud Images"
period: "2026"
weight: 7
tags: [cloud, sre]        # defaults to [software]
tech: [Packer, Terraform]
bullets:
  - text: "Reproducible golden images across five clouds."
    tags: [cloud, sre]
    priority: 1
```

Malformed YAML or an entry with no bullets is skipped with a warning and never
breaks the build.

## .related.txt

**Links to related projects.** One repo slug per line; the project page shows
them as a related-projects list.

```
erid
omni-http-router
```

## Files that live in the site repo, not other repos

Two controls live in the `bangasser.dev` repo itself rather than in a project
repo:

- **`.include_repo.txt`** adds repos you do not own. Put `owner/name` on its own
  line and that repo is fetched and shown like your own.
- **`content/projects/<slug>.mdx`** overrides a project's title, summary, or
  tags and adds narration above its README (see Projects).
