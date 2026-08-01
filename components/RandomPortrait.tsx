"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

type Photo = { src: string; alt: string };

/**
 * Shows one photo picked at random from the given pool (already filtered to
 * files that exist). Renders the first entry on the server, then swaps to a
 * random one after mount, so each visit varies without a hydration mismatch.
 * Falls back to a clean monogram when the pool is empty.
 */
export function RandomPortrait({
  photos,
  aspect = "aspect-[4/5]",
  priority = false,
  glow = false,
  sizes = "(max-width: 1024px) 80vw, 384px",
}: {
  photos: Photo[];
  aspect?: string;
  priority?: boolean;
  glow?: boolean;
  sizes?: string;
}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (photos.length > 1) setIdx(Math.floor(Math.random() * photos.length));
  }, [photos.length]);

  const photo = photos[idx];

  return (
    <div className="relative w-full max-w-sm">
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-accent/10 blur-2xl"
        />
      )}
      <div className={`relative ${aspect} overflow-hidden rounded-2xl border border-border bg-bg-elevated`}>
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-6xl font-semibold text-ink-faint">
              {initials(siteConfig.name)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
