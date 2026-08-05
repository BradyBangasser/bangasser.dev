# Editing this site

Content comes from three places: your GitHub repos (auto-discovered at build
time), local content files in this repo, and `lib/site-config.ts` for site-wide
copy. Nothing generated is committed. These docs are grouped into three areas:

- **Content** covers projects, writing, and photos.
- **Resume** covers the weighted resume builder.
- **Operations** covers metrics, deploys, and the docs system itself.

## The build in one paragraph

`npm run build` (and `npm run dev`) first runs `prebuild`: `fetch_github.py`
scans your account and writes `content/projects/_generated.json`, then
`build-resumes` compiles every resume PDF, then `build-search` writes the search
index. All outputs are gitignored. The build host needs `node` and `python3`;
set `GITHUB_TOKEN` to avoid API rate limits.
