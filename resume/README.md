# Resume system

One master file, two looks, many prebuilt variants, plus optional AI tailoring
on the website.

## Files
- `resume.yml` - the single source of truth (all content, public).
- `build.py` - filters `resume.yml` by preset + length, renders a PDF via Typst,
  and auto-fits (starts generous, trims to the page target so pages fill).
- `export.py` - writes `../lib/resume-data.json` (used by the About page and the
  `/resume` UI) and prebuilds every variant into `../public/resumes/`.
- `templates/resume.typ` - **designed** look: two-column entries (org bold on top,
  role beneath; location + dates right-aligned), shortest possible header.
- `templates/resume-ats.typ` - **ATS-safe** look: single column, standard
  headings, plainer for application portals that parse resumes automatically.

Both templates keep every bullet in a non-breakable block, so no point ever
splits across a page.

## Presets and lengths
- Presets: `sre`, `cloud`, `hpc`, `compilers`, `software`.
- Lengths: `onepage`, `twopage`, `full`.
- Templates: `designed`, `ats`.

Content is tagged per preset and given a priority; the builder keeps the
highest-priority items that fit. Projects always show 2–3 points (a project is
dropped whole before it would be trimmed below two).

## Regenerate
```bash
pip install typst pyyaml pymupdf     # once
npm run resumes                       # -> data + self-contained .typ (compiled in the browser)
# or a single variant:
python resume/build.py --preset sre --length onepage --template designed
```

## Website (/resume)
- Field / length / style pickers download the matching prebuilt PDF instantly
  (zero runtime cost).
- "Tailor to a job posting" calls `/api/resume/tailor`: GitHub sign-in required,
  rate-limited (owner exempt), runs server-side on your Anthropic key, and points
  the visitor at the best-fit variant with a short rationale. See `.env.example`.
