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
  const [popunderUrl, setPopunderUrl] = useState<string>("");

  useEffect(() => {
    // Ambil URL popunder dari API (Settings)
    fetch("/api/settings?key=popunder_script_url")
      .then((res) => res.json())
      .then((data) => {
        if (data.value) setPopunderUrl(data.value);
      })
      .catch(() => {});
  }, []);

  const handleClick = (episode: Episode) => {
    // 1. Trigger Popunder (buka tab baru di background)
    if (popunderUrl) {
      const pop = window.open(popunderUrl, "_blank", "noopener,noreferrer");
      if (pop) {
        pop.blur();
        window.focus();
      }
    }

    // 2. Redirect tab saat ini ke URL video eksternal
    setTimeout(() => {
      window.location.href = episode.external_url;
    }, 100);
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
