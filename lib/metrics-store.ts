// Runtime-agnostic counters. NO prom-client here, so this is safe to import
// from middleware and instrumentation (which may be bundled for the Edge
// runtime). State lives on globalThis so every module in the same Node process
// shares it; the /metrics route reads it back out.

type Store = { requests: Map<string, number>; errors: Map<string, number> };

const g = globalThis as unknown as { __metricsStore?: Store };

export function store(): Store {
  if (!g.__metricsStore) g.__metricsStore = { requests: new Map(), errors: new Map() };
  return g.__metricsStore;
}

// Collapse dynamic path segments to keep label cardinality bounded.
export function normalizeRoute(pathname: string): string {
  if (pathname === "/" || pathname === "") return "/";
  if (/^\/blog\/[^/]+\/content\/[^/]+\/?$/.test(pathname)) return "/blog/[slug]/content/[post]";
  if (/^\/blog\/[^/]+\/?$/.test(pathname)) return "/blog/[slug]";
  if (/^\/projects\/[^/]+\/?$/.test(pathname)) return "/projects/[slug]";
  return pathname.replace(/\/+$/, "") || "/";
}

export function recordRequest(method: string, route: string): void {
  const m = store().requests;
  const key = `${method}\u0000${route}`;
  m.set(key, (m.get(key) ?? 0) + 1);
}

export function recordError(route: string, status: string | number = 500): void {
  const m = store().errors;
  const key = `${route}\u0000${String(status)}`;
  m.set(key, (m.get(key) ?? 0) + 1);
}
