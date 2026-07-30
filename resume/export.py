#!/usr/bin/env python3
"""
Export step for the website. Run from `resume/`:

    python export.py     (or: npm run resumes)

Produces (Typst only — no PDFs are committed; the browser compiles them):
  ../lib/resume-data.json           full master (About page + /resume UI)
  ../public/manifest.json           index of variants + page counts
  ../public/resumes/data/*.json     final (fitted) render data per variant
  ../public/resumes/typ/*.typ       self-contained Typst per variant (compile/download)
  ../public/typst/*                 templates + icons for in-browser compile

PDFs are rendered only as throwaway intermediates so the fitter can count pages;
they are written to resume/build/ (gitignored) and never shipped. The browser
compiles the real PDF on demand with typst.ts.
"""
from __future__ import annotations
import json, shutil
from pathlib import Path
import yaml
import build  # reuse the filtering + rendering pipeline

ROOT = Path(__file__).resolve().parent
SITE = ROOT.parent
LIB_JSON = SITE / "lib" / "resume-data.json"
PUBLIC = SITE / "public"
RESUMES = PUBLIC / "resumes"
DATADIR = RESUMES / "data"
TYPST = PUBLIC / "typst"
TMP = ROOT / "build"  # gitignored scratch for fit rendering


def export_data(master: dict):
    LIB_JSON.parent.mkdir(parents=True, exist_ok=True)
    LIB_JSON.write_text(json.dumps(master, ensure_ascii=False, indent=2))
    print(f"wrote {LIB_JSON.relative_to(SITE)}")


def export_typst_assets():
    # templates + icons the browser fetches, mirrored into the virtual FS at
    # /templates/... so the hardcoded image paths resolve identically.
    if TYPST.exists():
        shutil.rmtree(TYPST)
    (TYPST / "icons").mkdir(parents=True)
    for f in (ROOT / "templates").glob("*.typ"):
        shutil.copy(f, TYPST / f.name)
    for f in (ROOT / "templates" / "icons").glob("*.svg"):
        shutil.copy(f, TYPST / "icons" / f.name)
    print(f"wrote {TYPST.relative_to(SITE)} (templates + icons)")


TYPDIR = RESUMES / "typ"


def standalone_typ(template_src: str, data_json: str, gh_svg: str, li_svg: str) -> str:
    """A single self-contained .typ that compiles with `typst compile <file>`:
    the render data and (for the designed template) the icons are inlined, so
    there are no external file dependencies."""
    body = template_src.replace('#let data = json("/build/data.json")\n', "")
    pre = [
        "// Self-contained resume generated from resume.yml.",
        "// Compile:  typst compile thisfile.typ",
        "#let __data = ```",
        data_json,
        "```",
        "#let data = json(bytes(__data.text))",
    ]
    if "/templates/icons/github.svg" in template_src:
        pre += ["#let __ghsvg = ```", gh_svg.strip(), "```",
                "#let __lisvg = ```", li_svg.strip(), "```"]
        body = body.replace(
            '#let __gh = image("/templates/icons/github.svg", height: 8.5pt)',
            '#let __gh = image(bytes(__ghsvg.text), format: "svg", height: 8.5pt)')
        body = body.replace(
            '#let __li = image("/templates/icons/linkedin.svg", height: 8.5pt)',
            '#let __li = image(bytes(__lisvg.text), format: "svg", height: 8.5pt)')
    return "\n".join(pre) + "\n" + body


def prebuild(master: dict):
    for d in (DATADIR, TYPDIR):
        d.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)
    # clear any previously generated outputs, including stale committed PDFs
    for f in list(DATADIR.glob("*.json")) + list(TYPDIR.glob("*.typ")) + list(RESUMES.glob("*.pdf")):
        f.unlink()

    tpl_src = {t: (ROOT / "templates" / build.TEMPLATE_FILES[t]).read_text()
               for t in build.TEMPLATE_FILES}
    gh_svg = (ROOT / "templates" / "icons" / "github.svg").read_text()
    li_svg = (ROOT / "templates" / "icons" / "linkedin.svg").read_text()

    manifest = {"presets": {}, "lengths": build.LENGTHS,
                "templates": list(build.TEMPLATE_FILES),
                "default": "sre-onepage-designed", "files": {}}
    for pid, p in master["presets"].items():
        manifest["presets"][pid] = {"label": p.get("label", pid),
                                    "headline": p.get("headline", "")}

    for preset in build.PRESETS:
        for length in build.LENGTHS:
            for template in build.TEMPLATE_FILES:
                data = build.build_data(master, preset, length)
                # render to a throwaway PDF purely so the fitter can count pages
                tmp_pdf = TMP / "fit.pdf"
                build.render_fit(data, template, tmp_pdf, build.TARGET_PAGES[length])
                key = f"{preset}-{length}-{template}"
                data_json = json.dumps(data, ensure_ascii=False)
                (DATADIR / f"{key}.json").write_text(data_json)
                (TYPDIR / f"{key}.typ").write_text(
                    standalone_typ(tpl_src[template], data_json, gh_svg, li_svg))
                manifest["files"][key] = {
                    "data": f"/resumes/data/{key}.json",
                    "typ": f"/resumes/typ/{key}.typ",
                    "template": template,
                    "pages": build.page_count(tmp_pdf),
                }
    (PUBLIC / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"wrote {len(manifest['files'])} variants (data + typ, no PDFs) into {RESUMES.relative_to(SITE)}")
    check_lengths(manifest)


# Desired page count per length. onepage/twopage are exact; full is open-ended.
DESIRED = {"onepage": 1, "twopage": 2}


def check_lengths(manifest: dict):
    """Verify every generated variant is the intended length. onepage must be
    exactly 1 page and twopage exactly 2; anything off is flagged loudly so a
    content edit can't silently produce a wrong-length resume."""
    problems = []
    for key, info in manifest["files"].items():
        length = key.split("-")[1]
        want = DESIRED.get(length)
        if want is not None and info["pages"] != want:
            kind = "OVER" if info["pages"] > want else "UNDER"
            problems.append(f"  {kind}: {key} is {info['pages']}p, want {want}p")
    if problems:
        print(f"WARNING: {len(problems)} variant(s) are not the desired length:")
        print("\n".join(problems))
    else:
        print("length check: all onepage=1 and twopage=2 as intended.")


def main():
    master = yaml.safe_load((ROOT / "resume.yml").read_text())
    export_data(master)
    export_typst_assets()
    prebuild(master)


if __name__ == "__main__":
    main()
