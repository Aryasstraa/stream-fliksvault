import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kompresi response aktif
  compress: true,

  // Security Headers — mencegah XSS, Clickjacking, MIME sniffing, dll.
  async headers() {
    return [
      {
        // Terapkan ke semua route
        source: "/(.*)",
        headers: [
          // Mencegah Clickjacking (iframe dari domain lain)
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Mencegah MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer Policy — batasi info referrer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy — nonaktifkan fitur browser berbahaya
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // XSS Protection (untuk browser lama)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        // Khusus halaman admin — tambah no-cache & no-store untuk mencegah
        // browser menyimpan halaman sensitif di cache
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, private",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
    ];
  },

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
        // Mengizinkan semua domain HTTPs karena gambar bisa berasal dari berbagai sumber eksternal (TMDB, Pinterest, dll)
        protocol: "https",
        hostname: "**",
      },
      {
        // Mengizinkan HTTP untuk fallback
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
