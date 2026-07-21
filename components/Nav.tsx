"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close the mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-page items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-mono text-sm text-ink no-underline hover:text-accent"
          aria-label={`${siteConfig.name} — home`}
        >
          <span className="text-ink-faint">brady@bangasser</span>
          <span className="text-accent">:</span>
          <span className="text-ink-faint">~$</span>
        </Link>

        {/* desktop links */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wide no-underline transition-colors hover:bg-bg-elevated hover:text-ink ${
                  active ? "text-accent" : "text-ink-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* mobile hamburger — three bars that morph into an X */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="inline-flex items-center justify-center rounded-md p-2 text-ink-muted hover:bg-bg-elevated hover:text-ink md:hidden"
        >
          <span className="relative block h-4 w-6" aria-hidden="true">
            <span className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out ${open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 rounded-full bg-current transition-all duration-200 ease-in-out ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out ${open ? "bottom-1/2 translate-y-1/2 -rotate-45" : "bottom-0"}`} />
          </span>
        </button>
      </div>

      {/* mobile dropdown panel — slides open, always mounted so it can animate */}
      <nav
        id="mobile-menu"
        aria-label="Primary"
        aria-hidden={!open}
        className={`overflow-hidden bg-bg/95 backdrop-blur-md transition-all duration-300 ease-in-out md:hidden ${
          open ? "max-h-96 border-t border-border-subtle opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <ul className="mx-auto max-w-page px-4 py-2">
          {links.map((link, i) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  style={{ transitionDelay: open ? `${i * 30}ms` : "0ms" }}
                  className={`block translate-y-0 rounded-md px-3 py-3 font-mono text-sm uppercase tracking-wide no-underline transition-all duration-300 hover:bg-bg-elevated ${
                    open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                  } ${active ? "text-accent" : "text-ink-muted hover:text-ink"}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
