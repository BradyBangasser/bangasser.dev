# Static assets

Drop the following files here in `public/`:

- **brady-headshot.jpg** — hero portrait on the home page. Recommended:
  a clean, well-lit professional headshot, roughly 4:5 (portrait), at least
  800×1000px. Referenced by `siteConfig.photo.hero`.
- **brady-flying.jpg** — the flying photo on the About page. Roughly 4:3,
  at least 1000px wide. Referenced by `siteConfig.photo.about`.
- **resume.pdf** — the Resume page links to `/resume.pdf`.

Until a photo file exists, the site falls back gracefully (the hero shows a
monogram; the About photo is simply omitted) — so it never renders a broken
image. To change filenames or paths, edit `siteConfig.photo` in
`lib/site-config.ts`.

This file itself is not served — it's just a note.
