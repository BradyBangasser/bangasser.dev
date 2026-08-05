# Weighting

Every experience and project competes on a single score:

```
score = base_weight x recency(start_date)
recency = 0.5 ^ (years_since_start / HALF_LIFE_YEARS)
```

- **`weight`** (1-10) is set per entry in `resume.yml`. IBM, Iowa State, and John
  Deere carry the highest weights; unset entries default to `DEFAULT_WEIGHT` (5).
- **recency** uses the start date with a 5-year half-life. Change the fade speed
  with `HALF_LIFE_YEARS` in `lib/resume-filter.ts`.

To reorder what appears, change `weight`. You never edit the selection by hand.
