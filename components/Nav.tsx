import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const links = [
  { href: "/about", label: "about" },
  { href: "/projects", label: "projects" },
  { href: "/blog", label: "blog" },
  { href: "/consulting", label: "consulting" },
  { href: "/resume", label: "resume" },
  { href: "/contact", label: "contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-page items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-mono text-sm text-ink no-underline hover:text-accent"
          aria-label={`${siteConfig.name} — home`}
        >
          <span className="text-ink-faint">brady@bangasser</span>
          <span className="text-accent">:</span>
          <span className="text-ink-faint">~$</span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-0.5 overflow-x-auto sm:gap-1"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-2.5 py-2 font-mono text-xs uppercase tracking-wide text-ink-muted no-underline transition-colors hover:bg-bg-elevated hover:text-ink sm:px-3"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
