import Link from "next/link";
import { RandomPortrait } from "@/components/RandomPortrait";
import { PostCard } from "@/components/PostCard";
import { ProjectCard } from "@/components/ProjectCard";
import { PipelineCarousel } from "@/components/PipelineCarousel";
import { getAllPosts, getAllProjects, getPipelineArticles } from "@/lib/content";
import { poolPhotos } from "@/lib/photo";
import { siteConfig } from "@/lib/site-config";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);
  const pipeline = getPipelineArticles();
  const photos = poolPhotos();
  const projects = getAllProjects()
    .filter((p) => p.featured)
    .slice(0, 3);
  const fallbackProjects = projects.length ? projects : getAllProjects().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-page px-6 pb-20 pt-14 sm:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow mb-4">// {siteConfig.role}</p>
            <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl">
              {siteConfig.name}
            </h1>
            <p className="mt-5 max-w-prose text-base text-ink-muted sm:text-lg">
              {siteConfig.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg no-underline transition-opacity hover:opacity-90"
              >
                View projects
              </Link>
              <Link
                href="/resume"
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent"
              >
                Resume
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <RandomPortrait photos={photos} priority glow />
          </div>
        </div>
      </section>

      {/* Focus areas */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-page px-6 py-16">
          <p className="eyebrow mb-6">// focus areas</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {siteConfig.focusAreas.map((area) => (
              <div key={area.title} className="card px-5 py-5">
                <h2 className="text-base font-medium text-ink">{area.title}</h2>
                <p className="mt-1.5 text-sm text-ink-muted">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      {fallbackProjects.length > 0 && (
        <section className="border-t border-border-subtle">
          <div className="mx-auto max-w-page px-6 py-16">
            <div className="mb-6 flex items-end justify-between">
              <p className="eyebrow">// projects</p>
              <Link href="/projects" className="font-mono text-xs text-ink-muted no-underline hover:text-accent">
                view all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fallbackProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* In the pipeline */}
      {pipeline.length > 0 && (
        <section className="border-t border-border-subtle">
          <div className="mx-auto max-w-page px-6 py-16">
            <PipelineCarousel articles={pipeline} />
          </div>
        </section>
      )}

      {/* Recent posts */}
      {posts.length > 0 && (
        <section className="border-t border-border-subtle">
          <div className="mx-auto max-w-page px-6 py-16">
            <div className="mb-6 flex items-end justify-between">
              <p className="eyebrow">// writing</p>
              <Link href="/blog" className="font-mono text-xs text-ink-muted no-underline hover:text-accent">
                view all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Consulting - low-key, flag-gated */}
      {siteConfig.features.consulting && (
        <section className="border-t border-border-subtle">
          <div className="mx-auto flex max-w-page flex-wrap items-baseline justify-between gap-2 px-6 py-8">
            <p className="text-sm text-ink-muted">
              Available for a limited number of reliability, cloud, and infrastructure engagements.
            </p>
            <Link
              href="/consulting"
              className="font-mono text-xs text-ink-muted no-underline hover:text-accent"
            >
              consulting →
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
