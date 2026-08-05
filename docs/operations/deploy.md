# Deploying

Pushing to `main` builds a standalone image and pushes it to GHCR via
`.github/workflows/docker-build.yml`. The builder installs `python3` so the repo
scan runs. The production server is `node .next/standalone/server.js` (what the
container runs); `next start` does not work with `output: standalone`.
