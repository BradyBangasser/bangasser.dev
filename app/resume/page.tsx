import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Resume",
  description: `${siteConfig.name}'s background, education, and focus areas.`,
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <p className="eyebrow mb-4">// resume</p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold sm:text-4xl">Resume</h1>
        <a
          href="/resume.pdf"
          download
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent"
        >
          Download PDF ↓
        </a>
      </div>

      <div className="mt-10 max-w-prose space-y-8">
        <div>
          <h2 className="eyebrow mb-3">education</h2>
          {siteConfig.education.map((e) => (
            <div key={e.school} className="card px-5 py-4">
              <p className="font-medium text-ink">{e.degree}</p>
              <p className="text-sm text-ink-muted">{e.school}</p>
              <p className="mt-1 font-mono text-xs text-ink-faint">{e.period}</p>
              <p className="mt-2 text-sm text-ink-muted">{e.detail}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="eyebrow mb-3">focus areas</h2>
          <ul className="space-y-2 text-sm text-ink-muted">
            {siteConfig.focusAreas.map((f) => (
              <li key={f.title}>
                <span className="text-ink">{f.title}</span> — {f.description}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-ink-faint">
          Full work history, publications, and technical skills available in
          the PDF above.
        </p>
      </div>
    </div>
  );
}
