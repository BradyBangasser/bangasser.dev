# Packing and density

For each (preset, length, template) the packer:

1. Ranks entries: on-preset first (tagged for this preset), then off-preset, each
   by score.
2. Admits entries with their two best bullets, keeping what fits.
3. Grows bullets on admitted entries until the page is full.
4. Borrows off-preset content to finish a page when a preset runs dry.
5. Nudges density (line spacing + gaps, within a ~1.0-1.15 line-spacing band set
   by `DENSITY` in `scripts/build-resumes.ts`) to fill the target exactly.
6. Collapses a two-pager to a full one-pager only if two pages cannot be filled.

Result: every variant fills roughly 95% of its pages. Bullet `priority` (lower is
more important) orders bullets within an entry; `tags` decide on-preset relevance.
