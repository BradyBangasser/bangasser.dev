# Writing

Two kinds of articles share one feed at `/blog`, sorted newest first.

## Site posts

Personal essays and notes that are not tied to a single repo. Create
`content/blog/<slug>.mdx`:

```mdx
---
title: "Notes on job scheduling in HPC clusters"
date: "2026-06-15"
summary: "How scheduling policy shapes throughput and fairness on shared clusters."
tags: ["hpc", "distributed-systems"]
type: "long"
---

## A heading

Body in Markdown or MDX.
```

- `type` is `"long"` (a deep dive) or `"short"` (a note). It only affects the
  label shown on the card.
- Served at `/blog/<slug>`.

## Repo articles

Writing that belongs to a project lives in that repo. Drop Markdown files in
`blog/` and they are autoscanned, newest first. No manifest is needed:

```md
---
title: "Building reproducible golden images"
date: 2026-07-18
summary: "One Packer pipeline, identical images across five clouds."
tags: [cloud]
---

Body.
```

- Top-level `blog/*.md` are posts; `blog/README.md` and `blog/index.md` are ignored.
- Served at `/blog/<project-slug>/content/<slug>`.

## Where writing surfaces

- The unified `/blog` feed shows both kinds, with repo articles labeled "from
  <project>".
- The latest article from each project appears in the home "In the pipeline"
  carousel.
- Everything is indexed for site search.
