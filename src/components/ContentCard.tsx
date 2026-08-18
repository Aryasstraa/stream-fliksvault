"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Content } from "@/lib/types";

interface ContentCardProps {
  content: Content;
}

export default function ContentCard({ content }: ContentCardProps) {
  const [imgError, setImgError] = useState(false);
  const primaryGenre = content.genres?.[0]?.name ?? "Genre";
  const rating = content.rating?.toFixed(1) ?? "N/A";
  
  // Calculate a consistent random tone from 1 to 6 based on title
  const toneIndex = (content.title.length % 6) + 1;

  return (
    <Link href={`/nonton/${content.slug}`} className="card">
      <div className="poster">
        <div className={`tone t${toneIndex}`}></div>
        <svg
          className="emblem"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.4"
        >
          {content.type === "series" ? (
            <>
              <rect x="3" y="4" width="18" height="16" rx="1" />
              <path d="M3 9h18M8 4v5M16 4v5" />
            </>
          ) : (
            <>
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="2.4" />
              <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
            </>
          )}
        </svg>
        
        {content.poster_url && !imgError && (
          <Image
            src={content.poster_url}
            alt={content.title}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            style={{ objectFit: "cover", zIndex: 0 }}
            onError={() => setImgError(true)}
          />
        )}

        <span className="badge-type">{content.type === "series" ? "SERIES" : "FILM"}</span>
        <span className="badge-rating">
          <svg viewBox="0 0 24 24">
            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4.5L6 21l1.5-7.5L2 9h7z" />
          </svg>
          {rating}
        </span>
        <div className="play-hint-persistent">
          <div className="circ">
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="card-body">
        <h3>{content.title}</h3>
        <div className="meta">
          <span>{primaryGenre}</span>
          <span className="sep"></span>
          <span>{content.type === "series" ? (content.episodes?.length ? `${content.episodes.length} Episode` : (content.year ? `${content.year}` : 'Series')) : "1j 45m"}</span>
        </div>
      </div>
    </Link>
  );
}
