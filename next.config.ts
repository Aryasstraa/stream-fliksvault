import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kompresi response aktif
  compress: true,

  // Optimasi gambar
  images: {
    // Cache gambar di CDN/browser selama 30 hari (default hanya 60 detik!)
    minimumCacheTTL: 2592000,

    // Ukuran device yang didukung — lebih sedikit = lebih sedikit variant yang di-generate
    deviceSizes: [640, 828, 1080, 1280, 1920],

    // Ukuran gambar untuk <Image> dengan `sizes` prop
    imageSizes: [64, 128, 200, 400],

    // Format modern WebP/AVIF lebih kecil dari JPEG
    formats: ["image/avif", "image/webp"],

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
