# bangasser.dev

Brady Bangasser's personal site — Next.js 16 (App Router) + TypeScript +
Tailwind, MDX content, self-hostable via Docker.

## Stack

- **Next.js 16** (App Router, `output: "standalone"` for a small self-hosted image)
- **Tailwind CSS** for styling, dark theme, electric-blue accent
- **MDX** for blog posts and project write-ups (no CMS, no database)
- **Self-hosted fonts** via `@fontsource` (no build-time dependency on Google's font CDN)
- A **build-time GitHub scanner** (`scripts/fetch-github.ts`) that pulls your
  public repos into the Projects page automatically

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

`npm run dev` and `npm run build` both run `scripts/fetch-github.ts` first
(via the `predev` / `prebuild` npm hooks) to refresh the auto-generated
project list from GitHub. If GitHub is unreachable, the build still
succeeds — it just falls back to the last snapshot (or an empty list on
the very first run).

## Adding content

### Blog posts

Add a `.mdx` file to `content/blog/`:

```mdx
---
title: "Your title"
date: "2026-07-03"
summary: "One sentence for the card and SEO description."
tags: ["hpc", "cryptography"]
type: "short"   # or "long"
---

Body goes here, standard Markdown/MDX, code blocks are syntax-highlighted
automatically.
```

`type: "short"` is for quick notes; `type: "long"` gets the same layout
plus is labeled as a deep dive. There's no length enforcement — `type` is
just a label, use it however feels right.

### Projects

Same idea, in `content/projects/`:

```mdx
---
title: "Project name"
date: "2026-07-03"
summary: "One sentence."
tags: ["cloud", "security"]
status: "active"   # active | archived | concept
repo: "BradyBangasser/repo-name"   # optional — links to GitHub
externalUrl: "https://example.com"  # optional — live demo link
featured: true   # optional — surfaces it on the home page
---

Write-up goes here.
```

Any public GitHub repo *without* a curated write-up still shows up
automatically as a lightweight card under "More on GitHub" on the Projects
page, generated at build time.

### Editing your bio, links, and services

Everything else — name, bio, education, focus areas, social links,
consulting services, default SEO copy — lives in one file:
**`lib/site-config.ts`**. Edit that, nothing else needs to change for
routine content updates. Leave any `social.*` field as `""` to hide it.

### Resume

Drop a PDF at `public/resume.pdf` — the Resume page already links to it.

## Theming

Colors, fonts, and the terminal/build-log motif are defined as tokens in
`tailwind.config.ts` (colors) and `app/globals.css` (font variables,
component classes like `.card`, `.eyebrow`, `.tag-pill`). Change the hex
values there to re-theme the whole site.

## SEO

- Per-page `<title>`/description via each page's `generateMetadata` /
  `metadata` export
- `app/sitemap.ts` and `app/robots.ts` — generated automatically from your
  content
- `app/rss.xml/route.ts` — RSS feed of blog posts
- JSON-LD structured data: `Person` (root layout) and `Article` (each blog
  post)
- Auto-generated favicon (`app/icon.tsx`) and social share image
  (`app/opengraph-image.tsx`) — no image files to manage

Update `siteConfig.url` in `lib/site-config.ts` if the domain ever changes.

## Deployment (self-hosted)

This is built to run anywhere via Docker — no platform lock-in.

```bash
docker compose up -d --build
```

That builds the image and runs it on port 3000. Put your own reverse proxy
in front for HTTPS, or uncomment the `caddy` service in
`docker-compose.yml` (edit `Caddyfile` with your domain first) for
automatic HTTPS.

**CI/CD:** `.github/workflows/docker-build.yml` builds and pushes an image
to GitHub Container Registry (`ghcr.io`) on every push to `main`. There's a
commented-out SSH deploy step at the bottom of that file — uncomment it and
add `SSH_HOST` / `SSH_USER` / `SSH_KEY` as repo secrets to auto-deploy to
your own server after each push.

**Manual / non-Docker deploy:** `npm run build && npm run start` also
works directly on any server with Node 20+.

## Project structure

```
app/                  routes (App Router)
  blog/, projects/     index + [slug] pages
  *.ts                 sitemap, robots, rss, icon, og-image
components/            shared UI
content/
  blog/                blog posts (.mdx)
  projects/            project write-ups (.mdx)
  projects/_generated.json   auto-generated GitHub scan (gitignored)
lib/
  site-config.ts       ← edit this for bio/links/copy
  content.ts           MDX loading + frontmatter types
  mdx.tsx              MDX compilation (syntax highlighting, anchors)
scripts/
  fetch-github.ts       build-time GitHub repo scanner
```
