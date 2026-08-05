# Photos

Photos of you are chosen at random per visit on the home, about, and contact
pages.

1. Drop image files in `public/photos/` (for example `public/photos/brady-hero.jpg`).
2. List them in `lib/site-config.ts` under `photo.pool`:

```ts
photo: {
  pool: [
    { src: "/photos/brady-hero.jpg", alt: "Brady Bangasser" },
    { src: "/photos/brady-climbing.jpg", alt: "Rock climbing" },
  ],
},
```

Each page picks one entry at random after load, so the three pages usually
differ. Entries whose files are missing on disk are skipped, and if the pool is
empty the pages fall back to a clean monogram, so nothing ever renders broken.
Add as many as you like.
