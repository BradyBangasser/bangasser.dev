"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { SearchDialog } from "@/components/SearchDialog";

const links = [
  { href: "/about", label: "about" },
  { href: "/projects", label: "projects" },
  { href: "/blog", label: "blog" },
  ...(siteConfig.features.consulting ? [{ href: "/consulting", label: "consulting" }] : []),
  { href: "/resume", label: "resume" },
  { href: "/contact", label: "contact" },
];

function openSearch() {
  window.dispatchEvent(new Event("open-search"));
}

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
          aria-label={`${siteConfig.name} - home`}
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
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search"
            className="ml-1 flex items-center gap-2 rounded-md border border-border-subtle px-2.5 py-2 font-mono text-xs text-ink-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <kbd className="text-[10px] tracking-wide">⌘K</kbd>
          </button>
        </nav>

        {/* mobile: search + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search"
            className="inline-flex items-center justify-center rounded-md p-2 text-ink-muted hover:bg-bg-elevated hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex items-center justify-center rounded-md p-2 text-ink-muted hover:bg-bg-elevated hover:text-ink"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {open ? (
                <>
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
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

      <SearchDialog />
    </header>
  );
}
