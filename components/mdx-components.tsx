import Link from "next/link";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  a: ({ href = "", children, ...props }) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      className="overflow-x-auto rounded-lg border border-border bg-bg-panel !bg-[#0d1117] p-4 text-sm leading-relaxed"
    >
      {children}
    </pre>
  ),
  code: ({ children, ...props }) => (
    <code
      {...props}
      className="rounded bg-bg-panel px-1.5 py-0.5 font-mono text-[0.85em] text-accent-soft"
    >
      {children}
    </code>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="border-l-2 border-accent/40 pl-4 italic text-ink-muted"
    >
      {children}
    </blockquote>
  ),
};
