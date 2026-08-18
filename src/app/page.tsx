import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import HeroCarousel from "@/components/HeroCarousel";
import ContentCard from "@/components/ContentCard";
import { getCachedAllContents } from "@/lib/data";

// ISR fallback untuk production CDN
export const revalidate = 300;

export const metadata: Metadata = {
  title: "FlixVault — Nonton Film & Anime Sub Indo",
};

export default async function HomePage() {
  // Gunakan cached fetcher — tidak hit Supabase jika data masih fresh

  const contents = await getCachedAllContents();
  const hero = contents[0] || null;
  const LATEST_CONTENTS = contents;
  const heroItems = contents.slice(0, 5);


  return (
    <>
      {/* === HERO SECTION === */}
      <HeroCarousel items={heroItems} />

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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
