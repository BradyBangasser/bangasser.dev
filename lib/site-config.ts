// ---------------------------------------------------------------------------
// Edit THIS file to update your name, bio, links, and site-wide copy.
// Nothing else in the codebase should need to change for routine updates.
// ---------------------------------------------------------------------------

export const siteConfig = {
  name: "Brady Bangasser",
  role: "Systems Engineer — HPC, Cloud Infrastructure & Security",
  tagline:
    "I build and break large-scale systems: HPC pipelines, compilers, cloud infrastructure, and the cryptography holding it all together.",
  url: "https://bangasser.dev",
  email: "brady@bangasser.dev",
  location: "Ames, Iowa",

  bio: `I'm a computer scientist finishing my Master's in Computer Science at Iowa
State University, researching compilers, distributed computing, cryptography,
and cloud architecture. My work sits at the intersection of high-performance
systems and security — I care about software that's both fast and hard to
break.

Outside of research, I work across DevOps, cloud security and architecture,
build systems, and HPC infrastructure end to end — from the compiler that
turns your code into instructions, to the cluster that runs it, to the
network that has to be trusted to do so safely.

When I'm not at a terminal, I'm usually climbing or flying.`,

  focusAreas: [
    {
      title: "HPC Systems",
      description:
        "Cluster architecture, scheduling, performance tuning, and distributed computing at scale.",
    },
    {
      title: "Compilers",
      description:
        "Toolchains, build systems, and the translation layer between source code and hardware.",
    },
    {
      title: "Cryptography & Auth",
      description:
        "Applied cryptography, authentication systems, and the primitives that secure them.",
    },
    {
      title: "Cloud Infrastructure & Security",
      description:
        "Cloud architecture, DevOps, and security posture from the network layer up.",
    },
  ],

  education: [
    {
      school: "Iowa State University",
      degree: "M.S. Computer Science",
      period: "Expected 2027",
      detail:
        "Research focus: compilers, distributed computing, cryptography, and cloud architecture.",
    },
  ],

  interests: ["Rock climbing", "Flying"],

  social: {
    github: "https://github.com/BradyBangasser",
    // Fill these in as they go live — leave blank ("") to hide the link.
    linkedin: "",
    x: "",
    bluesky: "",
    orcid: "",
    scholar: "",
    mastodon: "",
  },

  consulting: {
    services: [
      {
        title: "General Software Consulting",
        description:
          "Architecture review, build/CI systems, infrastructure design, and hands-on implementation for teams that need senior systems expertise on a project basis.",
      },
      {
        title: "ML Model Penetration Testing",
        description:
          "Adversarial evaluation of machine learning systems — model extraction, evasion, data leakage, and infrastructure-level attack surface around deployed models.",
      },
    ],
    contactNote:
      "The fastest way to reach me is email. Include a short summary of the problem, rough timeline, and whether this is a one-time engagement or ongoing work.",
  },

  seo: {
    defaultTitle: "Brady Bangasser — HPC, Cloud & Security",
    titleTemplate: "%s — Brady Bangasser",
    defaultDescription:
      "Brady Bangasser is a computer scientist working on HPC systems, compilers, cryptography, and cloud infrastructure security.",
    keywords: [
      "Brady Bangasser",
      "HPC",
      "high performance computing",
      "cloud infrastructure",
      "cloud security",
      "cryptography",
      "compilers",
      "distributed computing",
      "ML security",
      "ML penetration testing",
      "DevOps",
      "Iowa State University",
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
