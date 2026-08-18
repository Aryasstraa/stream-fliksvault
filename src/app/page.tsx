import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ContentCard from "@/components/ContentCard";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "FlixVault — Nonton Film & Anime Sub Indo",
};

export default async function HomePage() {
  const { data: trending } = await supabase
    .from("contents")
    .select("*, genres(*)")
    .order("rating", { ascending: false })
    .limit(1);

  const { data: latest } = await supabase
    .from("contents")
    .select("*, genres(*)")
    .order("created_at", { ascending: false })
    .limit(12);

  const hero = trending?.[0] || null;
  const LATEST_CONTENTS = latest || [];

  return (
    <>
      {/* === HERO SECTION === */}
      {hero ? (
        <section className="hero">
          <div className="hero-bg"></div>
          <div className="wrap hero-layout">
            <div className="hero-content">
              <div className="badge-row">
                <span className="chip trend">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c1 2 1 4 0 6a7 7 0 1 1-9-11c1.5-1 3.5-1 5-2z" />
                  </svg>
                  Trending
                </span>
                <span className="chip outline">
                  {hero.genres?.[0]?.name || "Genre"} • {hero.year || new Date().getFullYear()}
                </span>
              </div>

              <h1>
                {hero.title}
              </h1>

              <p className="desc">{hero.synopsis}</p>

              <div className="cta-row">
                <Link href={`/nonton/${hero.slug}`} className="btn primary">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Nonton Sekarang
                </Link>
                <Link href={`/nonton/${hero.slug}`} className="btn ghost">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8h.01M11 12h1v5h1" />
                  </svg>
                  Detail Info
                </Link>
              </div>
            </div>
            
            <div className="hero-poster">
              {hero.poster_url && (
                <div className="hero-poster-wrapper">
                  <Image 
                    src={hero.poster_url} 
                    alt={hero.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 400px" 
                    style={{ objectFit: 'cover' }} 
                  />
                  <div className="hero-poster-overlay">
                    <span className="hero-poster-label">FLIXVAULT ORIGINAL</span>
                    <span className="hero-poster-tagline">Pelajaran terbesar selalu punya harga.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="hero" style={{ minHeight: "40vh" }}>
          <div className="wrap">
            <h1>Belum Ada Konten</h1>
          </div>
        </section>
      )}

      {/* === CONTENT GRID === */}
      <main className="wrap">
        <section className="row-section">
          <div className="section-head">
            <div>
              <div className="eyebrow">
                <span className="tick"></span>
                <span>Baru ditambahkan</span>
              </div>
              <h2>Update Terbaru</h2>
            </div>
            <Link href="/semua" className="see-all">
              Lihat Semua
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="card-grid">
            {LATEST_CONTENTS.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </section>

        <section className="row-section">
          <div className="section-head">
            <div>
              <div className="eyebrow">
                <span className="tick"></span>
                <span>Paling banyak ditonton</span>
              </div>
              <h2>Anime Populer</h2>
            </div>
            <Link href="/anime" className="see-all">
              Lihat Semua
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="card-grid">
            {LATEST_CONTENTS.filter((c: any) =>
              c.genres?.some((g: any) => g.slug === "anime")
            ).map((content: any) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </section>

        <section className="row-section">
          <div className="section-head">
            <div>
              <div className="eyebrow">
                <span className="tick"></span>
                <span>Paling banyak ditonton</span>
              </div>
              <h2>Drama Korea</h2>
            </div>
            <Link href="/drakor" className="see-all">
              Lihat Semua
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="card-grid">
            {LATEST_CONTENTS.filter((c: any) =>
              c.genres?.some((g: any) => g.slug === "drakor")
            ).map((content: any) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
