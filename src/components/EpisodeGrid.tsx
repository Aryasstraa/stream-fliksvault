"use client";

import { Episode } from "@/lib/types";
import { useEffect, useState } from "react";

interface EpisodeGridProps {
  episodes: Episode[];
  type: "film" | "series";
  contentTitle: string;
}

export default function EpisodeGrid({
  episodes,
  type,
  contentTitle,
}: EpisodeGridProps) {
  // Popunder ditangani secara otomatis oleh script Adsterra yang diinjeksi secara global.

  const handleClick = (episode: Episode) => {
    // 1. Redirect tab saat ini ke URL video eksternal
    // Kita berikan delay sedikit (200ms) agar script Adsterra sempat menangkap event click
    // dan membuka popundernya sebelum halaman ini berpindah.
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
