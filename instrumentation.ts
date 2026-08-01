// Counts server errors (5xx). With http_requests_total this yields the 500
// error rate in PromQL:
//   rate(bangasser_dev_http_request_errors_total[5m])
//     / rate(bangasser_dev_http_requests_total[5m])

export async function onRequestError(
  _error: unknown,
  request: { path?: string },
  context: { routePath?: string },
) {
  try {
    const { recordError, normalizeRoute } = await import("@/lib/metrics-store");
    const route = context?.routePath || normalizeRoute(request?.path ?? "unknown");
    recordError(route, 500);
  } catch {
    /* ignore */
  }
}
