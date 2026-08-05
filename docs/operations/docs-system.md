# The docs system

Any repo with a `docs/` folder gets a ReadTheDocs-style docs site at
`/projects/<slug>/docs`, with a searchable left nav that mirrors the folder
structure. This page is served that way from the `bangasser.dev` repo.

## Structure and routing

- `docs/README.md` (or `docs/index.md`) is the index, shown at
  `/projects/<slug>/docs`.
- A nested folder becomes a nav section. The folder's own `README.md` or
  `index.md` is that section's landing page.
- Any other `foo.md` becomes `/projects/<slug>/docs/<path>/foo`.

So a tree like:

```
docs/
  README.md
  resume/
    README.md
    weighting.md
```

produces `/docs`, `/docs/resume`, and `/docs/resume/weighting`, with "Resume" as
a nav section and "Weighting" nested under it.

## Titles and ordering

- A page's title is its first `# H1`, falling back to the filename.
- Within a folder, `README`/`index` sorts first, then files alphabetically;
  shallower folders sort before deeper ones.

## How it is fetched

When a repo has `docs/README.md`, the fetcher makes one git-trees API call to
list the tree, then pulls each `.md` over raw. Content is sanitized and rendered
through the same Markdown pipeline as READMEs, and links are absolutized. The
nav, search, and nesting are built from the flat file list in `lib/content.ts`
(`buildDocsNav`, `resolveDoc`, `docToUrlPath`).

## Authoring tips

- Give every folder a `README.md` so its nav section has a landing page.
- Lead each file with a single `# H1`; it becomes the nav label and page title.
- Keep the tree shallow (two levels reads best in the sidebar).
