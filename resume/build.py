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

PRESETS = ["sre", "cloud", "hpc", "compilers", "software"]
LENGTHS = ["onepage", "twopage", "full"]
TEMPLATE_FILES = {"designed": "resume.typ", "ats": "resume-ats.typ"}

# How many items / bullets survive at each length. `full` = no caps.
BUDGET = {
    "onepage": {"experiences": 6, "projects": 6, "bullets": 4, "max_priority": 3},
    "twopage": {"experiences": 9, "projects": 9, "bullets": 5, "max_priority": 4},
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
    """Reverse-chronological: present first, then latest start."""
    end = entry.get("end", "")
    end_rank = "9999-99" if end == "present" else end
    return (end_rank, entry.get("start", ""))


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
        bullets = pick_bullets(x.get("bullets", []), preset, length, budget)
        if not bullets:
            continue
        experience.append({
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
        bullets = pick_bullets(pr.get("bullets", []), preset, length, budget)
        bullets = bullets[:PROJECT_MAX_BULLETS]
        if len(bullets) < 1:
            continue
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
    """Remove the least-important remaining item. Projects are kept at >= 2
    bullets (dropped whole rather than trimmed below that). Returns False if
    nothing further can be trimmed."""
    if len(data["skills"]) > 4:
        data["skills"].pop()
        return True
    # trim trailing experience bullets down to a floor of 2
    for x in reversed(data["experience"]):
        if len(x["bullets"]) > 2:
            x["bullets"].pop()
            return True
    # then drop whole trailing projects (keeps shown projects at 2-3 bullets)
    if len(data["projects"]) > 1:
        data["projects"].pop()
        return True
    # then experience bullets down to a floor of 1
    for x in reversed(data["experience"]):
        if len(x["bullets"]) > 1:
            x["bullets"].pop()
            return True
    if len(data["projects"]) > 0:
        data["projects"].pop()
        return True
    if len(data["experience"]) > 2:
        data["experience"].pop()
        return True
    return False


def render(data: dict, template: str, out_pdf: Path):
    BUILD.mkdir(exist_ok=True)
    OUT.mkdir(exist_ok=True)
    data_path = BUILD / "data.json"
    data_path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    tpl = TEMPLATES / TEMPLATE_FILES[template]
    # Typst uses a virtual filesystem rooted at ROOT; templates read the data
    # via a root-relative path (leading slash), not an absolute OS path.
    typst.compile(str(tpl), output=str(out_pdf), root=str(ROOT),
                  sys_inputs={"data": "/build/data.json"})


def render_fit(data: dict, template: str, out_pdf: Path, max_pages):
    """Render, then trim until it fits within max_pages. Starting from a
    generous budget and trimming to the boundary fills the page."""
    render(data, template, out_pdf)
    if not max_pages:
        return
    for _ in range(60):
        if page_count(out_pdf) <= max_pages:
            break
        if not trim_once(data):
            break
        render(data, template, out_pdf)


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
