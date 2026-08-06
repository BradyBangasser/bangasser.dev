# Files a repo can add

Any repo you own controls how it appears on the site through its own files.
Only a `README.md` is required. Everything is read at build time over
`raw.githubusercontent.com` (one git-trees call per repo powers the docs site
and the blog autoscan), so there is no webhook or registration: add a file,
push, and the next deploy picks it up. There are no per-project files in the
website repo anymore; it all lives in the repo.

## README.md

**Required to appear.** The root `README.md` is the project overview at
`/projects/<slug>`. Relative links and images are rewritten to absolute GitHub
URLs so they resolve off-site.

The README may carry optional YAML **frontmatter** to set metadata. The body
below the frontmatter is the overview.

```md
---
title: "zkRP: Encrypted P2P with Zero-Knowledge Range Proofs"
summary: "An encrypted peer-to-peer network built on zero-knowledge range proofs."
tags: [cryptography, p2p, reliability]
featured: true
slo: "99.9%"
sla: "99%"
---

# zkRP

The overview body starts here.
```

| Frontmatter field | Effect | Falls back to |
| --- | --- | --- |
| `title` | Project title | repo name |
| `summary` | One-line summary | repo description |
| `tags` | Tag pills | repo topics |
| `featured` | Featured on the home page | false |
| `slo` | Shows an SLO badge on the project page | none |
| `sla` | Shows an SLA badge on the project page | none |

## .nosite

**Hides the repo.** An empty file named `.nosite` at the root removes it from
the site.

## docs/

**A documentation site.** If the repo has `docs/README.md` (or
`docs/index.md`), the whole `docs/` tree is published at `/projects/<slug>/docs`
with a searchable, nested sidebar. A folder becomes a nav section; its
`README.md`/`index.md` is that section's page; each page's title is its first
`# H1`.

```
docs/
  README.md
  guides/
    README.md
    setup.md
```

## blog/

**Articles that belong to the project.** Drop Markdown files in `blog/` and they
are autoscanned, newest first. **No `blog/index.txt` is needed.** Each post uses
frontmatter and appears in the site `/blog` feed and the home "In the pipeline"
carousel.

```md
---
title: "Building reproducible golden images"
date: 2026-07-18
summary: "One Packer pipeline, identical images across five clouds."
tags: [cloud]
---

Body.
```

Top-level `blog/*.md` are posts; `blog/README.md` and `blog/index.md` are
ignored.

## .resume.yml

**A resume entry for the project.** Indexed as the ultimate truth for that
project and competes in the resume builder by score (give it a `weight`).

```yaml
# .resume.yml  - omit or set `resume: false` to opt out
name: "Erid: Cloud Images"
period: "2026"
weight: 7            # base weight (1-10); competes by weight x recency
start: "2026-01"     # optional; drives the recency multiplier
tags: [cloud, sre]   # which resume presets this project appears on
strict: true         # optional; pin to ONLY the tagged presets (no borrowing)
tech: [Packer, Terraform]
bullets:
  - text: "Reproducible golden images across five clouds."
    tags: [cloud, sre]
    priority: 1
```

By default a project can be borrowed onto a roomier resume it is not tagged for,
to help fill the page. Set `strict: true` to pin it to only its tagged presets,
for example a project you want on the sales resume and nowhere else.

## .related.txt

**Links to related projects.** One repo slug per line.

```
zkrp
erid
```

## The one control in the site repo

**`.include_repo.txt`** (in the `bangasser.dev` repo) adds repos you do not own:
put `owner/name` on its own line and that repo is fetched and shown like your
own. This is the only project control that does not live in the project repo.
