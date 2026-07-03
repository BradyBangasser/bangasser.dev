/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output produces a minimal, self-contained server bundle —
  // this is what makes the Docker image small and easy to run on any host.
  output: "standalone",
  reactStrictMode: true,
  images: {
    // Add remote patterns here if you host images externally (e.g. GitHub avatars).
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
    ],
  },
};

export default nextConfig;
