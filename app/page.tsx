import Link from "next/link";
import { ProfilePortrait } from "@/components/ProfilePortrait";
import { PostCard } from "@/components/PostCard";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);
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
                href="/consulting"
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent"
              >
                Consulting services
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <ProfilePortrait />
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

      {/* Consulting teaser */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-page px-6 py-16">
          <p className="eyebrow mb-3">// consulting</p>
          <h2 className="max-w-prose text-xl font-medium text-ink sm:text-2xl">
            Reliability, cloud security, and infrastructure consulting for teams
            that need senior systems help on a project basis.
          </h2>
          <Link
            href="/consulting"
            className="mt-6 inline-block rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent"
          >
            Learn more
          </Link>
        </div>
      </section>
    </>
  );
}
