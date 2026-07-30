// Self-contained resume generated from resume.yml.
// Compile:  typst compile thisfile.typ
#let __data = ```
{"meta": {"name": "Brady Bangasser", "location": "Saint Paul, MN", "email": "brady@bangasser.dev", "phone": "(651) 769-5301", "links": {"website": "www.bangasser.dev", "github": "github.com/BradyBangasser", "github_handle": "BradyBangasser", "linkedin": "linkedin.com/in/bbangasser", "linkedin_handle": "bbangasser"}}, "headline": "Site Reliability & Platform Engineer", "summary": "Systems engineer focused on reliability and platform work: running production HPC and cloud infrastructure, automating operations, and keeping large-scale systems available and observable under real load.", "education": [{"degree": "M.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2025 – May 2027", "gpa": "4.00", "honors": "", "minors": "", "lines": ["Concurrent B.S./M.S. program", "Coursework: Advanced Topics in High Performance Computing, Distributed Systems and Middleware, Data Security in Machine Learning, Network Design and Security"]}, {"degree": "B.S. Computer Science", "school": "Iowa State University", "location": "Ames, IA", "dates": "Aug 2024 – Dec 2026", "gpa": "3.79", "honors": "Dean's List", "minors": "Minors in Cybersecurity and Data Science", "lines": ["Coursework: Compiler Design and Development, AI and Machine Learning in High Performance Computing, Network Architecture and Security, Theory of Computing, Software Design Practices"]}], "experience": [{"id": "ibm-phyp", "title": "Firmware Engineer Intern", "org": "IBM", "location": "Rochester, MN", "dates": "May 2026 – Aug 2026", "bullets": ["Modernized Jenkins/Groovy CI/CD pipelines for firmware and software builds on IBM's Power Hypervisor (PHYP), cutting build time 17% with smart Git prefetching and by eliminating redundant double-fetching.", "Added an AI failure-analysis step to a custom build harness that root-causes failed builds from logs with an IBM internal model, then reports next steps, whether a rerun is safe, likely hardware or network causes, and who to contact, speeding incident triage.", "Added pipeline observability and auto-generated Markdown and PDF build-failure reports so engineers could triage broken builds faster.", "Shipped the pipeline to 3 teams and designed it to be extendible across the entire PHYP development department.", "Integrated pipelines with secure enterprise build and artifact systems including Artifactory, working within locked-down build and deployment constraints.", "Adapted the hardware build-validation harness to the new pipeline and AI analysis, running validation directly on POWER9, POWER10, and POWER11 systems."]}, {"id": "deere-cloudsec", "title": "Cloud Security Engineer", "org": "John Deere", "location": "Johnston, IA", "dates": "May 2025 – Aug 2025", "bullets": ["Built and deployed tooling that verified 100,000+ AWS and Azure resources against company policy, NIST standards, and platform best practices.", "Designed and managed least-privilege IAM policies in AWS to tighten cloud access control.", "Wrote automated remediation for common misconfigurations flagged across the cloud estate.", "Led a migration of IAM, security, and dev-management tooling from Python to Go, a ~10x performance gain that cut AWS Lambda runtime costs by roughly the same factor.", "Deployed high-throughput Go services on AWS EKS to run compliance checks across the cloud estate."]}, {"id": "isu-sysadmin", "title": "System Administrator", "org": "Iowa State University", "location": "Ames, IA", "dates": "Apr 2025 – Present", "bullets": ["Operate and maintain a production HPC cluster with SLURM, Kubernetes, Active Directory, Ansible, Prometheus, and Apptainer, keeping it secure and available for a large user base.", "Built diagnostic and monitoring workflows that isolate hardware degradation, network bottlenecks, and software-stack faults before they take nodes offline.", "Built a TUI stress-testing tool in C that dynamically schedules HPL (LINPACK) jobs and watches live metrics to keep runs inside safe thermal and power limits, protecting node health while pushing for peak results.", "Automated node provisioning and recovery with Ansible so failed or new nodes rejoin service quickly.", "Built Prometheus-based monitoring and alerting to catch cluster issues before users notice.", "Integrated NCCL tests into the tool to validate multi-GPU InfiniBand bandwidth and surface interconnect problems early.", "Improved researcher accessibility by supporting user applications through OpenOnDemand and streamlining common workflows."]}, {"id": "cardinal-space-mining", "title": "Head of Networking", "org": "Cardinal Space Mining", "location": "Ames, IA", "dates": "Aug 2024 – Present", "bullets": ["Designed, built, and tested the internal network for a competition mining robot, ensuring redundant control and telemetry throughout each arena run.", "Collected multiple camera streams and relayed them to a third-party platform for live judging.", "Hardened networking equipment against wireless interference, dust, and physical damage in the competition arena."]}, {"id": "cyclone-rocketry", "title": "Lead Telemetry Engineer", "org": "Cyclone Rocketry", "location": "Ames, IA", "dates": "Aug 2024 – May 2025", "bullets": ["Built modular software to control and acquire data from airframe instruments, improving reliability and maintainability.", "Built a ground-station TUI in C to visualize live telemetry from the airframe during flights."]}, {"id": "bethel-research", "title": "Research Assistant - High Performance Computing", "org": "Bethel University", "location": "Saint Paul, MN", "dates": "Aug 2023 – Aug 2024", "bullets": ["Built and configured two bare-metal HPC clusters from scratch: networking, custom DNS and routing, user management, and SLURM job scheduling with VMware and Debian.", "Developed a self-healing IoT sensor mesh network to detect earthquakes, landslides, and flash floods in remote regions."]}], "projects": [{"name": "Erid - Unified Cloud Images", "period": "2026", "tech": ["Terraform", "Packer", "AWS", "GCP", "Azure", "Oracle", "Hetzner", "qcow2", "Linux"], "bullets": ["One Packer + Terraform pipeline that builds identical, reproducible qcow2 golden images across every major cloud (AWS, GCP, Azure, Oracle, Hetzner) and on-prem, applying the same hardening everywhere to eliminate drift.", "Standardized a hardening baseline applied identically to every target image, so security posture no longer varies by platform.", "Produces multiple image variants for different node roles, plus matching container images, all from the same definition."]}, {"name": "Omni HTTP Router", "period": "2025–2026", "tech": ["Rust", "LLVM", "Terraform", "gRPC"], "bullets": ["Wrote a compiler that lowers a routing DSL to native object files and generates matching Terraform and binaries for easy, fast cloud deployment.", "Built a Rust HTTP router that resolves middleware at compile time into fully static stacks, routing a request in under 30 instructions on SIMD-enabled x86."]}, {"name": "Computer Vision Parking Enforcement Radar", "period": "2025–2026", "tech": ["Python", "Redis Streams", "PostgreSQL", "REST"], "bullets": ["Architected a Redis Streams pipeline for low-latency, high-throughput image and detection routing from a REST API to processing servers, backed by PostgreSQL geospatial storage.", "Tuned the broker for low-latency, high-throughput delivery from the REST API to processing servers."]}, {"name": "Public Data Scraping and Processing", "period": "2025", "tech": ["C++", "C", "Python", "Lua", "Rust", "MySQL", "Docker", "PyTorch", "Terraform", "Kubernetes"], "bullets": ["Built a parallel, scalable pipeline to scrape, clean, and store public datasets, deployed via a Terraform CI/CD pipeline to AWS and a personal Kubernetes cluster.", "Wrote a compiler-like tool that pairs lexical analysis with an LLM to standardize and validate data formats, and trained an ML model to flag anomalies in the collected data."]}, {"name": "Gin Gonic Routing & Middleware Framework", "period": "2025–2026", "tech": ["Rust", "Go", "Gin Gonic"], "bullets": ["Wrote a Rust tool that auto-generates and protects Go (Gin) routes by file path, with middleware for permission bits, request IDs, and structured logging.", "Generated per-route middleware for permission bits, request IDs, and structured logging."]}], "skills": [{"group": "Languages", "items": ["C", "C++", "Python", "Go", "Rust", "Bash", "TypeScript", "Perl", "Groovy"]}, {"group": "Infrastructure & Platform", "items": ["Kubernetes", "Docker", "Terraform", "Packer", "Ansible", "SLURM", "Prometheus", "Apptainer", "Linux/Unix", "Git", "CI/CD", "Jenkins", "Artifactory"]}, {"group": "Cloud", "items": ["AWS", "Azure", "Google Cloud", "AWS EKS"]}, {"group": "Data & Backends", "items": ["PostgreSQL", "Redis"]}, {"group": "Security", "items": ["NIST standards", "Least-privilege IAM"]}], "interests": "Aviation (flying small aircraft), rock climbing"}
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
