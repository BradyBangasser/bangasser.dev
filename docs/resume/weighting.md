# Weighting

Nothing on the resume is pinned. Every experience and project competes on one
score, and the builder selects and orders by it:

```
score = base_weight x recency(start_date)
recency = 0.5 ^ (years_since_start / HALF_LIFE_YEARS)
```

## base_weight

Set `weight` (1-10) per entry in `resume/resume.yml`. Current anchors:

| Entry | weight |
| --- | --- |
| IBM (firmware) | 10 |
| Iowa State (sysadmin) | 9 |
| John Deere (cloud security) | 9 |
| Iowa State research (compilers) | 8 |
| Iowa State research (ML) | 7 |
| Bethel research (HPC) | 6 |
| Cardinal Space Mining, Cyclone Rocketry | 5 |
| Caribou Coffee | 3 |

Entries with no `weight` default to `DEFAULT_WEIGHT` (5) in
`lib/resume-filter.ts`.

## recency

Uses the **start date** with a 5-year half-life: a role started 5 years ago
counts half as much as one starting today, 10 years ago a quarter, and so on. It
never reaches zero, so a strong old role still places. Change the fade speed with
`HALF_LIFE_YEARS` in `lib/resume-filter.ts`.

## Tuning

- To move an entry up or down, change its `weight`. You never hand-edit which
  bullets appear.
- To make the past fade faster or slower everywhere, change `HALF_LIFE_YEARS`.
- Scale matters: with a 1-10 base and a recency multiplier of roughly 0.3-1.0, a
  trivial recent entry cannot outrank a heavyweight. Widen the base spread to let
  weight dominate; narrow it to let recency dominate.

## Display order

Selection is by score, but entries are displayed reverse-chronologically, the
resume norm. So the highest-weighted roles are always chosen, then shown newest
first.
