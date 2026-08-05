#!/usr/bin/env python3
# ---------------------------------------------------------------------------
# Build-time project discovery. Runs before `npm run dev` / `npm run build`.
#
# Design: the GitHub API is used ONLY to list repos (the one thing that
# genuinely requires it). Every per-repo file is pulled from
# raw.githubusercontent.com, which is NOT rate-limited. All account repos are
# expected to carry the files they need, so we fetch optimistically rather than
# probing the API to check what exists.
#
# Output: content/projects/_generated.json (gitignored, never committed).
# Auth: set GITHUB_TOKEN to raise the list-call rate limit; without it the
# handful of list calls still fit comfortably in the unauthenticated budget.
# ---------------------------------------------------------------------------
import json, os, re, sys, time, urllib.request, urllib.error

USERNAME = os.environ.get("GITHUB_USERNAME", "BradyBangasser")
TOKEN = os.environ.get("GITHUB_TOKEN")
SITE_REPO = os.environ.get("GITHUB_SITE_REPO", f"{USERNAME}/bangasser.dev")
OUT_FILE = os.path.join("content", "projects", "_generated.json")
ACTIVE_DAYS = 60
OPT_OUT_FILE = ".nosite"


def api_get(url, tries=6):
    """GitHub API GET. Only used to enumerate repos. Waits out rate limits."""
    headers = {"Accept": "application/vnd.github+json",
               "X-GitHub-Api-Version": "2022-11-28",
               "User-Agent": "bangasser.dev-build"}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    for _ in range(tries):
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                reset = int(e.headers.get("x-ratelimit-reset", "0")) * 1000
                retry = int(e.headers.get("retry-after", "0"))
                wait = retry if retry > 0 else max(1, int(reset / 1000 - time.time()) + 1)
                print(f"[fetch-github] rate-limited; waiting {wait}s", file=sys.stderr)
                time.sleep(min(wait, 3600))
                continue
            if e.code == 404:
                return None
            raise
    raise RuntimeError(f"gave up on {url}")


def raw_get(owner, repo, branch, path):
    """raw.githubusercontent.com fetch (no API rate limit). None on 404."""
    url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
    try:
        with urllib.request.urlopen(url) as r:
            return r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError:
        return None
    except Exception:
        return None


def raw_exists(owner, repo, branch, path):
    return raw_get(owner, repo, branch, path) is not None


def _doc_title(content, rel):
    for line in content.splitlines():
        t = line.strip()
        if t.startswith("# "):
            return t[2:].strip()
    base = rel.rsplit("/", 1)[-1].rsplit(".", 1)[0]
    if base.lower() in ("readme", "index"):
        parent = rel.rsplit("/", 2)[-2] if "/" in rel else ""
        return parent.replace("-", " ").replace("_", " ").title() if parent else "Overview"
    return base.replace("-", " ").replace("_", " ").title()


def fetch_docs_tree(owner, name, branch):
    """Full docs/ tree (nested .md) via the git trees API, content over raw."""
    tree = api_get(f"https://api.github.com/repos/{owner}/{name}/git/trees/{branch}?recursive=1")
    if not tree or "tree" not in tree:
        return []
    out = []
    for node in tree["tree"]:
        path = node.get("path", "")
        if node.get("type") != "blob":
            continue
        if not path.startswith("docs/") or not path.lower().endswith(".md"):
            continue
        content = raw_get(owner, name, branch, path)
        if content is None:
            continue
        content = absolutize_readme(content, owner, name, branch)
        rel = path[len("docs/"):]
        out.append({"path": rel, "title": _doc_title(content, rel), "content": content})
    # index/readme first within a folder, then alphabetical; shallower dirs first
    def key(d):
        parts = d["path"].split("/")
        base = parts[-1].lower()
        return (len(parts), "/".join(parts[:-1]), 0 if base in ("readme.md", "index.md") else 1, base)
    out.sort(key=key)
    return out


def slugify(name):
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", name.lower()))


def parse_frontmatter(text):
    """Minimal `---` YAML frontmatter parser (title/date/summary/tags)."""
    meta, body = {}, text
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", text, re.S)
    if m:
        body = m.group(2)
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                v = v.strip().strip('"\'')
                if k.strip() == "tags":
                    meta["tags"] = [t.strip() for t in re.sub(r"[\[\]]", "", v).split(",") if t.strip()]
                else:
                    meta[k.strip()] = v
    return meta, body


def absolutize_readme(md, owner, repo, branch):
    raw_base = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/"
    blob_base = f"https://github.com/{owner}/{repo}/blob/{branch}/"
    is_abs = lambda u: re.match(r"^(https?:|mailto:|#|//)", u.strip()) is not None
    norm = lambda u: re.sub(r"^\.?/", "", u)
    md = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)",
                lambda m: m.group(0) if is_abs(m.group(2)) else f"![{m.group(1)}]({raw_base}{norm(m.group(2))})", md)
    md = re.sub(r"(?<!!)\[([^\]]+)\]\(([^)]+)\)",
                lambda m: m.group(0) if is_abs(m.group(2)) else f"[{m.group(1)}]({blob_base}{norm(m.group(2))})", md)
    md = re.sub(r'\ssrc=["\']([^"\']+)["\']',
                lambda m: m.group(0) if is_abs(m.group(1)) else f' src="{raw_base}{norm(m.group(1))}"', md)
    return md


def list_account_repos():
    repos = []
    for page in range(1, 11):
        batch = api_get(f"https://api.github.com/users/{USERNAME}/repos?per_page=100&sort=pushed&page={page}")
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
    return repos


def load_include_repos():
    owner, repo = SITE_REPO.split("/")
    for branch in ("main", "master"):
        txt = raw_get(owner, repo, branch, ".include_repo.txt")
        if txt is not None:
            return [l.strip() for l in txt.splitlines()
                    if l.strip() and not l.startswith("#") and "/" in l]
    return []


def pushed_from_repo(r):
    return r.get("pushed_at") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def build_project(r):
    owner = (r.get("owner") or {}).get("login") or r["full_name"].split("/")[0]
    name = r["name"]
    branch = r.get("default_branch") or "main"

    if raw_exists(owner, name, branch, OPT_OUT_FILE):
        return None  # explicit opt-out
    readme = raw_get(owner, name, branch, "README.md") or raw_get(owner, name, branch, "readme.md")
    if readme is None:
        return None  # a project needs an overview
    readme = absolutize_readme(readme, owner, name, branch)

    related_txt = raw_get(owner, name, branch, ".related.txt")
    related = ([l.strip() for l in related_txt.splitlines()
                if l.strip() and not l.startswith("#")] if related_txt else [])
    resume_yml = raw_get(owner, name, branch, ".resume.yml")
    has_resume = resume_yml is not None

    # docs/: pull the full nested tree; rendered as a ReadTheDocs-style docs site
    has_index = raw_exists(owner, name, branch, "docs/README.md") or raw_exists(owner, name, branch, "docs/index.md")
    docs = fetch_docs_tree(owner, name, branch) if has_index else []
    has_docs = len(docs) > 0
    docs_url = f"https://github.com/{owner}/{name}/tree/{branch}/docs" if has_docs else None

    # blog/: posts are listed in blog/index.txt (one .md filename per line), so
    # ingestion stays raw-only (no directory-listing API call).
    posts = []
    index = raw_get(owner, name, branch, "blog/index.txt")
    if index:
        for fn in [l.strip() for l in index.splitlines() if l.strip() and not l.startswith("#")]:
            body = raw_get(owner, name, branch, f"blog/{fn}")
            if body is None:
                continue
            meta, md = parse_frontmatter(body)
            pslug = slugify(re.sub(r"\.md$", "", fn))
            posts.append({
                "slug": pslug,
                "title": meta.get("title") or pslug.replace("-", " ").title(),
                "date": meta.get("date") or pushed_from_repo(r),
                "summary": meta.get("summary", ""),
                "tags": meta.get("tags", []),
                "content": absolutize_readme(md, owner, name, branch),
            })
    has_blog = len(posts) > 0

    pushed = r.get("pushed_at") or ""
    active = False
    if pushed:
        try:
            t = time.strptime(pushed, "%Y-%m-%dT%H:%M:%SZ")
            active = (time.time() - time.mktime(t)) / 86400 <= ACTIVE_DAYS
        except ValueError:
            pass
    return {
        "slug": slugify(name), "name": name, "fullName": r["full_name"],
        "description": r.get("description"), "url": r.get("html_url"),
        "homepage": r.get("homepage"), "language": r.get("language"),
        "stars": r.get("stargazers_count", 0), "openIssues": r.get("open_issues_count", 0),
        "topics": r.get("topics", []), "pushedAt": pushed, "active": active,
        "defaultBranch": branch,
        "hasResumeYml": has_resume, "resumeYml": resume_yml,
        "related": related, "readme": readme,
        "hasDocs": has_docs, "docs": docs, "docsUrl": docs_url,
        "hasBlog": has_blog, "posts": posts,
        "external": owner.lower() != USERNAME.lower(),
    }


def main():
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    try:
        account = [r for r in list_account_repos()
                   if not r.get("private") and not r.get("fork") and not r.get("archived")]
        extra = []
        for fn in load_include_repos():
            r = api_get(f"https://api.github.com/repos/{fn}")
            if r and not r.get("private"):
                extra.append(r)

        by_slug = {}
        for r in account + extra:
            p = build_project(r)
            if not p:
                continue
            if p["slug"] in by_slug:
                print(f"[fetch-github] duplicate slug \"{p['slug']}\" — "
                      f"{by_slug[p['slug']]['fullName']} overwritten by {p['fullName']}", file=sys.stderr)
            by_slug[p["slug"]] = p

        projects = sorted(by_slug.values(), key=lambda p: p["pushedAt"], reverse=True)
        with open(OUT_FILE, "w") as f:
            json.dump({"fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                       "username": USERNAME, "projects": projects}, f, indent=2)
        print(f"[fetch-github] wrote {len(projects)} projects "
              f"({sum(1 for p in projects if p['active'])} active)")
    except Exception as e:  # never fail the build on a fetch hiccup
        print(f"[fetch-github] error: {e}", file=sys.stderr)
        if not os.path.exists(OUT_FILE):
            with open(OUT_FILE, "w") as f:
                json.dump({"fetchedAt": None, "username": USERNAME, "projects": []}, f, indent=2)


if __name__ == "__main__":
    main()
