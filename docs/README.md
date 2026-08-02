# Resume system

The resume is data plus an algorithm. You edit content and weights in
`resume/resume.yml`; a build-time packer selects and lays out each variant so it
fills its target length. Nothing generated is committed.

## Files you edit

| File | What it controls |
| --- | --- |
| `resume/resume.yml` | All content: experience, projects, education, skills, presets, and per-entry `weight`. |
| `lib/resume-filter.ts` | Scoring + selection (`HALF_LIFE_YEARS`, `DEFAULT_WEIGHT`, tag rules). |
| `scripts/build-resumes.ts` | The packer + the `DENSITY` spacing band. |
| `resume/templates/*.typ` | Layout. `designed` is human-facing, `ats` is plainer. |

## How an entry is ranked

Every experience and project competes on a single score:

```
score = base_weight x recency(start_date)
recency = 0.5 ^ (years_since_start / HALF_LIFE_YEARS)
```

- **`weight`** (1-10) is set per entry in `resume.yml`. IBM, Iowa State, and John
  Deere carry the highest weights. Unset entries default to `DEFAULT_WEIGHT` (5).
- **recency** uses the **start date** with a 5-year half-life: a role started 5
  years ago counts half as much as a current one. Change the fade speed with
  `HALF_LIFE_YEARS` in `lib/resume-filter.ts`.

To reorder what appears, change `weight`. To change how fast old roles fade,
change the half-life. You never edit the selection by hand.

## How a page gets filled

For each (preset, length, template) the packer:

1. Ranks every entry: on-preset first (tagged for this preset), then off-preset,
   each group by score.
2. Admits entries with their two best bullets, in order, keeping only what fits.
3. Grows bullets on admitted entries until the page is full.
4. If it is still short, **borrows off-preset content** (your generally-strong
   material) to finish the page.
5. Nudges **density** (line spacing + section gaps, within a research-based band
   of ~1.0-1.15 line spacing) to fill the target exactly.
6. If a two-page target genuinely cannot fill two pages, it becomes a full
   one-pager instead of a sparse second page.

Result: every variant fills ~95% of its pages.

## Tags and priorities

- A preset (`sre`, `cloud`, `sales`, ...) is defined in `resume.yml` under
  `presets`. An entry or bullet tagged with that preset is **on-preset** (shown
  first); untagged/other-tagged content is borrowed only to fill.
- Bullet `priority` (lower is more important) orders bullets within an entry.

## Per-repo resume entries

A repo can own its resume entry with a `.resume.yml` (see the top-level `DOCS.md`).
It is indexed as the ultimate truth for that project and competes on score like
anything else (give it a `weight` to place it).

## Testing your changes

```bash
npm run build-resumes      # regenerate all variants
```

Then check `lib/resume-manifest.json` for each variant's `pages`, and open the
PDFs in `public/resumes/` (both are gitignored build artifacts). `npm run dev`
does this automatically and serves the picker at `/resume`.
