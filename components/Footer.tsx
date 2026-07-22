import { siteConfig } from "@/lib/site-config";

const socialLinks: { key: keyof typeof siteConfig.social; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X" },
  { key: "bluesky", label: "Bluesky" },
  { key: "scholar", label: "Google Scholar" },
  { key: "orcid", label: "ORCID" },
  { key: "mastodon", label: "Mastodon" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const activeSocials = socialLinks.filter((s) => siteConfig.social[s.key]);

  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto flex max-w-page flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-ink-faint">
          © {year} {siteConfig.name}.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href={`mailto:${siteConfig.email}`}
            className="font-mono text-xs text-ink-muted no-underline hover:text-accent"
          >
            {siteConfig.email}
          </a>
          {activeSocials.map((s) => (
            <a
              key={s.key}
              href={siteConfig.social[s.key]}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-ink-muted no-underline hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
