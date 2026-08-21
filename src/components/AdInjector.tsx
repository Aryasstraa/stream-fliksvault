"use client";

import { useEffect, useRef } from "react";

export default function AdInjector({ htmlContent }: { htmlContent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !htmlContent) return;
    const container = containerRef.current;

    // Inject script menggunakan createContextualFragment agar tag <script> bisa dieksekusi
    const slotHtml = document.createRange().createContextualFragment(htmlContent);
    container.innerHTML = "";
    container.appendChild(slotHtml);

    // ================================================================
    // BLOKIR LISTENER KLIK GLOBAL ADSTERRA
    // Adsterra Popunder secara bawaan hook ke document.onclick.
    // Kita replace dengan versi kosong agar hanya bisa dipicu manual.
    // ================================================================
    const blockGlobalClick = () => {
      // Tunggu sedikit agar script Adsterra sempat ter-load, lalu kita override
      const timer = setTimeout(() => {
        const originalOnClick = document.onclick;
        if (originalOnClick) {
          // Simpan fungsi asli Adsterra agar bisa kita panggil secara manual
          (window as any).__adsterraTrigger = originalOnClick;
          // Ganti onclick global dengan null → Adsterra tidak terpicu sembarang klik
          document.onclick = null;
        }
      }, 800);

      return () => clearTimeout(timer);
    };

    const cleanup = blockGlobalClick();
    return cleanup;
  }, [htmlContent]);

  return <div ref={containerRef} style={{ display: "contents" }} />;
}
