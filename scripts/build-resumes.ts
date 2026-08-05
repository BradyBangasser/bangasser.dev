// ---------------------------------------------------------------------------
// Runs automatically before `npm run dev` / `npm run build` (package.json
// "predev" / "prebuild"). Generates every résumé variant at build time with a
// native Typst compiler — no browser compile, no separate manual step.
//
//   lib/resume-data.json       master (About page + tailoring)
//   lib/resume-manifest.json    variant index the /resume page reads
//   public/resumes/*.pdf        prebuilt PDFs, fit to the right length
//   public/resumes/typ/*.typ    self-contained sources for "Download .typ"
//
// All outputs are gitignored — they never live in the repo, they're rebuilt
// on every deploy. Page-fit measures pages with the same engine that renders,
// so 1-page really is 1 page and 2-page really is 2.
// ---------------------------------------------------------------------------

import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  buildPool, assemble, standaloneTyp, LENGTHS, TEMPLATES, TARGET_PAGES,
} from "../lib/resume-filter";

const ROOT = process.cwd();
const TEMPLATE_FILE: Record<string, string> = { designed: "resume.typ", ats: "resume-ats.typ" };

// A repo's .resume.yml is the ultimate truth for that project: it defines one
// project entry (name/period/tech/tags/bullets) that overrides any hand-authored
// entry of the same id in resume.yml. `resume: false` (or `index: false`) opts
// out. Bad YAML is skipped with a warning rather than failing the build.
function mergeRepoResumeEntries(master: any): void {
  const gen = path.join(ROOT, "content", "projects", "_generated.json");
  if (!fs.existsSync(gen)) return;
  let generated: any[];
  try {
    generated = JSON.parse(fs.readFileSync(gen, "utf8")).projects ?? [];
  } catch {
    return;
  }
  master.projects = master.projects ?? [];
  for (const g of generated) {
    if (!g.resumeYml) continue;
    let entry: any;
    try {
      entry = yaml.load(g.resumeYml);
    } catch (e) {
      console.warn(`[resume] ${g.fullName}: bad .resume.yml (${(e as Error).message}); skipped`);
      continue;
    }
    if (!entry || typeof entry !== "object") continue;
    if (entry.resume === false || entry.index === false) continue; // opt-out
    const bullets = Array.isArray(entry.bullets) ? entry.bullets : [];
    if (bullets.length === 0) {
      console.warn(`[resume] ${g.fullName}: .resume.yml has no bullets; skipped`);
      continue;
    }
    const proj: any = {
      id: entry.id ?? g.slug,
      name: entry.name ?? g.name,
      period: entry.period ?? (g.pushedAt ? String(g.pushedAt).slice(0, 4) : ""),
      tags: entry.tags ?? ["software"],
      tech: entry.tech ?? [],
      bullets,
    };
    if (entry.pin !== undefined) proj.pin = entry.pin;
    const i = master.projects.findIndex((p: any) => p.id === proj.id);
    if (i >= 0) master.projects[i] = proj;
    else master.projects.push(proj);
    console.log(`[resume] indexed ${g.fullName} .resume.yml as project "${proj.id}"`);
  }
}

function main() {
  const master: any = yaml.load(fs.readFileSync(path.join(ROOT, "resume/resume.yml"), "utf8"));
  mergeRepoResumeEntries(master);

  fs.mkdirSync(path.join(ROOT, "lib"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "lib/resume-data.json"), JSON.stringify(master, null, 2));

  // disk workspace: templates + icons + the per-variant data.json
  const WS = fs.mkdtempSync(path.join(os.tmpdir(), "resumes-"));
  fs.mkdirSync(path.join(WS, "build"));
  fs.mkdirSync(path.join(WS, "templates/icons"), { recursive: true });
  const tplSrc: Record<string, string> = {};
  for (const [tpl, file] of Object.entries(TEMPLATE_FILE)) {
    const src = fs.readFileSync(path.join(ROOT, "resume/templates", file), "utf8");
    tplSrc[tpl] = src;
    fs.writeFileSync(path.join(WS, "templates", file), src);
  }
  const ghSvg = fs.readFileSync(path.join(ROOT, "resume/templates/icons/github.svg"), "utf8");
  const liSvg = fs.readFileSync(path.join(ROOT, "resume/templates/icons/linkedin.svg"), "utf8");
  fs.writeFileSync(path.join(WS, "templates/icons/github.svg"), ghSvg);
  fs.writeFileSync(path.join(WS, "templates/icons/linkedin.svg"), liSvg);

  const outDir = path.join(ROOT, "public/resumes");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, "typ"), { recursive: true });

  const c = NodeCompiler.create({ workspace: WS });
  const dataPath = path.join(WS, "build/data.json");
  const mainFile = (tpl: string) => path.join(WS, "templates", TEMPLATE_FILE[tpl]);

  const pagesFor = (data: any, tpl: string): number => {
    fs.writeFileSync(dataPath, JSON.stringify(data));
    c.evictCache(0);
    const res: any = c.compile({ mainFilePath: mainFile(tpl) });
    if (res.hasError()) { res.printErrors(); throw new Error("typst compile error"); }
    return res.result.numOfPages;
  };

  // Density lever (multiplies leading + section/entry/bullet gaps in the
  // template). Grounded in resume-typography research: keep line spacing near
  // 1.0-1.15, so the band is narrow and mostly lives in the gaps.
  const DENSITY: Record<string, number[]> = {
    designed: [1.0, 1.08, 1.16, 1.25, 1.34],
    ats: [1.0, 1.05, 1.1, 1.16],
  };
  const MAX_BULLETS = 6;

  // Weighted greedy pack + density fill. Take the strongest content by
  // score (on-preset first, then borrowed) until the page is full, then open
  // spacing within the band to fill the target exactly.
  const pack = (preset: string, length: any, template: string, target: number | null): { data: any; pages: number } => {
    const { frame, units } = buildPool(master, preset);
    const sel = units.map((u) => ({ unit: u, n: 0 }));
    const pagesAt = (d: number) => pagesFor(assemble(frame, sel, d, length), template);

    if (target == null) {
      // "full" = every on-preset bullet (comprehensive for the role) rather than
      // literally all bullets, so off-preset, per-preset variants of the same
      // point (e.g. the tailored conference lines) do not stack up.
      for (const s of sel) {
        const onPreset = s.unit.bullets.filter((b) => b.onPreset).length;
        s.n = Math.min(s.unit.bullets.length, Math.max(2, onPreset));
      }
      return { data: assemble(frame, sel, 1.0, length), pages: pagesAt(1.0) };
    }

    // Phase 1: admit each unit (score order) with its two best bullets if it fits.
    for (const s of sel) {
      s.n = Math.min(2, s.unit.bullets.length);
      if (pagesAt(1.0) > target) s.n = 0;
    }
    // Phase 2: grow bullets on admitted units, score order, until the page is full.
    for (const s of sel) {
      if (s.n === 0) continue;
      while (s.n < Math.min(s.unit.bullets.length, MAX_BULLETS)) {
        s.n++;
        if (pagesAt(1.0) > target) { s.n--; break; }
      }
    }
    // Phase 3: fill by density — largest band step that stays within target.
    let bestD = 1.0;
    for (const d of DENSITY[template]) {
      if (d <= 1.0) continue;
      if (pagesAt(d) <= target) bestD = d; else break;
    }
    return { data: assemble(frame, sel, bestD, length), pages: pagesAt(bestD) };
  };

  const manifest: any = {
    presets: {}, lengths: LENGTHS, templates: TEMPLATES,
    default: "sre-onepage-designed", files: {},
  };
  for (const [id, p] of Object.entries<any>(master.presets)) {
    manifest.presets[id] = { label: p.label ?? id, headline: p.headline ?? "" };
  }

  const presets = Object.keys(master.presets);
  for (const preset of presets) {
    for (const length of LENGTHS) {
      for (const template of TEMPLATES) {
        const target = TARGET_PAGES[length];
        let { data, pages } = pack(preset, length, template, target);
        // If a two-pager can't honestly fill two pages even stretched, make it
        // a full one-pager instead of a sparse second page.
        if (target === 2 && pages < 2) ({ data, pages } = pack(preset, length, template, 1));
        const key = `${preset}-${length}-${template}`;
        fs.writeFileSync(dataPath, JSON.stringify(data));
        c.evictCache(0);
        const pdf = c.pdf({ mainFilePath: mainFile(template) });
        fs.writeFileSync(path.join(outDir, `resume-${key}.pdf`), Buffer.from(pdf));
        fs.writeFileSync(path.join(outDir, "typ", `${key}.typ`),
          standaloneTyp(tplSrc[template], JSON.stringify(data), ghSvg, liSvg));
        manifest.files[key] = {
          file: `/resumes/resume-${key}.pdf`,
          typ: `/resumes/typ/${key}.typ`,
          template, pages,
        };
      }
    }
  }

  fs.writeFileSync(path.join(ROOT, "lib/resume-manifest.json"), JSON.stringify(manifest, null, 2));
  fs.rmSync(WS, { recursive: true, force: true });
  const n = Object.keys(manifest.files).length;
  console.log(`built ${n} résumé variants (pages filled to length)`);
}

main();
