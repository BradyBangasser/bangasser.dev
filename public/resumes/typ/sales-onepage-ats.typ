// Self-contained resume generated from resume.yml.
// Compile:  typst compile thisfile.typ
#let __data = ```
{"meta": {"name": "Brady Bangasser", "location": "Saint Paul, MN", "email": "brady@bangasser.dev", "phone": "(651) 769-5301", "links": {"website": "www.bangasser.dev", "github": "github.com/BradyBangasser", "github_handle": "BradyBangasser", "linkedin": "linkedin.com/in/bbangasser", "linkedin_handle": "bbangasser"}}, "headline": "Technical Sales & Solutions Engineer", "summary": "Engineer with hands-on systems, cloud, and infrastructure depth who works directly with customers and cross-functional teams, translating complex technical systems into clear value and measurable results.", "education": [{"degree": "M.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2025 – May 2027", "gpa": "4.00", "honors": "", "minors": "", "lines": ["Concurrent B.S./M.S. program"]}, {"degree": "B.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2024 – Dec 2026", "gpa": "3.79", "honors": "Dean's List", "minors": "", "lines": ["Coursework: Compiler Design and Development, AI and Machine Learning in High Performance Computing, Network Architecture and Security, Theory of Computing, Software Design Practices"]}], "experience": [{"id": "ibm-phyp", "title": "Firmware Engineer Intern", "org": "IBM", "location": "", "dates": "May 2026 – Aug 2026", "bullets": ["Built AI failure analysis into a custom CI/CD build harness that root-causes failed builds from logs with an internal model, then delivered it to three engineering teams.", "Cut firmware and software build time 17% through smart Git prefetching, and communicated the pipeline changes across the PHYP organization."]}, {"id": "deere-cloudsec", "title": "Cloud Security Engineer", "org": "John Deere", "location": "", "dates": "May 2025 – Aug 2025", "bullets": ["Migrated IAM and security tooling from Python to Go for a ~10x performance gain that cut AWS Lambda costs, and presented the results to drive team adoption.", "Built tooling that verified 100,000+ AWS and Azure resources against policy and NIST standards, coordinating across security, cloud, and development stakeholders."]}, {"id": "isu-sysadmin", "title": "System Administrator", "org": "Iowa State University", "location": "", "dates": "Apr 2025 – Present", "bullets": ["Operate a production HPC cluster (SLURM, Kubernetes) for a large university user base, turning complex infrastructure into reliable, usable services.", "Support and troubleshoot researchers' applications, improving accessibility and onboarding with OpenOnDemand."]}, {"id": "cardinal-space-mining", "title": "Head of Networking", "org": "Cardinal Space Mining", "location": "", "dates": "Aug 2024 – Present", "bullets": ["Lead the networking sub-team, coordinating design and integration across sub-teams toward competition deadlines.", "Translate networking trade-offs for non-technical teammates and keep the group aligned on priorities."]}, {"id": "caribou-coffee", "title": "Manager", "org": "Caribou Coffee", "location": "", "dates": "Oct 2021 – Jan 2025", "bullets": ["Led a team and daily operations, owning training and the customer experience.", "Met sales and service targets while building repeat-customer relationships."]}], "projects": [{"name": "Erid - Unified Cloud Images", "period": "2026", "tech": [], "bullets": ["One Packer + Terraform pipeline that builds identical, reproducible qcow2 golden images across every major cloud (AWS, GCP, Azure, Oracle, Hetzner) and on-prem, applying the same hardening everywhere to eliminate drift.", "Standardized a hardening baseline applied identically to every target image, so security posture no longer varies by platform."]}, {"name": "Computer Vision Parking Enforcement Radar", "period": "2025–2026", "tech": [], "bullets": ["Built a real-time computer-vision service that detects parking-enforcement vehicles at ~95% accuracy and broadcasts locations to a user-facing app.", "Stored and queried detected-vehicle geolocation in PostgreSQL for fast spatial lookups."]}, {"name": "FratRat — Encrypted Student Social App", "period": "2026", "tech": [], "bullets": ["Built an end-to-end encrypted iOS social app (SwiftUI) for college students, with peer discovery, matching, group chat, and live party alerts.", "Wrote a custom end-to-end encrypted messaging protocol in Rust (identity, key bundles, relays, mailboxes) and compiled it to a native iOS static library."]}], "skills": [{"group": "Languages", "items": ["C", "C++", "Python", "Go", "Rust", "Bash"]}, {"group": "Infrastructure & Platform", "items": ["Kubernetes", "Docker", "Terraform", "Linux/Unix", "Git", "CI/CD"]}, {"group": "Cloud", "items": ["AWS", "Azure", "Google Cloud"]}], "interests": ""}
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
