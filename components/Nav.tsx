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

        {/* mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="inline-flex items-center justify-center rounded-md p-2 text-ink-muted hover:bg-bg-elevated hover:text-ink md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* mobile dropdown panel */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Primary"
          className="border-t border-border-subtle bg-bg/95 backdrop-blur-md md:hidden"
        >
          <ul className="mx-auto max-w-page px-4 py-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-3 py-3 font-mono text-sm uppercase tracking-wide no-underline transition-colors hover:bg-bg-elevated ${
                      active ? "text-accent" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
