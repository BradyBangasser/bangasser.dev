import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { poolPhotos } from "@/lib/photo";
import { RandomPortrait } from "@/components/RandomPortrait";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name}.`,
};

const socialLinks: { key: keyof typeof siteConfig.social; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X" },
  { key: "bluesky", label: "Bluesky" },
  { key: "scholar", label: "Google Scholar" },
  { key: "orcid", label: "ORCID" },
  { key: "mastodon", label: "Mastodon" },
];

export default function ContactPage() {
  const activeSocials = socialLinks.filter((s) => siteConfig.social[s.key]);
  const photos = poolPhotos();

  return (
    <div className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
        <div>
      <p className="eyebrow mb-4">// contact</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Get in touch</h1>
      <p className="mt-4 max-w-prose text-ink-muted">
        Email is the best way to reach me - for consulting inquiries, research
        collaboration, or anything else.
      </p>

      <a
        href={`mailto:${siteConfig.email}`}
        className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg no-underline transition-opacity hover:opacity-90"
      >
        {siteConfig.email}
      </a>

      {activeSocials.length > 0 && (
        <div className="mt-10">
          <p className="eyebrow mb-3">elsewhere</p>
          <div className="flex flex-wrap gap-3">
            {activeSocials.map((s) => (
              <a
                key={s.key}
                href={siteConfig.social[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border px-4 py-2 text-sm text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
        </div>

        {photos.length > 0 && (
          <div className="hidden lg:block lg:pt-2">
            <RandomPortrait photos={photos} sizes="(max-width: 1024px) 0px, 320px" />
          </div>
        )}
      </div>
    </div>
  );
}
