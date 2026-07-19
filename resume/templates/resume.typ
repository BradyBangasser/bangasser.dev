// Designed template — two-column entries (org/title left, location/dates right),
// shortest possible header with icon links, looser spacing, bullets that never
// break across a page. Renders whatever the build step puts in data.json.
#let data = json(sys.inputs.data)
#let m = data.meta

#let ink = rgb("#16191d")
#let sub = rgb("#565f6a")
#let rule = rgb("#b9c1cc")

#set document(title: m.name + " Resume", author: m.name)
#set page(paper: "us-letter", margin: (x: 0.62in, top: 0.5in, bottom: 0.5in))
#set text(font: "New Computer Modern Sans", size: 10pt, fill: ink)
#set par(leading: 0.68em, justify: false)

// ---- helpers ---------------------------------------------------------------
#let point(it) = block(breakable: false, above: 5pt, below: 0pt)[
  #grid(columns: (0.95em, 1fr), column-gutter: 4pt, text(fill: sub)[•], [#it])
]

// header + first bullet stay together; remaining bullets each stay whole
#let entry(head, items) = {
  if items.len() == 0 {
    block(breakable: false, head)
  } else {
    block(breakable: false, { head; point(items.first()) })
    for it in items.slice(1) { point(it) }
  }
}

#let colhead(l_top, l_bot, r_top, r_bot) = grid(
  columns: (1fr, auto), column-gutter: 10pt, align: (left, right), row-gutter: 2.5pt,
  {
    text(weight: 700, size: 10.5pt)[#l_top]
    if l_bot != "" { linebreak(); text(size: 10pt)[#l_bot] }
  },
  {
    if r_top != "" { text(size: 9.5pt, fill: sub)[#r_top]; linebreak() }
    if r_bot != "" { text(size: 9.5pt, fill: sub)[#r_bot] }
  },
)

#let section(title) = {
  v(9pt)
  text(size: 10.5pt, weight: 700, tracking: 0.4pt)[#upper(title)]
  v(2pt)
  line(length: 100%, stroke: 0.6pt + rule)
  v(5pt)
}

// small icon + label (used for github / linkedin so we can drop full URLs)
#let iconlink(path, label) = box(baseline: 0pt)[
  #box(image(path, height: 8.5pt), baseline: 1.6pt)#h(2.5pt)#label
]

// ---- shortest header -------------------------------------------------------
#text(size: 18pt, weight: 700)[#m.name]
#v(3pt)
#{
  set text(size: 8.8pt, fill: sub)
  let sep = [#h(5pt)|#h(5pt)]
  let items = ()
  if m.email != "" { items.push([#m.email]) }
  if m.phone != "" { items.push([#m.phone]) }
  if m.links.website != "" { items.push([#m.links.website]) }
  let gh = m.links.at("github_handle", default: "")
  if gh != "" { items.push(iconlink("/templates/icons/github.svg", gh)) }
  let li = m.links.at("linkedin_handle", default: "")
  if li != "" { items.push(iconlink("/templates/icons/linkedin.svg", li)) }
  if m.location != "" { items.push([#m.location]) }
  items.join(sep)
}
#v(4pt)
#line(length: 100%, stroke: 0.6pt + rule)
#if data.summary != "" [ #v(4pt) #text(size: 9.5pt, fill: sub)[#data.summary] ]

// ---- experience ------------------------------------------------------------
#if data.experience.len() > 0 {
  section("Experience")
  for (i, x) in data.experience.enumerate() {
    if i > 0 { v(8pt) }
    entry(colhead(x.org, x.title, x.location, x.dates), x.bullets)
  }
}

// ---- projects --------------------------------------------------------------
#if data.projects.len() > 0 {
  section("Projects")
  for (i, p) in data.projects.enumerate() {
    if i > 0 { v(8pt) }
    entry(colhead(p.name, "", "", p.period), p.bullets)
    if p.tech.len() > 0 {
      block(breakable: false, above: 3pt)[
        #text(size: 8.5pt, fill: sub)[#emph[Tech:] #p.tech.join(", ")]
      ]
    }
  }
}

// ---- education -------------------------------------------------------------
#if data.education.len() > 0 {
  section("Education")
  for (i, e) in data.education.enumerate() {
    if i > 0 { v(6pt) }
    let sub_bits = ()
    if e.gpa != "" { sub_bits.push("GPA: " + e.gpa) }
    if e.honors != "" { sub_bits.push(e.honors) }
    if e.minors != "" { sub_bits.push(e.minors) }
    entry(
      colhead(
        e.school,
        e.degree + (if sub_bits.len() > 0 { "   \u{b7}   " + sub_bits.join("  \u{b7}  ") } else { "" }),
        e.location, e.dates,
      ),
      e.lines,
    )
  }
}

// ---- skills ----------------------------------------------------------------
#if data.skills.len() > 0 {
  section("Technical Skills")
  for g in data.skills {
    block(breakable: false, above: 3.5pt)[
      #grid(columns: (auto, 1fr), column-gutter: 6pt,
        text(weight: 700, size: 9.5pt)[#g.group:],
        text(size: 9.5pt)[#g.items.join(", ")])
    ]
  }
}

// ---- interests -------------------------------------------------------------
#if data.interests != "" {
  section("Interests")
  text(size: 9.5pt)[#data.interests]
}
