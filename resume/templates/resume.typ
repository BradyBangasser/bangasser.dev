// Designed template (human-facing). Centered header, one muted accent used only
// for the name/section headers/dividers/icons, and a consistent vertical rhythm
// based on resume-design research:
//   name 20pt · section headers 12pt · body 10.5pt
//   12pt above a section header, 6pt below its rule
//   10pt between entries · ~3.5pt between bullets · ~1.13 line spacing
// Bullets never break across a page. Data comes from a fixed path so the same
// template compiles identically locally and in the browser.
#let data = json("/build/data.json")
#let m = data.meta
#let D = data.at("density", default: 1.0)   // spacing lever set by the fitter

#let ink    = rgb("#15181c")   // near-black body
#let accent = rgb("#1f4e79")   // one muted professional blue
#let sub    = rgb("#565f6a")   // muted meta (dates, org, contact)
#let rulec  = rgb("#c3cbd6")   // hairline dividers (neutral)

#set document(title: m.name + " Resume", author: m.name)
#set page(paper: "us-letter", margin: (x: 0.65in, top: 0.5in, bottom: 0.5in))
#set text(font: "Libertinus Serif", size: 10.5pt, fill: ink)
#set par(leading: (0.55em * D), justify: false)   // ~1.13 line spacing

// ---- rhythm ---------------------------------------------------------------
#let SEC_ABOVE = (10pt * D)
#let SEC_BELOW = (5pt * D)
#let ENTRY_GAP = (8pt * D)
#let BULLET_ABOVE = (3pt * D)

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
#let __gh = image("/templates/icons/github.svg", height: 8.5pt)
#let __li = image("/templates/icons/linkedin.svg", height: 8.5pt)

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
  #if m.at("availability", default: "") != "" {
    v(4pt)
    text(size: 9pt, weight: 600, fill: accent)[#m.availability]
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
      block(breakable: false, above: 2.5pt)[
        #text(size: 8.7pt, fill: sub)[#emph[Tech:] #p.tech.join(", ")]
      ]
    }
  }
}
// ---- education -------------------------------------------------------------
#if data.education.len() > 0 {
  section("Education")
  for (i, e) in data.education.enumerate() {
    if i > 0 { v(ENTRY_GAP) }
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
// ---- conferences -----------------------------------------------------------
#if data.at("conferences", default: ()).len() > 0 {
  section("Conferences")
  for (i, c) in data.conferences.enumerate() {
    if i > 0 { v(ENTRY_GAP) }
    entry(
      colhead(c.event, c.role, c.location, c.dates),
      c.lines,
    )
  }
}
// ---- skills ----------------------------------------------------------------
#if data.skills.len() > 0 {
  section("Technical Skills")
  for (i, g) in data.skills.enumerate() {
    block(breakable: false, above: if i > 0 { 2.5pt } else { 0pt })[
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
