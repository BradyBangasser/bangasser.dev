#!/usr/bin/env python3
"""
Build tailored resumes from the single master file (resume.yml).

    python build.py --preset sre --length onepage --template designed
    python build.py --all          # build every preset x length x template

Pipeline:  resume.yml  --(filter by preset+length)-->  render JSON  -->  Typst  -->  PDF

The same filtering logic is intended to be mirrored in TypeScript for the
in-browser (WASM Typst) path, so the Typst templates stay "dumb": they render
whatever the JSON gives them and make no filtering decisions.
"""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path

import yaml
import typst

ROOT = Path(__file__).resolve().parent
MASTER = ROOT / "resume.yml"
TEMPLATES = ROOT / "templates"
BUILD = ROOT / "build"
OUT = ROOT / "out"

PRESETS = ["sre", "cloud", "hpc", "compilers", "software", "sales"]
LENGTHS = ["onepage", "twopage", "full"]
TEMPLATE_FILES = {"designed": "resume.typ", "ats": "resume-ats.typ"}

# How many items / bullets survive at each length. `full` = no caps.
BUDGET = {
    "onepage": {"experiences": 4, "projects": 3, "bullets": 3, "max_priority": 3},
    "twopage": {"experiences": 8, "projects": 7, "bullets": 4, "max_priority": 4},
    "full":    {"experiences": 99, "projects": 99, "bullets": 99, "max_priority": 9},
}
# Target page count per length (None = no limit). Renders start generous and
# trim down to this many pages, which fills the available space.
TARGET_PAGES = {"onepage": 1, "twopage": 2, "full": None}
PROJECT_MAX_BULLETS = 3   # "2-3 points per project"
PROJECT_MIN_BULLETS = 2   # never show a project with fewer; drop it instead

MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def fmt_date(v: str) -> str:
    if not v or v == "present":
        return "Present"
    y, m = v.split("-")
    return f"{MONTHS[int(m)]} {y}"


def date_range(start: str, end: str) -> str:
    return f"{fmt_date(start)} \u2013 {fmt_date(end)}"


def sort_key(entry: dict):
    """Pinned entries first, then reverse-chronological (present, then latest)."""
    end = entry.get("end", "")
    end_rank = "9999-99" if end == "present" else end
    return (entry.get("pin", 0), end_rank, entry.get("start", ""))


def has_tag(tags, preset, length) -> bool:
    if not tags:
        return True
    if "all" in tags:
        return True
    if length == "full" and "full" in tags:
        return True
    return preset in tags


def pick_bullets(bullets, preset, length, budget):
    out = []
    for b in bullets:
        if not has_tag(b.get("tags"), preset, length):
            continue
        if b.get("priority", 1) > budget["max_priority"]:
            continue
        out.append(b)
    out.sort(key=lambda b: b.get("priority", 1))
    if length != "full":
        out = out[: budget["bullets"]]
    return [b["text"] for b in out]


def top_bullets(bullets, n):
    """Highest-priority bullets regardless of preset tags — used to top an
    entry up to the minimum when preset-tagged points fall short."""
    s = sorted(bullets, key=lambda b: b.get("priority", 1))
    return [b["text"] for b in s[:n]]


def pick_min(bullets, preset, length, budget, min_n):
    """Preset-relevant bullets, topped up to at least min_n (by priority,
    ignoring tags) when the tagged set is too small."""
    chosen = pick_bullets(bullets, preset, length, budget)
    if len(chosen) < min_n:
        for t in top_bullets(bullets, len(bullets)):
            if t not in chosen:
                chosen.append(t)
            if len(chosen) >= min_n:
                break
    return chosen


def build_data(master: dict, preset: str, length: str) -> dict:
    budget = BUDGET[length]
    p = master["presets"][preset]

    # Education
    education = []
    for e in sorted(master.get("education", []), key=sort_key, reverse=True):
        if not has_tag(e.get("tags"), preset, length):
            continue
        lines = [n["text"] for n in e.get("notes", []) if has_tag(n.get("tags"), preset, length)]
        education.append({
            "degree": e["degree"], "school": e["school"],
            "location": e.get("location", ""),
            "dates": date_range(e.get("start", ""), e.get("end", "")),
            "gpa": e.get("gpa", ""), "honors": e.get("honors", ""),
            "minors": e.get("minors", "") if length != "onepage" else "",
            "lines": lines,
        })

    # Experience
    experience = []
    for x in sorted(master.get("experience", []), key=sort_key, reverse=True):
        if not has_tag(x.get("tags"), preset, length):
            continue
        bullets = pick_min(x.get("bullets", []), preset, length, budget, 2)
        if len(bullets) < 2:
            continue  # every shown entry needs at least two points
        experience.append({
            "id": x.get("id", x["org"]),
            "title": x["title"], "org": x["org"],
            "location": "" if length == "onepage" else x.get("location", ""),
            "dates": date_range(x.get("start", ""), x.get("end", "")),
            "bullets": bullets,
        })
    experience = experience[: budget["experiences"]]

    # Projects
    projects = []
    for pr in master.get("projects", []):
        if not has_tag(pr.get("tags"), preset, length):
            continue
        bullets = pick_min(pr.get("bullets", []), preset, length, budget, 2)[:PROJECT_MAX_BULLETS]
        if len(bullets) < 2:
            continue  # every shown project needs at least two points
        projects.append({
            "name": pr["name"], "period": pr.get("period", ""),
            "tech": pr.get("tech", []) if length != "onepage" else [],
            "bullets": bullets,
        })
    projects = projects[: budget["projects"]]

    # Skills
    skills = []
    for g in master.get("skills", []):
        if not has_tag(g.get("tags"), preset, length):
            continue
        items = [i["name"] for i in g.get("items", []) if has_tag(i.get("tags"), preset, length)]
        if length == "onepage":
            items = items[:8]
        if items:
            skills.append({"group": g["group"], "items": items})
    if length == "onepage":
        skills = skills[:4]

    interests = ""
    intr = master.get("interests")
    if intr and has_tag(intr.get("tags"), preset, length):
        interests = intr["text"]

    return {
        "meta": master["meta"],
        "headline": p.get("headline", ""),
        "summary": p.get("summary", ""),
        "education": education,
        "experience": experience,
        "projects": projects,
        "skills": skills,
        "interests": interests,
    }


def page_count(pdf: Path) -> int:
    try:
        import fitz
        return fitz.open(pdf).page_count
    except Exception:
        return 1  # if fitz unavailable, skip auto-fit


def trim_once(data: dict) -> bool:
    """Shrink the resume by one step so the fit fills the page instead of
    overshooting. Never trims an entry below two points — it drops the whole
    entry first. Returns False when nothing else can go."""
    exp, proj, edu = data["experience"], data["projects"], data["education"]
    # 1. compact skills first (cheap, low signal)
    if len(data["skills"]) > 4:
        data["skills"].pop()
        return True
    # 2. shave a single bullet, but only down to a floor of two per entry
    for x in reversed(exp):
        if len(x["bullets"]) > 2:
            x["bullets"].pop()
            return True
    for pr in reversed(proj):
        if len(pr["bullets"]) > 2:
            pr["bullets"].pop()
            return True
    # 3. everything is at two points: drop whole trailing entries, keeping the
    #    resume balanced (favor keeping experiences, the core of a resume)
    if len(proj) > 1:
        proj.pop()
        return True
    if len(exp) > 2:
        exp.pop()
        return True
    if len(proj) > 0:
        proj.pop()
        return True
    # 4. last resort: shed education coursework lines (keep at least one)
    for e in reversed(edu):
        if len(e.get("lines", [])) > 1:
            e["lines"].pop()
            return True
    return False


def render(data: dict, template: str, out_pdf: Path):
    BUILD.mkdir(exist_ok=True)
    OUT.mkdir(exist_ok=True)
    data_path = BUILD / "data.json"
    data_path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    tpl = TEMPLATES / TEMPLATE_FILES[template]
    # Template reads the data from a fixed root-relative path (/build/data.json),
    # so the same templates compile identically here and in the browser.
    typst.compile(str(tpl), output=str(out_pdf), root=str(ROOT))


def render_fit(data: dict, template: str, out_pdf: Path, max_pages):
    """Fit to a page count in two passes: trim to fit (never below two points
    per entry), then grow bullets back to fill the remaining space. The result
    uses all available space with every shown entry keeping at least two points."""
    render(data, template, out_pdf)
    if not max_pages:
        return
    # remember the full candidate bullets so we can regrow after trimming
    pool_e = {x["id"]: list(x["bullets"]) for x in data["experience"]}
    pool_p = {p["name"]: list(p["bullets"]) for p in data["projects"]}
    caps_e, caps_p = 4, PROJECT_MAX_BULLETS

    # pass 1 — trim to fit
    for _ in range(80):
        if page_count(out_pdf) <= max_pages:
            break
        if not trim_once(data):
            break
        render(data, template, out_pdf)

    # pass 2 — grow to fill: add a trimmed bullet back wherever it still fits
    for _ in range(200):
        candidates = []
        for seq, pool, cap in ((data["experience"], pool_e, caps_e),
                               (data["projects"], pool_p, caps_p)):
            for it in seq:
                full = pool.get(it.get("id") or it.get("name"), [])
                if len(it["bullets"]) < min(cap, len(full)):
                    candidates.append((it, full))
        added = False
        for it, full in candidates:
            nxt = next((t for t in full if t not in it["bullets"]), None)
            if nxt is None:
                continue
            it["bullets"].append(nxt)
            render(data, template, out_pdf)
            if page_count(out_pdf) <= max_pages:
                added = True
                break
            it["bullets"].pop()  # doesn't fit here; try the next candidate
        if not added:
            break
    render(data, template, out_pdf)  # ensure the file matches final state


def build_one(master, preset, length, template):
    data = build_data(master, preset, length)
    out_pdf = OUT / f"resume-{preset}-{length}-{template}.pdf"
    render_fit(data, template, out_pdf, TARGET_PAGES[length])
    print(f"  built {out_pdf.name}  ({page_count(out_pdf)}p)")
    return out_pdf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preset", choices=PRESETS, default="sre")
    ap.add_argument("--length", choices=LENGTHS, default="onepage")
    ap.add_argument("--template", choices=list(TEMPLATE_FILES), default="designed")
    ap.add_argument("--all", action="store_true", help="build every combination")
    args = ap.parse_args()

    master = yaml.safe_load(MASTER.read_text())

    if args.all:
        for preset in PRESETS:
            for length in LENGTHS:
                for template in TEMPLATE_FILES:
                    build_one(master, preset, length, template)
    else:
        build_one(master, args.preset, args.length, args.template)


if __name__ == "__main__":
    main()
