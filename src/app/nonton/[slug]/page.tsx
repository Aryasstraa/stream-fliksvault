import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import EpisodeGrid from "@/components/EpisodeGrid";
import AdInjector from "@/components/AdInjector";
import { getCachedContentBySlug, getCachedContentSlugs } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { formatRating } from "@/lib/utils";

// ISR fallback untuk production CDN
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

// Helper: pakai cached fetcher, bukan query langsung ke Supabase
async function getContent(slug: string) {
  return getCachedContentBySlug(slug);
}

// ============================================================
// SSR: Generate Open Graph Metadata per Film (Kritis untuk Sosmed)
// ============================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Gunakan Next.js fetch dedupe — query sama tidak akan di-fire ulang dalam satu render
  const content = await getContent(slug);

  if (!content) {
    return { title: "Konten Tidak Ditemukan" };
  }

  const title = `Nonton ${content.title} Sub Indo`;
  const description =
    content.synopsis?.slice(0, 160) ??
    `Nonton ${content.title} online gratis di MovieTeater.`;

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
  const slugs = await getCachedContentSlugs();
  return slugs.map((c: { slug: string }) => ({ slug: c.slug }));
}

export default async function DetailPage({ params }: Props) {
  const { slug } = await params;

  const content = await getContent(slug);
  const { data: settings } = await supabase.from("settings").select("*");

  if (!content) notFound();

  const episodes = content.episodes ?? [];
  const genres = content.genres ?? [];

  const popunderScript = settings?.find((s: any) => s.key === "popunder_script_url")?.value ?? "";
  const nativeBannerScript = settings?.find((s: any) => s.key === "native_banner_url")?.value ?? "";

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  content.poster_url ??
                  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80"
                }
                alt={`Poster ${content.title}`}
                style={{ width: "100%", height: "auto", borderRadius: "8px", display: "block" }}
                loading="eager"
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

      {/* Popunder Injection (Global for this page) */}
      {popunderScript && <AdInjector htmlContent={popunderScript} />}
    </>
  );
}
