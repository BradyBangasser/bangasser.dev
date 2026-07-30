// Self-contained resume generated from resume.yml.
// Compile:  typst compile thisfile.typ
#let __data = ```
{"meta": {"name": "Brady Bangasser", "location": "Saint Paul, MN", "email": "brady@bangasser.dev", "phone": "(651) 769-5301", "links": {"website": "www.bangasser.dev", "github": "github.com/BradyBangasser", "github_handle": "BradyBangasser", "linkedin": "linkedin.com/in/bbangasser", "linkedin_handle": "bbangasser"}}, "headline": "Software Engineer", "summary": "Software engineer across the stack, from low-latency Go and Rust services and secure backends to the infrastructure and CI that ship them.", "education": [{"degree": "M.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2025 – May 2027", "gpa": "4.00", "honors": "", "minors": "", "lines": ["Concurrent B.S./M.S. program"]}, {"degree": "B.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2024 – Dec 2026", "gpa": "3.79", "honors": "Dean's List", "minors": "", "lines": ["Coursework: Compiler Design and Development, AI and Machine Learning in High Performance Computing, Network Architecture and Security, Theory of Computing, Software Design Practices"]}], "experience": [{"id": "ibm-phyp", "title": "Firmware Engineer Intern", "org": "IBM", "location": "", "dates": "May 2026 – Aug 2026", "bullets": ["Re-engineered PHYP firmware and software build pipelines (Jenkins, Groovy, Python, Perl, Bash), improving build time 17% through smart Git prefetching and de-duplicated fetches.", "Extended a custom build harness with AI failure analysis: it parses build logs, calls an IBM internal model to root-cause failures, and emits a report with next steps, rerun-safety, and escalation contacts.", "Built Markdown and PDF build-failure report generation and richer build observability into the pipeline tooling.", "Shipped the pipeline to 3 teams and designed it to be extendible across the entire PHYP development department."]}, {"id": "deere-cloudsec", "title": "Cloud Security Engineer", "org": "John Deere", "location": "", "dates": "May 2025 – Aug 2025", "bullets": ["Led a migration of IAM, security, and dev-management tooling from Python to Go, a ~10x performance gain that cut AWS Lambda runtime costs by roughly the same factor.", "Deployed high-throughput Go services on AWS EKS to run compliance checks across the cloud estate."]}, {"id": "isu-sysadmin", "title": "System Administrator", "org": "Iowa State University", "location": "", "dates": "Apr 2025 – Present", "bullets": ["Built a TUI stress-testing tool in C that dynamically schedules HPL (LINPACK) jobs and watches live metrics to keep runs inside safe thermal and power limits, protecting node health while pushing for peak results.", "Implemented ResMemPerGPU in a customized SLURM scheduler (C) to stop CPU jobs from consuming all memory on GPU nodes, protecting GPU workloads, with Makefile-driven builds and validation."]}, {"id": "cardinal-space-mining", "title": "Head of Networking", "org": "Cardinal Space Mining", "location": "", "dates": "Aug 2024 – Present", "bullets": ["Collected multiple camera streams and relayed them to a third-party platform for live judging.", "Designed, built, and tested the internal network for a competition mining robot, ensuring redundant control and telemetry throughout each arena run."]}, {"id": "isu-research-ml", "title": "Research Assistant - Machine Learning", "org": "Iowa State University", "location": "", "dates": "Oct 2024 – May 2025", "bullets": ["Designed and trained object-classification models with PyTorch and OpenCV, tuning data preprocessing and tensor operations to cut training latency without losing accuracy.", "Probed model robustness by building adversarial exploit methods, then designed defenses to harden the models against them.", "Tested perception models on self-driving vehicles to catch false and failed classifications."]}, {"id": "cyclone-rocketry", "title": "Lead Telemetry Engineer", "org": "Cyclone Rocketry", "location": "", "dates": "Aug 2024 – May 2025", "bullets": ["Built modular software to control and acquire data from airframe instruments, improving reliability and maintainability.", "Built a ground-station TUI in C to visualize live telemetry from the airframe during flights.", "Designed a custom telemetry protocol for encrypted data routing over a mesh network, handling sensitive data across multiple interfaces at once."]}], "projects": [{"name": "Omni HTTP Router", "period": "2025–2026", "tech": [], "bullets": ["Built a Rust HTTP router that resolves middleware at compile time into fully static stacks, routing a request in under 30 instructions on SIMD-enabled x86.", "Supports gRPC and REST out of the box."]}, {"name": "Minnesotan Programming Language", "period": "2023–2025", "tech": [], "bullets": ["Designed a Turing-complete esoteric language and built an end-to-end compiler with Flex/Bison that emits LLVM IR, compiling to native executables.", "Implemented a custom lexer and parser that transform the language's colloquial syntax into an AST before LLVM IR emission."]}, {"name": "Computer Vision Parking Enforcement Radar", "period": "2025–2026", "tech": [], "bullets": ["Built a real-time computer-vision service that detects parking-enforcement vehicles at ~95% accuracy and broadcasts locations to a user-facing app.", "Stored and queried detected-vehicle geolocation in PostgreSQL for fast spatial lookups.", "Architected a Redis Streams pipeline for low-latency, high-throughput image and detection routing from a REST API to processing servers, backed by PostgreSQL geospatial storage."]}, {"name": "Public Data Scraping and Processing", "period": "2025", "tech": [], "bullets": ["Wrote a compiler-like tool that pairs lexical analysis with an LLM to standardize and validate data formats, and trained an ML model to flag anomalies in the collected data.", "Rendered target sites with a custom engine and generated Lua/Python API wrappers to collect data reliably."]}, {"name": "PortTorpedo", "period": "2025", "tech": [], "bullets": ["Built a decentralized, end-to-end encrypted online Battleship using UDP hole punching for peer-to-peer play, with cryptographic compression and integrity checks.", "Implemented UDP hole punching so peers connect directly with no central server (TCP was explored but proved impractical to punch reliably).", "Added cryptographic integrity checks and compression over the peer-to-peer channel."]}, {"name": "Gin Gonic Routing & Middleware Framework", "period": "2025–2026", "tech": [], "bullets": ["Wrote a Rust tool that auto-generates and protects Go (Gin) routes by file path, with middleware for permission bits, request IDs, and structured logging.", "Generated per-route middleware for permission bits, request IDs, and structured logging.", "Cut boilerplate for standing up secure Go services with consistent, path-based configuration."]}], "skills": [{"group": "Languages", "items": ["C", "C++", "Python", "Go", "Rust", "Bash", "TypeScript", "Java"]}, {"group": "Infrastructure & Platform", "items": ["Docker", "Linux/Unix", "Git", "CI/CD", "Jenkins", "Artifactory"]}, {"group": "Data & Backends", "items": ["MySQL", "PostgreSQL", "Redis"]}, {"group": "Security", "items": ["AES / RSA / ECDH", "JWT / auth"]}], "interests": ""}
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
