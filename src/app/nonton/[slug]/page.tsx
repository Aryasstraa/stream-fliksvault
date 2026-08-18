import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import EpisodeGrid from "@/components/EpisodeGrid";
import { supabase } from "@/lib/supabase";
import { formatRating } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

// ============================================================
// SSR: Generate Open Graph Metadata per Film (Kritis untuk Sosmed)
// ============================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: content } = await supabase.from("contents").select("*").eq("slug", slug).single();

  if (!content) {
    return { title: "Konten Tidak Ditemukan" };
  }

  const title = `Nonton ${content.title} Sub Indo`;
  const description =
    content.synopsis?.slice(0, 160) ??
    `Nonton ${content.title} online gratis di FlixVault.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: content.poster_url ? [{ url: content.poster_url, width: 400, height: 600 }] : [],
      type: "video.movie",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: content.poster_url ? [content.poster_url] : [],
    },
  };
}

export async function generateStaticParams() {
  const { data: contents } = await supabase.from("contents").select("slug");
  return (contents || []).map((c) => ({ slug: c.slug }));
}

export default async function DetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: content } = await supabase
    .from("contents")
    .select("*, genres(*), episodes(*)")
    .eq("slug", slug)
    .single();

  if (!content) notFound();

  const episodes = content.episodes ?? [];
  const genres = content.genres ?? [];

  return (
    <>
      {/* === BANNER HERO === */}
      <div className="detail-hero">
        <div
          className="detail-hero-bg"
          style={{ backgroundImage: `url('${content.banner_url}')` }}
        />
        <div className="detail-hero-overlay" />
      </div>

      {/* === DETAIL LAYOUT === */}
      <div className="container">
        <div className="detail-layout">
          {/* Poster */}
          <aside>
            <div className="detail-poster">
              <Image
                src={
                  content.poster_url ??
                  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80"
                }
                alt={`Poster ${content.title}`}
                width={400}
                height={590}
                style={{ width: "100%", height: "auto" }}
                priority
              />
            </div>
          </aside>

          {/* Info */}
          <section className="detail-info">
            {/* Genres */}
            <div className="detail-genres">
              {genres.map((g: any) => (
                <span key={g.id} className="genre-chip">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="detail-title">{content.title}</h1>

            {/* Stats */}
            <div className="detail-stats">
              <span className="detail-rating">
                ⭐ {formatRating(content.rating ?? 0)}
              </span>
              <span>|</span>
              <span>{content.year}</span>
              <span>|</span>
              <span style={{ textTransform: "capitalize" }}>
                {content.type === "series"
                  ? `${episodes.length} Episode`
                  : "Film"}
              </span>
            </div>

            {/* Synopsis */}
            <p className="detail-synopsis">{content.synopsis}</p>

            {/* Episode Section */}
            <div className="episode-section-title">
              {content.type === "film" ? "Tautan Nonton" : "Pilih Episode"}
            </div>

            <EpisodeGrid
              episodes={episodes}
              type={content.type}
              contentTitle={content.title}
            />
          </section>
        </div>
      </div>
    </>
  );
}
