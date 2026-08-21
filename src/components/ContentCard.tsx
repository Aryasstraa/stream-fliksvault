import Link from "next/link";
import { Content } from "@/lib/types";

interface ContentCardProps {
  content: Content;
}

// Server Component — tidak ada "use client", dirender di server
export default function ContentCard({ content }: ContentCardProps) {
  const primaryGenre = content.genres?.[0]?.name ?? "Genre";
  const rating = content.rating?.toFixed(1) ?? "N/A";

  // Consistent tone index berdasarkan panjang judul (1-6)
  const toneIndex = (content.title.length % 6) + 1;

  return (
    <Link href={`/nonton/${content.slug}`} className="card">
      <div className="poster">
        <div className={`tone t${toneIndex}`}></div>

        {content.poster_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.poster_url}
            alt={content.title}
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
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
          <span>
            {content.type === "series"
              ? content.episodes?.length
                ? `${content.episodes.length} Episode`
                : content.year
                ? `${content.year}`
                : "Series"
              : "Film"}
          </span>
        </div>
      </div>
    </Link>
  );
}
