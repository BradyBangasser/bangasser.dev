// Runtime résumé selection - the "algorithm that picks tags for each parameter."
// This replaces the 72 pre-generated per-variant files: the browser filters the
// single master (resume-data.json) by (preset, length) at runtime, then the
// page-fit happens in typst.ts so the length matches the engine that renders.
//
// Ported 1:1 from resume/build.py (build_data + trim_once) - kept in lockstep.

export type Bullet = { text: string; tags?: string[]; priority?: number };
export type Master = any;

export const LENGTHS = ["onepage", "twopage", "full"] as const;
export const TEMPLATES = ["designed", "ats"] as const;
export type Length = (typeof LENGTHS)[number];
export type Template = (typeof TEMPLATES)[number];

export const TARGET_PAGES: Record<Length, number | null> = {
  onepage: 1, twopage: 2, full: null,
};

const BUDGET: Record<Length, { experiences: number; projects: number; bullets: number; max_priority: number }> = {
  // Start generous and let the page-fit trim down; that fills the page instead
  // of leaving whitespace. Higher max_priority lets lower-signal points fill
  // remaining space only when there is room for them.
  onepage: { experiences: 8, projects: 8, bullets: 5, max_priority: 4 },
  twopage: { experiences: 12, projects: 12, bullets: 6, max_priority: 5 },
  full: { experiences: 99, projects: 99, bullets: 99, max_priority: 9 },
};
const PROJECT_MAX_BULLETS = 3;

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(v: string): string {
  if (!v || v === "present") return "Present";
  const [y, m] = v.split("-");
  return `${MONTHS[Number(m)]} ${y}`;
}
function dateRange(s: string, e: string): string {
  return `${fmtDate(s)} \u2013 ${fmtDate(e)}`;
}

function sortKey(entry: any): [number, string, string] {
  const end = entry.end ?? "";
  const endRank = end === "present" ? "9999-99" : end;
  return [entry.pin ?? 0, endRank, entry.start ?? ""];
}
function bySortKeyDesc(a: any, b: any): number {
  const ka = sortKey(a), kb = sortKey(b);
  for (let i = 0; i < 3; i++) {
    if (ka[i] < kb[i]) return 1;
    if (ka[i] > kb[i]) return -1;
  }
  return 0;
}

function hasTag(tags: string[] | undefined, preset: string, length: string): boolean {
  if (!tags || tags.length === 0) return true;
  if (tags.includes("all")) return true;
  if (length === "full" && tags.includes("full")) return true;
  return tags.includes(preset);
}

function pickBullets(bullets: Bullet[], preset: string, length: Length, budget: any): string[] {
  const out = bullets
    .filter((b) => hasTag(b.tags, preset, length) && (b.priority ?? 1) <= budget.max_priority)
    .sort((a, b) => (a.priority ?? 1) - (b.priority ?? 1));
  const trimmed = length !== "full" ? out.slice(0, budget.bullets) : out;
  return trimmed.map((b) => b.text);
}
function topBullets(bullets: Bullet[], n: number): string[] {
  return [...bullets].sort((a, b) => (a.priority ?? 1) - (b.priority ?? 1)).slice(0, n).map((b) => b.text);
}
function pickMin(bullets: Bullet[], preset: string, length: Length, budget: any, minN: number): string[] {
  const chosen = pickBullets(bullets, preset, length, budget);
  if (chosen.length < minN) {
    for (const t of topBullets(bullets, bullets.length)) {
      if (!chosen.includes(t)) chosen.push(t);
      if (chosen.length >= minN) break;
    }
  }
  return chosen;
}

export type RenderData = {
  meta: any; headline: string; summary: string;
  education: any[]; experience: any[]; projects: any[];
  skills: { group: string; items: string[] }[]; interests: string;
};

export function buildData(master: Master, preset: string, length: Length): RenderData {
  const budget = BUDGET[length];
  const p = master.presets[preset];

  const education = [...(master.education ?? [])].sort(bySortKeyDesc)
    .filter((e) => hasTag(e.tags, preset, length))
    .map((e) => ({
      degree: e.degree, school: e.school, location: e.location ?? "",
      dates: dateRange(e.start ?? "", e.end ?? ""),
      gpa: e.gpa ?? "", honors: e.honors ?? "",
      minors: length !== "onepage" ? (e.minors ?? "") : "",
      lines: (e.notes ?? []).filter((n: any) => hasTag(n.tags, preset, length)).map((n: any) => n.text),
    }));

  let experience = [...(master.experience ?? [])].sort(bySortKeyDesc)
    .filter((x) => hasTag(x.tags, preset, length))
    .map((x) => {
      const bullets = pickMin(x.bullets ?? [], preset, length, budget, 2);
      return bullets.length < 2 ? null : {
        id: x.id ?? x.org, title: x.title, org: x.org,
        location: length === "onepage" ? "" : (x.location ?? ""),
        dates: dateRange(x.start ?? "", x.end ?? ""), bullets,
      };
    })
    .filter(Boolean) as any[];
  experience = experience.slice(0, budget.experiences);

  let projects = (master.projects ?? [])
    .filter((pr: any) => hasTag(pr.tags, preset, length))
    .map((pr: any) => {
      const bullets = pickMin(pr.bullets ?? [], preset, length, budget, 2).slice(0, PROJECT_MAX_BULLETS);
      return bullets.length < 2 ? null : {
        name: pr.name, period: pr.period ?? "",
        tech: length !== "onepage" ? (pr.tech ?? []) : [], bullets,
      };
    })
    .filter(Boolean) as any[];
  projects = projects.slice(0, budget.projects);

  let skills = (master.skills ?? [])
    .filter((g: any) => hasTag(g.tags, preset, length))
    .map((g: any) => {
      let items = (g.items ?? []).filter((i: any) => hasTag(i.tags, preset, length)).map((i: any) => i.name);
      if (length === "onepage") items = items.slice(0, 8);
      return items.length ? { group: g.group, items } : null;
    })
    .filter(Boolean) as any[];
  if (length === "onepage") skills = skills.slice(0, 4);

  let interests = "";
  const intr = master.interests;
  if (intr && hasTag(intr.tags, preset, length)) interests = intr.text;

  return {
    meta: master.meta, headline: p?.headline ?? "", summary: p?.summary ?? "",
    education, experience, projects, skills, interests,
  };
}

// ---------------------------------------------------------------------------
// Weighted selection: every entry competes on base_weight x recency(start).
// A greedy packer (in build-resumes) fills the page by score, borrowing
// off-preset content when a preset runs dry, then nudges density to fill.
// ---------------------------------------------------------------------------

export const DEFAULT_WEIGHT = 5;   // 1-10 base scale; unset entries sit mid-pack
export const HALF_LIFE_YEARS = 5;  // a job counts half as much 5 years after it started

export function recency(start?: string, nowMs = Date.now()): number {
  if (!start || start === "present") return 1;
  const [y, mo] = start.split("-").map(Number);
  const t = new Date(y, (mo || 1) - 1, 1).getTime();
  const years = Math.max(0, (nowMs - t) / (365.25 * 86_400_000));
  return Math.pow(0.5, years / HALF_LIFE_YEARS);
}
function entryScore(e: any): number {
  return (e.weight ?? DEFAULT_WEIGHT) * recency(e.start);
}

export type PoolBullet = { text: string; onPreset: boolean; priority: number };
export type Unit = {
  kind: "experience" | "project";
  id: string;
  score: number;
  onPreset: boolean;
  head: any;
  sortKey: string;
  bullets: PoolBullet[];
};
export type Frame = {
  meta: any; headline: string; summary: string;
  education: any[]; skills: { group: string; items: string[] }[]; interests: string;
  conferences: any[];
};

function orderBullets(bullets: Bullet[], preset: string): PoolBullet[] {
  return (bullets ?? [])
    .map((b) => ({ text: b.text, onPreset: hasTag(b.tags, preset, "twopage"), priority: b.priority ?? 1 }))
    .sort((a, b) => Number(b.onPreset) - Number(a.onPreset) || a.priority - b.priority);
}

// The frame (always shown) plus every entry as a scored unit. Units are ranked
// on-preset first, then by weight x recency, so the packer takes the strongest
// relevant content first and borrows the rest to fill.
export function buildPool(master: Master, preset: string): { frame: Frame; units: Unit[] } {
  const p = master.presets[preset];
  const education = [...(master.education ?? [])].sort(bySortKeyDesc)
    .filter((e) => hasTag(e.tags, preset, "twopage"))
    .map((e) => ({
      degree: e.degree, school: e.school, location: e.location ?? "",
      dates: dateRange(e.start ?? "", e.end ?? ""), gpa: e.gpa ?? "", honors: e.honors ?? "",
      minors: e.minors ?? "",
      lines: (e.notes ?? []).filter((n: any) => hasTag(n.tags, preset, "twopage")).map((n: any) => n.text),
    }));
  const skills = (master.skills ?? []).filter((g: any) => hasTag(g.tags, preset, "twopage"))
    .map((g: any) => {
      const items = (g.items ?? []).filter((i: any) => hasTag(i.tags, preset, "twopage")).map((i: any) => i.name);
      return items.length ? { group: g.group, items } : null;
    }).filter(Boolean) as any[];
  const conferences = [...(master.conferences ?? [])].sort(bySortKeyDesc)
    .filter((c: any) => hasTag(c.tags, preset, "twopage"))
    .map((c: any) => ({
      event: c.event, role: c.role ?? "", location: c.location ?? "",
      dates: dateRange(c.start ?? "", c.end ?? ""),
      lines: (c.notes ?? []).filter((n: any) => hasTag(n.tags, preset, "twopage")).map((n: any) => n.text),
    }));
  const intr = master.interests;
  const interests = intr && hasTag(intr.tags, preset, "twopage") ? intr.text : "";
  const frame: Frame = { meta: master.meta, headline: p?.headline ?? "", summary: p?.summary ?? "", education, skills, interests, conferences };

  const expUnits: Unit[] = (master.experience ?? []).map((x: any) => ({
    kind: "experience", id: x.id ?? x.org, score: entryScore(x), onPreset: hasTag(x.tags, preset, "twopage"), strict: x.strict === true,
    head: { title: x.title, org: x.org, location: x.location ?? "", dates: dateRange(x.start ?? "", x.end ?? "") },
    sortKey: `${x.end === "present" ? "9999-99" : (x.end ?? "")}|${x.start ?? ""}`,
    bullets: orderBullets(x.bullets, preset),
  }));
  const projUnits: Unit[] = (master.projects ?? []).map((pr: any) => ({
    kind: "project", id: pr.id ?? pr.name, score: entryScore(pr), onPreset: hasTag(pr.tags, preset, "twopage"), strict: pr.strict === true,
    head: { name: pr.name, period: pr.period ?? "", tech: pr.tech ?? [] },
    sortKey: `${pr.period ?? ""}|`,
    bullets: orderBullets(pr.bullets, preset),
  }));

  const units = [...expUnits, ...projUnits]
    .filter((u) => u.bullets.length >= 2)
    .filter((u: any) => u.onPreset || !u.strict)
    .sort((a, b) => Number(b.onPreset) - Number(a.onPreset) || b.score - a.score);
  return { frame, units };
}

// Turn a selection (each unit + how many bullets) into render data. Entries are
// selected by score but displayed reverse-chronologically, the resume norm.
export function assemble(
  frame: Frame,
  selection: { unit: Unit; n: number }[],
  density: number,
  length: Length,
): any {
  const chosen = selection.filter((s) => s.n >= 2);
  const experience = chosen.filter((s) => s.unit.kind === "experience")
    .sort((a, b) => (a.unit.sortKey < b.unit.sortKey ? 1 : -1))
    .map((s) => ({
      ...s.unit.head,
      location: length === "onepage" ? "" : s.unit.head.location,
      bullets: s.unit.bullets.slice(0, s.n).map((b) => b.text),
    }));
  const projects = chosen.filter((s) => s.unit.kind === "project")
    .sort((a, b) => (a.unit.sortKey < b.unit.sortKey ? 1 : -1))
    .map((s) => ({
      name: s.unit.head.name, period: s.unit.head.period,
      tech: length === "onepage" ? [] : s.unit.head.tech,
      bullets: s.unit.bullets.slice(0, s.n).map((b) => b.text),
    }));
  let skills = frame.skills;
  if (length === "onepage") skills = skills.slice(0, 4).map((g) => ({ group: g.group, items: g.items.slice(0, 8) }));
  const education = frame.education.map((e) => ({ ...e, minors: length === "onepage" ? "" : e.minors }));
  return {
    meta: frame.meta, headline: frame.headline, summary: frame.summary,
    education, experience, projects, skills, interests: frame.interests,
    // Conferences rank below relevant projects: on the space-constrained
    // one-page layout, projects and experience take the room and conferences
    // is dropped. It shows on two-page and full.
    conferences: length === "onepage" ? [] : frame.conferences, density,
  };
}

// One shrink step, matching build.py trim_once. Mutates `data`; returns false
// when nothing else can go. Never trims an entry below two points.
export function trimOnce(data: RenderData): boolean {
  const { experience: exp, projects: proj, education: edu } = data;
  if (data.skills.length > 4) { data.skills.pop(); return true; }
  for (let i = exp.length - 1; i >= 0; i--) {
    if (exp[i].bullets.length > 2) { exp[i].bullets.pop(); return true; }
  }
  for (let i = proj.length - 1; i >= 0; i--) {
    if (proj[i].bullets.length > 2) { proj[i].bullets.pop(); return true; }
  }
  if (proj.length > 1) { proj.pop(); return true; }
  if (exp.length > 2) { exp.pop(); return true; }
  if (proj.length > 0) { proj.pop(); return true; }
  for (let i = edu.length - 1; i >= 0; i--) {
    if ((edu[i].lines?.length ?? 0) > 1) { edu[i].lines.pop(); return true; }
  }
  return false;
}

// Self-contained .typ (data + icons inlined) for the "Download .typ" button,
// generated at build time. Compiles standalone with `typst compile`.
export function standaloneTyp(templateSrc: string, dataJson: string, ghSvg: string, liSvg: string): string {
  let body = templateSrc.replace('#let data = json("/build/data.json")\n', "");
  const pre = [
    "// Self-contained resume generated from resume.yml.",
    "// Compile:  typst compile thisfile.typ",
    "#let __data = ```", dataJson, "```",
    "#let data = json(bytes(__data.text))",
  ];
  if (templateSrc.includes("/templates/icons/github.svg")) {
    pre.push("#let __ghsvg = ```", ghSvg.trim(), "```", "#let __lisvg = ```", liSvg.trim(), "```");
    body = body
      .replace('#let __gh = image("/templates/icons/github.svg", height: 8.5pt)',
               '#let __gh = image(bytes(__ghsvg.text), format: "svg", height: 8.5pt)')
      .replace('#let __li = image("/templates/icons/linkedin.svg", height: 8.5pt)',
               '#let __li = image(bytes(__lisvg.text), format: "svg", height: 8.5pt)');
  }
  return pre.join("\n") + "\n" + body;
}
