# Metrics (Prometheus)

`GET /metrics` returns Prometheus exposition format: default Node.js process
metrics, `bangasser_dev_build_info`, `bangasser_dev_http_requests_total{method,route}`,
and `bangasser_dev_http_request_errors_total{route,status}`. The 500 rate is a
PromQL ratio:

```
rate(bangasser_dev_http_request_errors_total[5m])
  / rate(bangasser_dev_http_requests_total[5m])
```

Request counting uses a Node-runtime `middleware.ts`; error counting uses
`instrumentation.ts`. Most useful on the long-running Docker deployment.
