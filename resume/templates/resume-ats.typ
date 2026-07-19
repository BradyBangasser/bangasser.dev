// ATS template (machine-facing). Plain black, single column, standard headings,
// same researched spacing rhythm as the designed one but no color and no icons,
// so parsers have the cleanest possible signal. Bullets never split a page.
#let data = json("/build/data.json")
#let m = data.meta

#let ink  = rgb("#000000")
#let sub  = rgb("#333333")
#let rulec = rgb("#000000")

#set document(title: m.name + " Resume", author: m.name)
#set page(paper: "us-letter", margin: (x: 0.7in, top: 0.55in, bottom: 0.55in))
#set text(font: "New Computer Modern Sans", size: 10.5pt, fill: ink)
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
