import { execSync } from "node:child_process";

/** Short commit SHA for the footer build ID. Prefers the host's build env
 *  (Vercel / GitHub Actions), falls back to local git, then "dev". */
function commitSha() {
  const env = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
  if (env) return env.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim();
  } catch {
    return "dev";
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output produces a minimal, self-contained server bundle —
  // this is what makes the Docker image small and easy to run on any host.
  output: "standalone",
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha(),
  },
  images: {
    // Add remote patterns here if you host images externally (e.g. GitHub avatars).
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
    ],
  },
};

export default nextConfig;
