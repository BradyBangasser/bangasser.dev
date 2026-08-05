# Resume system

The resume is data plus an algorithm. Edit content and weights in
`resume/resume.yml`; a build-time packer selects and lays out each variant so it
fills its target length. See Weighting for how entries rank and Packing for how a
page gets filled.

Regenerate with `npm run build-resumes`; check `lib/resume-manifest.json` for
each variant's `pages` and open the PDFs in `public/resumes/` (both gitignored).
