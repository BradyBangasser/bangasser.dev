// ---------------------------------------------------------------------------
// Edit THIS file to update your name, bio, links, and site-wide copy.
// Nothing else in the codebase should need to change for routine updates.
// ---------------------------------------------------------------------------

export const siteConfig = {
  // Feature flags. Flip a section off site-wide without touching components.
  features: {
    consulting: false, // shows the Consulting page, nav link, and a low-key home mention
  },

  name: "Brady Bangasser",
  role: "Software & Systems Engineer",
  tagline:
    "I build and operate large-scale systems to stay fast, available, and secure, across HPC, multi-cloud infrastructure, and the automation that ships them.",
  url: "https://www.bangasser.dev",
  email: "brady@bangasser.dev",
  location: "Minneapolis, Minnesota",

  // Photos. Drop the files in /public and point to them here.
  // Leave `src` as "" to fall back to a clean monogram instead of a broken image.
  photo: {
    hero: {
      src: "/photos/brady-hero.jpg",
      alt: "Brady Bangasser",
    },
    about: {
      src: "/photos/brady-about.jpg",
      alt: "Brady Bangasser at the controls of a small aircraft",
    },
    // Pool of photos of you. One is picked at random on the home, about, and
    // contact pages (independently, so they usually differ). Add as many as you
    // like; entries whose files are missing are skipped, and if none exist the
    // pages fall back to a clean monogram. Drop files in /public/photos.
    pool: [
      { src: "/photos/brady-hero.jpg", alt: "Brady Bangasser" },
      { src: "/photos/brady-about.jpg", alt: "Brady Bangasser flying a small aircraft" },
      { src: "/photos/brady-climbing.jpg", alt: "Brady Bangasser rock climbing" },
      { src: "/photos/brady-datacenter.jpg", alt: "Brady Bangasser in the datacenter" },
    ] as { src: string; alt: string }[],
  },

  bio: `I'm a computer scientist finishing my Master's at Iowa State University,
where I also run production HPC infrastructure and research compiler and
systems performance. My focus is reliability and platform work: keeping
large-scale systems fast, available, and secure, and making them easier to
operate.

That spans the whole stack - high-availability cluster and cloud
infrastructure, observability and incident response, infrastructure as code,
and the CI that ships it. Underneath, I work close to the metal: distributed
systems, compiler and toolchain internals, and the cryptography and
authentication that keep it all trustworthy.

When I'm not at a terminal, I'm usually flying or climbing.`,

  focusAreas: [
    {
      title: "Reliability & Platform",
      description:
        "High-availability systems, observability, and self-healing infrastructure built to survive failure - not just avoid it.",
    },
    {
      title: "Cloud & Infrastructure",
      description:
        "Multi-cloud and on-prem infrastructure as code, least-privilege IAM, and security hardened to recognized standards.",
    },
    {
      title: "HPC & Distributed Systems",
      description:
        "Cluster operations at scale - SLURM and Kubernetes scheduling, performance tuning, and distributed workloads.",
    },
    {
      title: "Systems & Security",
      description:
        "Low-level performance work, compiler and toolchain internals, and applied cryptography and authentication.",
    },
  ],

  education: [
    {
      school: "Iowa State University",
      degree: "M.S. Computer Science",
      period: "Expected 2027",
      detail:
        "Concurrent B.S./M.S. Focus on high-performance computing, distributed systems, and compiler optimization.",
    },
  ],

  interests: ["Flying", "Rock climbing"],

  social: {
    github: "https://github.com/BradyBangasser",
    // Fill these in as they go live - leave blank ("") to hide the link.
    linkedin: "https://linkedin.com/in/bbangasser",
    x: "",
    bluesky: "",
    orcid: "",
    scholar: "",
    mastodon: "",
  },

  consulting: {
    intro:
      "I take on a limited number of engagements alongside research and coursework, focused on keeping systems reliable, operable, and secure. Below is where I'm most useful.",
    services: [
      {
        title: "Site Reliability & Platform Engineering",
        description:
          "Observability, incident response, CI/CD, and infrastructure automation that make services more reliable and far easier to operate.",
      },
      {
        title: "Cloud Security",
        description:
          "Cloud posture review, least-privilege IAM, and hardening across AWS, Azure, and GCP against NIST and platform best practices.",
      },
      {
        title: "DevOps & Infrastructure as Code",
        description:
          "Reproducible infrastructure with Terraform, Packer, and containers, spanning multi-cloud and on-prem environments.",
      },
      {
        title: "HPC & Systems Consulting",
        description:
          "Cluster setup, scheduling, and performance tuning for compute-heavy research and production workloads.",
      },
      {
        title: "ML Model Penetration Testing",
        description:
          "Adversarial evaluation of machine learning systems - model extraction, evasion, data leakage, and the attack surface around deployed models.",
      },
    ],
    contactNote:
      "Email is the fastest way to reach me. Include a short summary of the problem, a rough timeline, and whether it's a one-time engagement or ongoing work.",
  },

  seo: {
    defaultTitle: "Brady Bangasser, Software & Systems Engineer",
    titleTemplate: "%s · Brady Bangasser",
    defaultDescription:
      "Brady Bangasser is a software and systems engineer working across reliability, high-availability infrastructure, HPC, cloud security, compilers, and distributed systems.",
    keywords: [
      "Bangasser",
      "iowa state",
      "datacenter",
      "ames",
      "data center",
      "Brady Bangasser",
      "site reliability engineering",
      "SRE",
      "platform engineering",
      "reliability engineering",
      "observability",
      "incident response",
      "high availability",
      "infrastructure as code",
      "Terraform",
      "Kubernetes",
      "cloud infrastructure",
      "cloud security",
      "DevOps",
      "HPC",
      "high performance computing",
      "distributed systems",
      "compilers",
      "cryptography",
      "Iowa State University",
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
