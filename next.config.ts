import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  experimental: {
    // allow product photo uploads up to 8 MB from the admin area
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;

// Gives `next dev` access to the local Cloudflare database (D1) and image storage (R2)
initOpenNextCloudflareForDev();
