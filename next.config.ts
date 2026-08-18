import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 Public URL
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        // Jika menggunakan custom domain untuk R2
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_R2_PUBLIC_URL
          ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname
          : "pub-placeholder.r2.dev",
      },
      {
        // Unsplash untuk fallback/demo
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
