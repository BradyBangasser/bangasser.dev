import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Consulting",
  description:
    "Site reliability, cloud security, DevOps, HPC, and ML security consulting.",
};

export default function ConsultingPage() {
  return (
    <div className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <p className="eyebrow mb-4">// consulting</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Consulting</h1>
      <p className="mt-4 max-w-prose text-ink-muted">
        {siteConfig.consulting.intro}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {siteConfig.consulting.services.map((service, i) => (
          <div key={service.title} className="card px-6 py-6">
            <span className="font-mono text-xs text-ink-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-2 text-lg font-medium text-ink">{service.title}</h2>
            <p className="mt-2 text-sm text-ink-muted">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 max-w-prose card px-6 py-6">
        <h2 className="eyebrow mb-2">get in touch</h2>
        <p className="text-sm text-ink-muted">{siteConfig.consulting.contactNote}</p>
        <a
          href={`mailto:${siteConfig.email}?subject=Consulting inquiry`}
          className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg no-underline transition-opacity hover:opacity-90"
        >
          Email {siteConfig.email}
        </a>
      </div>
    </div>
  );
}
