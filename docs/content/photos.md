# Photos

Drop image files in `public/photos/` and list them in `lib/site-config.ts` under
`photo.pool`. One is chosen at random per visit on the home, about, and contact
pages. Entries whose files are missing are skipped, so nothing renders broken.
