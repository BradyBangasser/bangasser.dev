import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { publicFileExists } from "@/lib/photo";

export const metadata: Metadata = {
  title: "About",
  description: `Background and focus for ${siteConfig.name}.`,
};

export default function AboutPage() {
  const paragraphs = siteConfig.bio.trim().split(/\n\n+/);
  const { src: aboutSrc, alt: aboutAlt } = siteConfig.photo.about;
  const hasAboutPhoto = publicFileExists(aboutSrc);

  return (
    <div className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <p className="eyebrow mb-4">// about</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">About</h1>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="max-w-prose space-y-4 text-ink-muted">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="space-y-8">
          {hasAboutPhoto && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-bg-elevated">
              <Image
                src={aboutSrc}
                alt={aboutAlt}
                fill
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover"
              />
            </div>
          )}

          <div>
            <h2 className="eyebrow mb-3">education</h2>
            {siteConfig.education.map((e) => (
              <div key={e.school} className="card px-4 py-4">
                <p className="font-medium text-ink">{e.degree}</p>
                <p className="text-sm text-ink-muted">{e.school}</p>
                <p className="mt-1 font-mono text-xs text-ink-faint">{e.period}</p>
                <p className="mt-2 text-sm text-ink-muted">{e.detail}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="eyebrow mb-3">focus areas</h2>
            <ul className="space-y-2">
              {siteConfig.focusAreas.map((f) => (
                <li key={f.title} className="text-sm text-ink-muted">
                  <span className="text-ink">{f.title}</span> — {f.description}
                </li>
              ))}
            </ul>
          </div>

          {siteConfig.interests.length > 0 && (
            <div>
              <h2 className="eyebrow mb-3">outside of work</h2>
              <p className="text-sm text-ink-muted">
                {siteConfig.interests.join(" · ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
