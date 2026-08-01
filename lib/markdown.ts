// Robust, sanitized Markdown -> HTML for repo-sourced content (READMEs, docs,
// repo blog posts). Unlike the MDX pipeline, this never throws on raw HTML,
// stray braces, or unclosed tags - exactly what arbitrary READMEs contain.

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "id", "align"],
    img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "width", "height", "loading"],
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
  },
};

export async function renderMarkdown(source: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(source ?? "");
  return String(file);
}
