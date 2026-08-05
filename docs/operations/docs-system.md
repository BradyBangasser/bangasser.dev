# The docs system

Any repo with a `docs/` folder gets a ReadTheDocs-style docs site at
`/projects/<slug>/docs`, with a searchable left nav that mirrors the folder
structure. `docs/README.md` (or `docs/index.md`) is the index; nested folders
become nav sections, and a folder's `README.md`/`index.md` is that section's page.

The fetcher pulls the whole `docs/` tree (one trees API call per repo that has
docs, content over raw), so nesting and ordering follow the repo exactly. This
very page is served that way from the `bangasser.dev` repo.
