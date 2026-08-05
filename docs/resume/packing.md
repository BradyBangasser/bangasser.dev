# Packing and density

For each of the 36 variants (preset x length x template) the packer in
`scripts/build-resumes.ts` fills the page rather than just avoiding overflow.

## The algorithm

1. **Rank.** Every entry is a unit, scored by weight x recency. Units are ordered
   on-preset first (tagged for this preset), then off-preset, each group by score.
2. **Admit.** Walk the units in order, adding each with its two best bullets and
   keeping it only if the page still fits.
3. **Grow.** Walk the admitted units again, adding bullets one at a time (cap
   `MAX_BULLETS`) until the page is full.
4. **Borrow.** When on-preset content runs dry, off-preset bullets fill the rest
   so a narrow preset still reaches a full page.
5. **Density.** With content fixed, open spacing to the largest `DENSITY` step
   that still fits, filling the target exactly.
6. **Collapse.** A two-pager becomes a full one-pager only if two pages cannot be
   filled even at maximum density.

The result is ~95% fill on every variant, with two-pagers always two full pages.

## Density band

`DENSITY` in `scripts/build-resumes.ts` sets the spacing multipliers. It scales
line spacing and section, entry, and bullet gaps in the templates via the
`density` value in the data. The band is deliberately narrow because resume
typography research puts readable, ATS-safe line spacing at roughly 1.0 to 1.15;
most of the range lives in the gaps, and margins stay fixed.

```
designed: [1.0, 1.08, 1.16, 1.25, 1.34]
ats:      [1.0, 1.05, 1.1, 1.16]
```

## Bullets: tags and priority

- `tags` on a bullet decide on-preset relevance (which preset the bullet belongs
  to). A bullet tagged `[all]` shows on every preset.
- `priority` (lower is more important) orders bullets within an entry.
- On the `full` length, only on-preset bullets are shown, so per-preset variants
  of the same point do not stack.

## Testing

```bash
npm run build-resumes
```

Check `lib/resume-manifest.json` for each variant's `pages`, and open the PDFs in
`public/resumes/`. Both are gitignored build artifacts, regenerated every build.
