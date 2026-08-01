// Node-only exposition (prom-client). Imported ONLY by the /metrics route.
// Emits default Node process metrics + build_info, then appends the HTTP
// request/error counters recorded in the runtime-agnostic store.

import { Registry, collectDefaultMetrics, Gauge } from "prom-client";
import { store } from "@/lib/metrics-store";

const PREFIX = "bangasser_dev_";
const g = globalThis as unknown as { __promRegistry?: Registry };

function registry(): Registry {
  if (g.__promRegistry) return g.__promRegistry;
  const r = new Registry();
  collectDefaultMetrics({ register: r, prefix: PREFIX });
  new Gauge({
    name: `${PREFIX}build_info`,
    help: "Build metadata as labels; value is always 1.",
    labelNames: ["version", "commit", "node"],
    registers: [r],
  }).set(
    {
      version: process.env.npm_package_version ?? "0.0.0",
      commit: process.env.NEXT_PUBLIC_COMMIT_SHA ?? "dev",
      node: process.version,
    },
    1,
  );
  g.__promRegistry = r;
  return r;
}

function esc(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function renderMetrics(): Promise<{ body: string; contentType: string }> {
  const r = registry();
  let body = await r.metrics();
  const { requests, errors } = store();

  body += `\n# HELP ${PREFIX}http_requests_total Total HTTP requests by method and normalized route.\n`;
  body += `# TYPE ${PREFIX}http_requests_total counter\n`;
  for (const [key, val] of requests) {
    const [method, route] = key.split("\u0000");
    body += `${PREFIX}http_requests_total{method="${esc(method)}",route="${esc(route)}"} ${val}\n`;
  }

  body += `# HELP ${PREFIX}http_request_errors_total Total HTTP server errors (5xx) by route and status.\n`;
  body += `# TYPE ${PREFIX}http_request_errors_total counter\n`;
  for (const [key, val] of errors) {
    const [route, status] = key.split("\u0000");
    body += `${PREFIX}http_request_errors_total{route="${esc(route)}",status="${esc(status)}"} ${val}\n`;
  }

  return { body, contentType: r.contentType };
}
