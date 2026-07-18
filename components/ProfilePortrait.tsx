import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { publicFileExists } from "@/lib/photo";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Hero portrait. Reads siteConfig.photo.hero. Falls back to a clean monogram
 * whenever the file isn't present yet, so the layout never breaks.
 */
export function ProfilePortrait() {
  const { src, alt } = siteConfig.photo.hero;
  const hasPhoto = publicFileExists(src);

  return (
    <div className="relative w-full max-w-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-accent/10 blur-2xl"
      />
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-bg-elevated">
        {hasPhoto ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 80vw, 384px"
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
