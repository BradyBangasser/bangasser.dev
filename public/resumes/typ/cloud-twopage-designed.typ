// Self-contained resume generated from resume.yml.
// Compile:  typst compile thisfile.typ
#let __data = ```
{"meta": {"name": "Brady Bangasser", "location": "Saint Paul, MN", "email": "brady@bangasser.dev", "phone": "(651) 769-5301", "links": {"website": "www.bangasser.dev", "github": "github.com/BradyBangasser", "github_handle": "BradyBangasser", "linkedin": "linkedin.com/in/bbangasser", "linkedin_handle": "bbangasser"}}, "headline": "Cloud & Security Engineer", "summary": "Cloud engineer with security focus. Builds reproducible multi-cloud and on-prem infrastructure, enforces least-privilege access, and hardens environments to NIST and platform baselines.", "education": [{"degree": "M.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2025 – May 2027", "gpa": "4.00", "honors": "", "minors": "", "lines": ["Concurrent B.S./M.S. program", "Coursework: Advanced Topics in High Performance Computing, Distributed Systems and Middleware, Data Security in Machine Learning, Network Design and Security"]}, {"degree": "B.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2024 – Dec 2026", "gpa": "3.79", "honors": "Dean's List", "minors": "Minors in Cybersecurity and Data Science", "lines": ["Coursework: Compiler Design and Development, AI and Machine Learning in High Performance Computing, Network Architecture and Security, Theory of Computing, Software Design Practices"]}], "experience": [{"id": "isu-sysadmin", "title": "System Administrator", "org": "Iowa State University", "location": "Ames, IA", "dates": "Apr 2025 – Present", "bullets": ["Operate and maintain a production HPC cluster with SLURM, Kubernetes, Active Directory, Ansible, Prometheus, and Apptainer, keeping it secure and available for a large user base.", "Built diagnostic and monitoring workflows that isolate hardware degradation, network bottlenecks, and software-stack faults before they take nodes offline."]}, {"id": "deere-cloudsec", "title": "Cloud Security Engineer", "org": "John Deere", "location": "Johnston, IA", "dates": "May 2025 – Aug 2025", "bullets": ["Built and deployed tooling that verified 100,000+ AWS and Azure resources against company policy, NIST standards, and platform best practices.", "Designed and managed least-privilege IAM policies in AWS to tighten cloud access control.", "Wrote automated remediation for common misconfigurations flagged across the cloud estate.", "Led a migration of IAM, security, and dev-management tooling from Python to Go, a ~10x performance gain that cut AWS Lambda runtime costs by roughly the same factor.", "Deployed high-throughput Go services on AWS EKS to run compliance checks across the cloud estate."]}], "projects": [{"name": "Erid — Unified Cloud Images", "period": "2026", "tech": ["Terraform", "Packer", "AWS", "GCP", "Azure", "Oracle", "Hetzner", "qcow2", "Linux"], "bullets": ["One Packer + Terraform pipeline that builds identical, reproducible qcow2 golden images across every major cloud (AWS, GCP, Azure, Oracle, Hetzner) and on-prem, applying the same hardening everywhere to eliminate drift.", "Standardized a hardening baseline applied identically to every target image, so security posture no longer varies by platform.", "Produces multiple image variants for different node roles, plus matching container images, all from the same definition."]}, {"name": "Computer Vision Parking Enforcement Radar", "period": "2025–2026", "tech": ["Python", "Redis Streams", "PostgreSQL", "REST"], "bullets": ["Stored and queried detected-vehicle geolocation in PostgreSQL for fast spatial lookups.", "Architected a Redis Streams pipeline for low-latency, high-throughput image and detection routing from a REST API to processing servers, backed by PostgreSQL geospatial storage."]}, {"name": "Public Data Scraping and Processing", "period": "2025", "tech": ["C++", "C", "Python", "Lua", "Rust", "MySQL", "Docker", "PyTorch", "Terraform", "Kubernetes"], "bullets": ["Built a parallel, scalable pipeline to scrape, clean, and store public datasets, deployed via a Terraform CI/CD pipeline to AWS and a personal Kubernetes cluster.", "Wrote a compiler-like tool that pairs lexical analysis with an LLM to standardize and validate data formats, and trained an ML model to flag anomalies in the collected data."]}, {"name": "Secure Backend Architecture & Authentication", "period": "2025–2026", "tech": ["Go", "MySQL", "JWT"], "bullets": ["Built a secure backend with user authentication and JWT sessions over a fully encrypted MySQL database, exposing scalable, high-throughput API routes.", "Exposed scalable, high-throughput API routes with authentication enforced on every endpoint.", "Modeled and secured relational data in an encrypted MySQL schema with integrity constraints."]}], "skills": [{"group": "Languages", "items": ["C", "C++", "Python", "Go", "Rust", "Bash", "SQL"]}, {"group": "Infrastructure & Platform", "items": ["Kubernetes", "Docker", "Terraform", "Packer", "Ansible", "Linux/Unix", "Git", "CI/CD", "Artifactory"]}, {"group": "Cloud", "items": ["AWS", "Azure", "Google Cloud", "AWS EKS", "IAM"]}, {"group": "Data & Backends", "items": ["MySQL"]}, {"group": "Security", "items": ["NIST standards", "Least-privilege IAM", "AES / RSA / ECDH", "JWT / auth"]}], "interests": ""}
```
#let data = json(bytes(__data.text))
#let __ghsvg = ```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
<path fill="#565f6a" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
</svg>
```
#let __lisvg = ```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
<path fill="#565f6a" d="M13.63 0H2.37A2.36 2.36 0 0 0 0 2.34v11.32A2.36 2.36 0 0 0 2.37 16h11.26A2.37 2.37 0 0 0 16 13.66V2.34A2.37 2.37 0 0 0 13.63 0zM4.9 13.12H2.94V6.83H4.9v6.29zM3.92 5.97a1.14 1.14 0 1 1 0-2.28 1.14 1.14 0 0 1 0 2.28zm9.2 7.15h-1.96V9.9c0-.73-.01-1.67-1.02-1.67-1.02 0-1.18.8-1.18 1.62v3.27H7.01V6.83h1.88v.86h.03c.26-.5.9-1.02 1.85-1.02 1.98 0 2.35 1.3 2.35 3v3.45z"/>
</svg>
```
// Designed template (human-facing). Centered header, one muted accent used only
// for the name/section headers/dividers/icons, and a consistent vertical rhythm
// based on resume-design research:
//   name 20pt · section headers 12pt · body 10.5pt
//   12pt above a section header, 6pt below its rule
//   10pt between entries · ~3.5pt between bullets · ~1.13 line spacing
// Bullets never break across a page. Data comes from a fixed path so the same
// template compiles identically locally and in the browser.
#let m = data.meta

#let ink    = rgb("#15181c")   // near-black body
#let accent = rgb("#1f4e79")   // one muted professional blue
#let sub    = rgb("#565f6a")   // muted meta (dates, org, contact)
#let rulec  = rgb("#c3cbd6")   // hairline dividers (neutral)

#set document(title: m.name + " Resume", author: m.name)
#set page(paper: "us-letter", margin: (x: 0.65in, top: 0.5in, bottom: 0.5in))
#set text(font: "Libertinus Serif", size: 10.5pt, fill: ink)
#set par(leading: 0.55em, justify: false)   // ~1.13 line spacing

// ---- rhythm ---------------------------------------------------------------
#let SEC_ABOVE = 12pt
#let SEC_BELOW = 6pt
#let ENTRY_GAP = 10pt
#let BULLET_ABOVE = 3.5pt

#let point(it) = block(breakable: false, above: BULLET_ABOVE, below: 0pt)[
  #grid(columns: (0.85em, 1fr), column-gutter: 4pt, text(fill: sub)[•], [#it])
]
// header + first bullet stay together; each remaining bullet stays whole
#let entry(head, items) = {
  if items.len() == 0 { block(breakable: false, head) }
  else {
    block(breakable: false, { head; point(items.first()) })
    for it in items.slice(1) { point(it) }
  }
}
#let colhead(l_top, l_bot, r_top, r_bot) = grid(
  columns: (1fr, auto), column-gutter: 10pt, align: (left, right), row-gutter: 1.5pt,
  {
    text(weight: 700, size: 10.5pt)[#l_top]
    if l_bot != "" { linebreak(); text(size: 10pt, fill: sub)[#l_bot] }
  },
  {
    if r_top != "" { text(size: 9.5pt, fill: sub)[#r_top]; linebreak() }
    if r_bot != "" { text(size: 9.5pt, fill: sub, style: "italic")[#r_bot] }
  },
)
#let section(title) = {
  v(SEC_ABOVE)
  text(size: 12pt, weight: 700, fill: accent, tracking: 0.6pt)[#upper(title)]
  v(2pt)
  line(length: 100%, stroke: 0.7pt + accent)
  v(SEC_BELOW)
}
#let iconlink(icon, label) = box(baseline: 0pt)[
  #box(icon, baseline: 1.6pt)#h(2.5pt)#label
]
// Icon images (kept as named vars so the downloadable .typ can inline them).
#let __gh = image(bytes(__ghsvg.text), format: "svg", height: 8.5pt)
#let __li = image(bytes(__lisvg.text), format: "svg", height: 8.5pt)

// ---- centered header -------------------------------------------------------
#align(center)[
  #text(size: 20pt, weight: 700)[#m.name]
  #v(3pt)
  #{
    set text(size: 8.7pt, fill: sub)
    let sep = [#h(5pt)#text(fill: rulec)[|]#h(5pt)]
    let items = ()
    if m.email != "" { items.push([#m.email]) }
    if m.phone != "" { items.push([#m.phone]) }
    if m.links.website != "" { items.push([#m.links.website]) }
    let gh = m.links.at("github_handle", default: "")
    if gh != "" { items.push(iconlink(__gh, gh)) }
    let li = m.links.at("linkedin_handle", default: "")
    if li != "" { items.push(iconlink(__li, li)) }
    if m.location != "" { items.push([#m.location]) }
    items.join(sep)
  }
]
#v(5pt)
#line(length: 100%, stroke: 0.7pt + accent)
#if data.summary != "" [
  #v(5pt)
  #align(center, text(size: 9.7pt, fill: sub)[#data.summary])
]

// ---- experience ------------------------------------------------------------
#if data.experience.len() > 0 {
  section("Experience")
  for (i, x) in data.experience.enumerate() {
    if i > 0 { v(ENTRY_GAP) }
    entry(colhead(x.org, x.title, x.location, x.dates), x.bullets)
  }
}
// ---- projects --------------------------------------------------------------
#if data.projects.len() > 0 {
  section("Projects")
  for (i, p) in data.projects.enumerate() {
    if i > 0 { v(ENTRY_GAP) }
    entry(colhead(p.name, "", "", p.period), p.bullets)
    if p.tech.len() > 0 {
      block(breakable: false, above: 3pt)[
        #text(size: 8.7pt, fill: sub)[#emph[Tech:] #p.tech.join(", ")]
      ]
    }
  }
}
// ---- education -------------------------------------------------------------
#if data.education.len() > 0 {
  section("Education")
  for (i, e) in data.education.enumerate() {
    if i > 0 { v(ENTRY_GAP - 2pt) }
    let sb = ()
    if e.gpa != "" { sb.push("GPA: " + e.gpa) }
    if e.honors != "" { sb.push(e.honors) }
    if e.minors != "" { sb.push(e.minors) }
    entry(
      colhead(e.school,
        e.degree + (if sb.len() > 0 { "   \u{b7}   " + sb.join("  \u{b7}  ") } else { "" }),
        e.location, e.dates),
      e.lines,
    )
  }
}
// ---- skills ----------------------------------------------------------------
#if data.skills.len() > 0 {
  section("Technical Skills")
  for (i, g) in data.skills.enumerate() {
    block(breakable: false, above: if i > 0 { 3pt } else { 0pt })[
      #grid(columns: (auto, 1fr), column-gutter: 6pt,
        text(weight: 700, size: 9.7pt)[#g.group:],
        text(size: 9.7pt)[#g.items.join(", ")])
    ]
  }
}
// ---- interests -------------------------------------------------------------
#if data.interests != "" {
  section("Interests")
  text(size: 9.7pt)[#data.interests]
}
