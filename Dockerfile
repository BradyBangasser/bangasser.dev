# syntax=docker/dockerfile:1

# ---- deps: install dependencies -------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- builder: run the GitHub scan + Next.js build --------------------------
FROM node:22-alpine AS builder
WORKDIR /app
# python3 is required by prebuild (scripts/fetch_github.py, stdlib only)
RUN apk add --no-cache python3
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Optional: pass a token at build time to raise GitHub API rate limits.
# docker build --build-arg GITHUB_TOKEN=xxxx .
ARG GITHUB_USERNAME=BradyBangasser
ARG GITHUB_TOKEN
ENV GITHUB_USERNAME=${GITHUB_USERNAME}
ENV GITHUB_TOKEN=${GITHUB_TOKEN}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runner: minimal production image --------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# `output: "standalone"` (see next.config.mjs) traces only the files the
# server actually needs — this is what keeps the final image small.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
