import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProjects, getProjectDocs, resolveDoc, buildDocsNav, docToUrlPath,
} from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { DocsShell } from "@/components/DocsShell";

export function generateStaticParams() {
  const params: { slug: string; path: string[] }[] = [];
  for (const p of getAllProjects()) {
    const docs = getProjectDocs(p.slug);
    for (const d of docs) {
      const up = docToUrlPath(d.path);
      params.push({ slug: p.slug, path: up ? up.split("/") : [] });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; path?: string[] }>;
}): Promise<Metadata> {
  const { slug, path } = await params;
  const doc = resolveDoc(getProjectDocs(slug), (path ?? []).join("/"));
  const project = getAllProjects().find((p) => p.slug === slug);
  return { title: doc ? `${doc.title} · ${project?.title ?? slug} docs` : "Docs" };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string; path?: string[] }>;
}) {
  const { slug, path } = await params;
  const docs = getProjectDocs(slug);
  if (docs.length === 0) notFound();

  const urlPath = (path ?? []).join("/");
  const doc = resolveDoc(docs, urlPath) ?? resolveDoc(docs, "");
  if (!doc) notFound();

  const project = getAllProjects().find((p) => p.slug === slug);
  const nav = buildDocsNav(docs);
  const html = await renderMarkdown(doc.content);

  return (
    <DocsShell
      slug={slug}
      projectTitle={project?.title ?? slug}
      nav={nav}
      activePath={docToUrlPath(doc.path)}
      contentHtml={html}
      docsUrl={project?.docsUrl}
    />
  );
}
