import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentCard from "@/components/ContentCard";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ genre: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  
  if (genre === "film") {
    return {
      title: "Nonton Film Sub Indo",
      description: "Daftar film terlengkap di FlixVault.",
    };
  }
  
  if (genre === "semua") {
    return {
      title: "Semua Konten Sub Indo",
      description: "Daftar semua film dan serial terlengkap di FlixVault.",
    };
  }

  const { data: genreData } = await supabase.from("genres").select("*").eq("slug", genre).single();
  
  if (!genreData) return { title: "Kategori Tidak Ditemukan" };
  return {
    title: `Nonton ${genreData.name} Sub Indo`,
    description: `Daftar film dan serial ${genreData.name} terlengkap di FlixVault.`,
  };
}

export async function generateStaticParams() {
  const { data: genres } = await supabase.from("genres").select("slug");
  const params = (genres || []).map((g) => ({ genre: g.slug }));
  params.push({ genre: "film" }); // Menambahkan rute statis untuk /film
  params.push({ genre: "semua" }); // Menambahkan rute statis untuk /semua
  return params;
}

export default async function GenrePage({ params }: Props) {
  const { genre } = await params;

  let pageTitle = "";
  let contents = null;

  if (genre === "film") {
    pageTitle = "Semua Film";
    const { data } = await supabase
      .from("contents")
      .select("*, genres(*)")
      .eq("type", "film")
      .order("created_at", { ascending: false });
    contents = data;
  } else if (genre === "semua") {
    pageTitle = "Semua Konten";
    const { data } = await supabase
      .from("contents")
      .select("*, genres(*)")
      .order("created_at", { ascending: false });
    contents = data;
  } else {
    const { data: genreData } = await supabase.from("genres").select("*").eq("slug", genre).single();
    if (!genreData) notFound();
    
    pageTitle = genreData.name;
    // Supabase Many-to-Many fetching: Get contents where genres.slug == genre
    const { data } = await supabase
      .from("contents")
      .select("*, genres!inner(*)")
      .eq("genres.slug", genre)
      .order("created_at", { ascending: false });
    contents = data;
  }
    
  const filtered = contents || [];

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
          {filtered.length} Konten
        </span>
      </div>

      {filtered.length === 0 ? (
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
          {filtered.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      )}
    </main>
  );
}
