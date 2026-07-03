import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-page flex-col items-start px-6 py-24">
      <p className="font-mono text-sm text-signal">[ ERROR ]</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">404: route not found</h1>
      <p className="mt-3 max-w-prose text-ink-muted">
        Nothing resolved at this path. It may have moved, or never existed.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent"
      >
        Back to home
      </Link>
    </div>
  );
}
