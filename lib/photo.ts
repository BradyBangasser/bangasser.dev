import fs from "fs";
import path from "path";

/**
 * True only if a file referenced by a /public path actually exists on disk.
 * Lets components fall back gracefully instead of rendering a broken image
 * before the real photo has been added.
 */
export function publicFileExists(src: string): boolean {
  if (!src) return false;
  const clean = src.split(/[?#]/)[0].replace(/^\//, "");
  try {
    return fs.existsSync(path.join(process.cwd(), "public", clean));
  } catch {
    return false;
  }
}

/**
 * The subset of siteConfig.photo.pool whose files actually exist on disk.
 * Server-only (uses fs); pass the result to the RandomPortrait client
 * component so the random pick never lands on a missing file.
 */
import { siteConfig } from "@/lib/site-config";

export function poolPhotos(): { src: string; alt: string }[] {
  return (siteConfig.photo.pool ?? []).filter((p) => publicFileExists(p.src));
}
