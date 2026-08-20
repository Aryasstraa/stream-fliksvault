import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentCard from "@/components/ContentCard";
import { getCachedContentsByGenre, getCachedGenreSlugs } from "@/lib/data";

// ISR fallback untuk production CDN
export const revalidate = 300;

interface Props {
  params: Promise<{ genre: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;

  if (genre === "film") {
    return {
      title: "Nonton Film Sub Indo",
      description: "Daftar film terlengkap di MovieTeater.",
    };
  }

  if (genre === "semua") {
    return {
      title: "Semua Konten Sub Indo",
      description: "Daftar semua film dan serial terlengkap di MovieTeater.",
    };
  }

  const result = await getCachedContentsByGenre(genre);
  if (!result) return { title: "Kategori Tidak Ditemukan" };
  return {
    title: `Nonton ${result.pageTitle} Sub Indo`,
    description: `Daftar film dan serial ${result.pageTitle} terlengkap di MovieTeater.`,
  };
}

export async function generateStaticParams() {
  const genres = await getCachedGenreSlugs();
  const params = genres.map((g: { slug: string }) => ({ genre: g.slug }));
  params.push({ genre: "film" });
  params.push({ genre: "semua" });
  params.push({ genre: "drachin" });
  return params;
}

export default async function GenrePage({ params }: Props) {
  const { genre } = await params;

  const result = await getCachedContentsByGenre(genre);

  if (!result) notFound();

  const { contents, pageTitle } = result;

  return (
    <main className="wrap" style={{ paddingTop: "64px", paddingBottom: "64px", minHeight: "65vh" }}>
      <div className="section-head">
        <div>
          <div className="eyebrow">
            <span className="tick"></span>
            <span>Kategori</span>
          </div>
          <h2>{pageTitle}</h2>
        </div>
        <span style={{ color: "var(--text-dim)", fontSize: "13px", fontWeight: 600 }}>
          {contents.length} Konten
        </span>
      </div>

      {contents.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "5rem 0",
            color: "var(--text-faint)",
          }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</p>
          <p>Belum ada konten {pageTitle} yang tersedia.</p>
        </div>
      ) : (
        <div className="card-grid">
          {contents.map((content: any) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      )}
    </main>
  );
}
