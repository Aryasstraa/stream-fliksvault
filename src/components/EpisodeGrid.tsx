"use client";

import { Episode } from "@/lib/types";

interface EpisodeGridProps {
  episodes: Episode[];
  type: "film" | "series";
  contentTitle: string;
}

/**
 * Memicu popunder Adsterra secara manual.
 * Adsterra menyimpan fungsi trigger-nya di document.onclick.
 * Kita sudah memblokir listener global itu di AdInjector.tsx,
 * dan menyimpannya di window.__adsterraTrigger agar bisa dipanggil di sini.
 */
function triggerPopunder() {
  const trigger = (window as any).__adsterraTrigger;
  if (typeof trigger === "function") {
    try {
      // Panggil fungsi Adsterra dengan simulasi event klik
      trigger(new MouseEvent("click", { bubbles: true, cancelable: true }));
    } catch (e) {
      // Abaikan error jika Adsterra belum ter-load
    }
  }
}

export default function EpisodeGrid({
  episodes,
  type,
  contentTitle,
}: EpisodeGridProps) {
  const handleClick = (episode: Episode) => {
    // 1. Picu Popunder Adsterra HANYA dari sini (tombol nonton)
    triggerPopunder();

    // 2. Redirect tab saat ini ke URL video eksternal setelah delay singkat
    setTimeout(() => {
      let url = episode.external_url;
      if (!url || url.trim() === "" || url === "N/A" || !url.includes(".")) {
        alert("Maaf, link nonton belum tersedia.");
        return;
      }
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      window.location.href = url;
    }, 200);
  };

  if (type === "film") {
    const episode = episodes[0];
    if (!episode) return null;
    return (
      <button
        className="eps-btn-film"
        onClick={() => handleClick(episode)}
      >
        ▶ Nonton {contentTitle} Sekarang
      </button>
    );
  }

  return (
    <div>
      <div className="episode-grid">
        {episodes.map((eps) => (
          <button
            key={eps.id}
            className="eps-btn"
            onClick={() => handleClick(eps)}
            title={`Episode ${eps.episode_number}`}
          >
            {eps.episode_number}
          </button>
        ))}
      </div>
      <p
        style={{
          marginTop: "0.75rem",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
        }}
      >
        💡 Klik episode untuk mulai nonton. Tab sponsor mungkin terbuka secara
        otomatis.
      </p>
    </div>
  );
}
