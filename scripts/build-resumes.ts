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
  buildData, trimOnce, standaloneTyp, LENGTHS, TEMPLATES, TARGET_PAGES,
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
  const clone = (d: any) => JSON.parse(JSON.stringify(d));
  // How few trims it takes to drop the last page before we consider that page
  // "sparse" and collapse it into a full shorter résumé.
  const COLLAPSE_MAX = 12;

  // Fit `data` to `target` pages, filling the page: trim any overflow, then, if
  // the last page is nearly empty, collapse it into a denser shorter résumé.
  const fit = (data: any, tpl: string, target: number | null): { data: any; pages: number } => {
    let pages = pagesFor(data, tpl);
    if (target == null) return { data, pages };
    for (let i = 0; i < 60 && pages > target && trimOnce(data); i++) pages = pagesFor(data, tpl);

    while (pages >= 2) {
      const probe = clone(data);
      let trims = 0, dropped = false;
      for (let i = 0; i < 60; i++) {
        if (!trimOnce(probe)) break;
        trims++;
        if (pagesFor(probe, tpl) < pages) { dropped = true; break; }
      }
      if (dropped && trims <= COLLAPSE_MAX) { data = probe; pages -= 1; }
      else break;
    }
    return { data, pages };
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
        const built = buildData(master, preset, length);
        const target = TARGET_PAGES[length];
        const { data, pages } = fit(built, template, target);
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
