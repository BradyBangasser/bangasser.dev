// Self-contained resume generated from resume.yml.
// Compile:  typst compile thisfile.typ
#let __data = ```
{"meta": {"name": "Brady Bangasser", "location": "Saint Paul, MN", "email": "brady@bangasser.dev", "phone": "(651) 769-5301", "links": {"website": "www.bangasser.dev", "github": "github.com/BradyBangasser", "github_handle": "BradyBangasser", "linkedin": "linkedin.com/in/bbangasser", "linkedin_handle": "bbangasser"}}, "headline": "Software Engineer", "summary": "Software engineer across the stack, from low-latency Go and Rust services and secure backends to the infrastructure and CI that ship them.", "education": [{"degree": "M.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2025 – May 2027", "gpa": "4.00", "honors": "", "minors": "", "lines": ["Concurrent B.S./M.S. program"]}, {"degree": "B.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2024 – Dec 2026", "gpa": "3.79", "honors": "Dean's List", "minors": "", "lines": ["Coursework: Compiler Design and Development, AI and Machine Learning in High Performance Computing, Network Architecture and Security, Theory of Computing, Software Design Practices"]}], "experience": [{"id": "isu-sysadmin", "title": "System Administrator", "org": "Iowa State University", "location": "", "dates": "Apr 2025 – Present", "bullets": ["Built a TUI stress-testing tool in C that dynamically schedules HPL (LINPACK) jobs and watches live metrics to keep runs inside safe thermal and power limits, protecting node health while pushing for peak results.", "Implemented ResMemPerGPU in a customized SLURM scheduler (C) to stop CPU jobs from consuming all memory on GPU nodes, protecting GPU workloads, with Makefile-driven builds and validation."]}, {"id": "cardinal-space-mining", "title": "Head of Networking", "org": "Cardinal Space Mining", "location": "", "dates": "Aug 2024 – Present", "bullets": ["Collected multiple camera streams and relayed them to a third-party platform for live judging.", "Designed, built, and tested the internal network for a competition mining robot, ensuring redundant control and telemetry throughout each arena run."]}, {"id": "ibm-phyp", "title": "Firmware Engineer Intern", "org": "IBM", "location": "", "dates": "May 2026 – Aug 2026", "bullets": ["Re-engineered PHYP firmware and software build pipelines (Jenkins, Groovy, Python, Perl, Bash), improving build time 17% through smart Git prefetching and de-duplicated fetches.", "Extended a custom build harness with AI failure analysis: it parses build logs, calls an IBM internal model to root-cause failures, and emits a report with next steps, rerun-safety, and escalation contacts.", "Built Markdown and PDF build-failure report generation and richer build observability into the pipeline tooling.", "Shipped the pipeline to 3 teams and designed it to be extendible across the entire PHYP development department."]}], "projects": [{"name": "Omni HTTP Router", "period": "2025–2026", "tech": [], "bullets": ["Built a Rust HTTP router that resolves middleware at compile time into fully static stacks, routing a request in under 30 instructions on SIMD-enabled x86.", "Supports gRPC and REST out of the box."]}], "skills": [{"group": "Languages", "items": ["C", "C++", "Python", "Go", "Rust", "Bash", "TypeScript", "Java"]}, {"group": "Infrastructure & Platform", "items": ["Docker", "Linux/Unix", "Git", "CI/CD", "Jenkins", "Artifactory"]}, {"group": "Data & Backends", "items": ["MySQL", "PostgreSQL", "Redis"]}, {"group": "Security", "items": ["AES / RSA / ECDH", "JWT / auth"]}], "interests": ""}
```
#let data = json(bytes(__data.text))
// ATS template (machine-facing). Plain black, single column, standard headings,
// same researched spacing rhythm as the designed one but no color and no icons,
// so parsers have the cleanest possible signal. Bullets never split a page.
#let m = data.meta

#let ink  = rgb("#000000")
#let sub  = rgb("#333333")
#let rulec = rgb("#000000")

#set document(title: m.name + " Resume", author: m.name)
#set page(paper: "us-letter", margin: (x: 0.7in, top: 0.55in, bottom: 0.55in))
#set text(font: "Libertinus Serif", size: 10.5pt, fill: ink)
#set par(leading: 0.55em, justify: false)

#let SEC_ABOVE = 12pt
#let SEC_BELOW = 6pt
#let ENTRY_GAP = 10pt
#let BULLET_ABOVE = 3.5pt

#let point(it) = block(breakable: false, above: BULLET_ABOVE, below: 0pt)[
  #grid(columns: (0.85em, 1fr), column-gutter: 4pt, [•], [#it])
]
#let entry(head, items) = {
  if items.len() == 0 { block(breakable: false, head) }
  else {
    block(breakable: false, { head; point(items.first()) })
    for it in items.slice(1) { point(it) }
  }
}
#let headrow(lead, trail) = grid(
  columns: (1fr, auto), column-gutter: 8pt, align: (left, right),
  lead, text(size: 9.5pt, fill: sub)[#trail],
)
#let section(title, body) = {
  v(SEC_ABOVE)
  text(size: 12pt, weight: 700, tracking: 0.5pt)[#upper(title)]
  v(2pt); line(length: 100%, stroke: 0.7pt + rulec); v(SEC_BELOW)
  body
}

// header — centered, plain
#align(center)[
  #text(size: 20pt, weight: 700)[#m.name]
  #linebreak()
  #let c = (m.email, m.phone, m.links.website, m.links.github, m.links.linkedin, m.location).filter(x => x != none and x != "")
  #v(3pt)
  #text(size: 9pt, fill: sub)[#c.join("   |   ")]
]
#v(4pt)
#if data.summary != "" [ #text(size: 10pt)[#data.summary] ]

#if data.experience.len() > 0 {
  section("Experience", {
    for (i, x) in data.experience.enumerate() {
      if i > 0 { v(ENTRY_GAP) }
      entry({
        headrow(text(weight: 700, size: 10.5pt)[#x.title, #x.org], x.dates)
        if x.location != "" { v(1pt); text(size: 9.5pt, fill: sub)[#x.location] }
      }, x.bullets)
    }
  })
}
#if data.projects.len() > 0 {
  section("Projects", {
    for (i, p) in data.projects.enumerate() {
      if i > 0 { v(ENTRY_GAP) }
      entry(headrow(text(weight: 700, size: 10.5pt)[#p.name], p.period), p.bullets)
      if p.tech.len() > 0 { block(breakable: false, above: 3pt)[#text(size: 9pt, fill: sub)[Tech: #p.tech.join(", ")]] }
    }
  })
}
#if data.education.len() > 0 {
  section("Education", {
    for (i, e) in data.education.enumerate() {
      if i > 0 { v(ENTRY_GAP - 2pt) }
      let sb = ()
      if e.gpa != "" { sb.push("GPA: " + e.gpa) }
      if e.honors != "" { sb.push(e.honors) }
      if e.minors != "" { sb.push(e.minors) }
      entry({
        headrow(text(weight: 700, size: 10.5pt)[#e.degree, #e.school], e.dates)
        if sb.len() > 0 { v(1pt); text(size: 9.5pt, fill: sub)[#sb.join("  \u{b7}  ")] }
      }, e.lines)
    }
  })
}
#if data.skills.len() > 0 {
  section("Technical Skills", {
    for (i, g) in data.skills.enumerate() {
      block(breakable: false, above: if i > 0 { 3pt } else { 0pt })[
        #text(weight: 700, size: 10pt)[#g.group: ] #text(size: 10pt)[#g.items.join(", ")]
      ]
    }
  })
}
#if data.interests != "" { section("Interests", text(size: 10pt)[#data.interests]) }
