// Self-contained resume generated from resume.yml.
// Compile:  typst compile thisfile.typ
#let __data = ```
{"meta": {"name": "Brady Bangasser", "location": "Saint Paul, MN", "email": "brady@bangasser.dev", "phone": "(651) 769-5301", "links": {"website": "www.bangasser.dev", "github": "github.com/BradyBangasser", "github_handle": "BradyBangasser", "linkedin": "linkedin.com/in/bbangasser", "linkedin_handle": "bbangasser"}}, "headline": "HPC & Systems Engineer", "summary": "Systems engineer running production HPC clusters and researching high-performance and distributed computing, from scheduler internals to GPU-offload optimization at supercomputer scale.", "education": [{"degree": "M.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2025 – May 2027", "gpa": "4.00", "honors": "", "minors": "", "lines": ["Concurrent B.S./M.S. program", "Coursework: Advanced Topics in High Performance Computing, Distributed Systems and Middleware, Data Security in Machine Learning, Network Design and Security"]}, {"degree": "B.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2024 – Dec 2026", "gpa": "3.79", "honors": "Dean's List", "minors": "Minors in Cybersecurity and Data Science", "lines": ["Coursework: Compiler Design and Development, AI and Machine Learning in High Performance Computing, Network Architecture and Security, Theory of Computing, Software Design Practices"]}], "experience": [{"id": "isu-research-compilers", "title": "Research Assistant - Compiler Optimization", "org": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2025 – Present", "bullets": ["Built OMPRTF (OpenMP RunTime Fabric) for Iowa State's SWAPP lab, a custom OpenMP runtime and dynamic-analysis pipeline that applies aggressive, conditional optimizations to GPU-offload programs by lowering them to LLVM IR.", "Wrote an LLVM optimization pass that breaks opaque OpenMP runtime calls into discrete IR instructions, pruning redundant host-GPU data movement without destabilizing kernels.", "Built a dynamic profiling library that correlates OpenMP target logs with IR metadata to surface duplicate transfers and unused memory automatically; initial testing showed ~10% performance gains from the profiling-guided optimizations.", "Co-developed an LLVM-based tool that restructures disk I/O access patterns to speed up data loading for large ML/AI workloads.", "Analyzed Darshan I/O logs from Iowa State's Nova cluster and the Polaris supercomputer to locate and resolve system-level data-loading bottlenecks."]}, {"id": "isu-sysadmin", "title": "System Administrator", "org": "Iowa State University", "location": "Ames, IA", "dates": "Apr 2025 – Present", "bullets": ["Operate and maintain a production HPC cluster with SLURM, Kubernetes, Active Directory, Ansible, Prometheus, and Apptainer, keeping it secure and available for a large user base.", "Built diagnostic and monitoring workflows that isolate hardware degradation, network bottlenecks, and software-stack faults before they take nodes offline.", "Built a TUI stress-testing tool in C that dynamically schedules HPL (LINPACK) jobs and watches live metrics to keep runs inside safe thermal and power limits, protecting node health while pushing for peak results.", "Automated node provisioning and recovery with Ansible so failed or new nodes rejoin service quickly.", "Integrated NCCL tests into the tool to validate multi-GPU InfiniBand bandwidth and surface interconnect problems early."]}, {"id": "isu-research-ml", "title": "Research Assistant - Machine Learning", "org": "Iowa State University", "location": "Ames, IA", "dates": "Oct 2024 – May 2025", "bullets": ["Designed and trained object-classification models with PyTorch and OpenCV, tuning data preprocessing and tensor operations to cut training latency without losing accuracy.", "Tested perception models on self-driving vehicles to catch false and failed classifications."]}, {"id": "bethel-research", "title": "Research Assistant - High Performance Computing", "org": "Bethel University", "location": "Saint Paul, MN", "dates": "Aug 2023 – Aug 2024", "bullets": ["Built and configured two bare-metal HPC clusters from scratch: networking, custom DNS and routing, user management, and SLURM job scheduling with VMware and Debian.", "Implemented a wildfire simulation in OpenMP, CUDA, C, and Fortran to benchmark cluster performance across heterogeneous compute.", "Wrote a lightweight daemon and control program to manage per-node status lighting across the clusters."]}], "projects": [], "skills": [{"group": "Languages", "items": ["C", "C++", "Python", "Go", "Rust", "Bash", "CUDA", "Fortran"]}, {"group": "Infrastructure & Platform", "items": ["Kubernetes", "SLURM", "Apptainer", "Linux/Unix", "Git"]}, {"group": "Compilers & HPC", "items": ["LLVM", "OpenMP", "OpenMPI", "PyTorch"]}], "interests": ""}
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
