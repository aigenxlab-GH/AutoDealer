import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project has its own lockfile; pin the workspace root to silence the
  // multi-lockfile inference warning.
  turbopack: { root: __dirname },
  // The animated dev indicator keeps the renderer from going idle, which blocks
  // automated screenshots. Off in dev; has no effect on production.
  devIndicators: false,
  images: {
    remotePatterns: [
      // Mock seed photos.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Real media pipeline (Phase 7).
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
