// ATS template — single column, standard headings, right-aligned dates,
// bullets that never split across a page. Clean enough for a human too.
#let data = json(sys.inputs.data)
#let m = data.meta

#let accent = rgb("#14487f")
#let rule = rgb("#c9d1da")
#let muted = rgb("#4a5560")

#set document(title: m.name + " Resume", author: m.name)
#set page(paper: "us-letter", margin: (x: 0.6in, top: 0.5in, bottom: 0.5in))
#set text(font: "New Computer Modern Sans", size: 10pt, fill: rgb("#15181c"))
#set par(leading: 0.62em)

#let point(it) = block(breakable: false, above: 4.5pt, below: 0pt)[
  #grid(columns: (0.9em, 1fr), column-gutter: 3pt, text(fill: accent)[•], [#it])
]
#let entry(head, items) = {
  if items.len() == 0 { block(breakable: false, head) }
  else {
    block(breakable: false, { head; point(items.first()) })
    for it in items.slice(1) { point(it) }
  }
}
#let headrow(lead, trail) = grid(
  columns: (1fr, auto), column-gutter: 8pt, align: (left + horizon, right + horizon),
  lead, text(size: 9pt, fill: muted)[#trail],
)
#let section(title, body) = {
  v(8pt)
  text(size: 10.5pt, weight: 700, fill: accent, tracking: 0.5pt)[#upper(title)]
  v(2pt); line(length: 100%, stroke: 0.6pt + rule); v(5pt)
  body
}

// shortest header (centered)
#align(center)[
  #text(size: 20pt, weight: 700)[#m.name]
  #if data.headline != "" [ #linebreak() #text(size: 10.5pt, fill: accent, weight: 600)[#data.headline] ]
  #linebreak()
  #let c = (m.email, m.phone, m.links.website, m.links.github, m.links.linkedin, m.location).filter(x => x != none and x != "")
  #v(2pt)
  #text(size: 8.5pt, fill: muted)[#c.join("   ·   ")]
]
#v(2pt)
#if data.summary != "" [ #text(size: 9.5pt)[#data.summary] ]

#if data.experience.len() > 0 {
  section("Experience", {
    for (i, x) in data.experience.enumerate() {
      if i > 0 { v(7pt) }
      entry({
        headrow(text(weight: 700, size: 10.5pt)[#x.title #text(weight: 400, fill: muted)[· #x.org]], x.dates)
        if x.location != "" { text(size: 9pt, fill: muted, style: "italic")[#x.location] }
      }, x.bullets)
    }
  })
}
#if data.projects.len() > 0 {
  section("Projects", {
    for (i, p) in data.projects.enumerate() {
      if i > 0 { v(7pt) }
      entry(headrow(text(weight: 700, size: 10.5pt)[#p.name], p.period), p.bullets)
      if p.tech.len() > 0 { block(breakable: false, above: 2pt)[#text(size: 8.5pt, fill: muted)[#emph[Tech:] #p.tech.join(", ")]] }
    }
  })
}
#if data.education.len() > 0 {
  section("Education", {
    for (i, e) in data.education.enumerate() {
      if i > 0 { v(6pt) }
      let sb = ()
      if e.gpa != "" { sb.push("GPA: " + e.gpa) }
      if e.honors != "" { sb.push(e.honors) }
      if e.minors != "" { sb.push(e.minors) }
      entry({
        headrow(text(weight: 700, size: 10.5pt)[#e.degree #text(weight: 400, fill: muted)[· #e.school]], e.dates)
        if sb.len() > 0 { text(size: 9pt, fill: muted)[#sb.join("  ·  ")] }
      }, e.lines)
    }
  })
}
#if data.skills.len() > 0 {
  section("Technical Skills", {
    for g in data.skills {
      block(breakable: false, above: 2.5pt)[
        #grid(columns: (auto, 1fr), column-gutter: 6pt,
          text(weight: 700, size: 9.5pt)[#g.group:], text(size: 9.5pt)[#g.items.join(", ")])
      ]
    }
  })
}
#if data.interests != "" { section("Interests", text(size: 9.5pt)[#data.interests]) }
