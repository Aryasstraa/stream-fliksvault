import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomAd from "@/components/BottomAd";
import Link from "next/link";
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--disp",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--body",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--mono",
});

export const metadata: Metadata = {
  title: {
    default: "MovieTeater - Nonton Film & Series Lengkap",
    template: "%s | MovieTeater",
  },
  description:
    "Platform streaming film, series, anime, dan drama Korea terlengkap. Nonton gratis dengan kualitas terbaik.",
  openGraph: {
    siteName: "MovieTeater",
    type: "website",
  },
  icons: {
    icon: '/icon1.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${bebasNeue.variable} ${plusJakartaSans.variable} ${spaceMono.variable}`}
      >
        <div className="grain"></div>
        <Navbar />
        <main>{children}</main>
        <footer>
          <div className="wrap foot-row">
            <div>
              <div className="foot-logo">
                FLIX<span className="vault">VAULT</span>
              </div>
              <p style={{ marginTop: "6px" }}>
                Lebih sedikit mencari. Lebih banyak<br />
                menikmati cerita yang layak ditonton.
              </p>
              <p style={{ marginTop: "24px", fontSize: "10px" }}>
                © {new Date().getFullYear()} MovieTeater. Khusus tontonan untuk setiap suasana.
              </p>
            </div>
            <div className="foot-partners" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <svg height="24" viewBox="0 0 111 30" fill="var(--text-faint)" xmlns="http://www.w3.org/2000/svg">
                <path d="M105.06 14.28L111 30h-7.5l-3.3-8.8-3.3 8.8h-7.5l5.94-15.72L90.42 0h7.62l2.76 7.62L103.56 0h7.62l-6.12 14.28zM86.16 30h-7.02V0h7.02v30zM61.98 30h-7.02V0h7.02v30zM47.76 30h-7.02V4.92h-7.68V0h22.38v4.92h-7.68V30zM22.5 30h-7.02V13.8L5.58 30H0V0h7.02v16.2L17.04 0h5.46v30zM79.32 30h-11.88V0h11.88v4.92h-4.86v7.32h4.5v4.86h-4.5v8.1h4.86V30z" />
              </svg>
              <svg height="20" viewBox="0 0 100 30" fill="var(--text-faint)" xmlns="http://www.w3.org/2000/svg">
                <path d="M84.14 16.5c-4.87-1-7.25-1.92-7.25-4.48 0-1.84 1.76-3.23 4.88-3.23 3.65 0 6.6 1.48 8.65 2.82l2.3-5.2C89.65 4.6 85.3 3.4 81 3.4c-6.85 0-11.75 3.52-11.75 8.95 0 5.86 4.97 7.7 10.93 8.98 5 1.05 7.15 2 7.15 4.64 0 2.22-1.9 3.54-5.32 3.54-4.56 0-8.22-2-10.4-3.85l-2.73 5.4c3.15 2.44 8 4 12.8 4 7.68 0 12.44-3.66 12.44-9.35.03-5.37-4.35-7.46-10-8.6M64 4.1h-6.23v25.2h6.22c4.1 0 7-1 8.84-3.22 1.6-1.97 2.37-4.87 2.37-8.98 0-4.44-.82-7.37-2.52-9.4C70.83 5.4 67.88 4.1 64 4.1m-.34 20.3h-1.3V8.65h1.3c2.47 0 4.12.82 4.96 2.36 1.07 2 1.25 4.14 1.25 7.42 0 2.8-.23 4.93-1.16 6.77-.92 1.83-2.67 2.76-5.06 2.76" />
                <path d="M49 20V9.86h-4V20h4zm-2.02-12.7c1.37 0 2.4-.95 2.4-2.22 0-1.25-.97-2.18-2.33-2.18-1.35 0-2.38.93-2.38 2.2 0 1.26 1.03 2.2 2.3 2.2M34.8 9.9l4.5 13.9 4.65-13.88h4.63V29.3H44.6V15.5l-4.45 13.8h-1.12L34.5 15.42v13.87h-3.95V9.87M24.7 9.87h-2.14v19.43h4V19h1.16c3.48 0 6.06-1.07 7.57-3.14C36.4 14.36 36.65 12.7 36.65 10c0-.1 0-.15-.02-.25M26.54 15.6h-2v-2.3h2c1.78 0 2.92-.08 3.52-.77.58-.65.73-1.46.73-3.23 0-1.87-.2-2.73-.8-3.4-.64-.7-1.85-1.1-3.66-1.1h-4v24.5h4v-10h.85l3.22 10h4.44l-3.8-10.7c2-.46 3.4-1.54 4.14-3 1.15-2.25 1.15-5.26.04-7.6C34.46 6.8 31.62 5.5 27 5.5h-8v23.8" />
                <path d="M44.92 37.45c-4.9-1.32-9.6-4.57-13.56-9.1-3.15-3.57-6-8.58-6.17-13-.1-2.9.23-6.52.23-6.52s.37 3.5 1 5.3c1.55 4.3 4.37 8.32 7.73 11 5 4 11.23 6 18.27 6.13 6.94.13 13.82-1.8 19.88-5.32 4.14-2.4 8.24-6.07 10.9-10.05 1.25-1.88 2.6-4.46 3.17-6.57 0 0 .47 3.53.16 6.4-.48 4.28-2.6 8.94-5.38 12.37-3.67 4.54-8.1 7.6-13 8.96-7.58 2.1-15.86 1.7-23.23-.6M85 18.23s3.47 2.37 6.46 2c2.4-.3 4.2-2.12 5.2-4.14 0 0-1.8 2-4.1 2.44-2.8.53-6.42-.48-7.57-.3" />
              </svg>
            </div>
          </div>
        </footer>
        <BottomAd />
      </body>
    </html>
  );
}
