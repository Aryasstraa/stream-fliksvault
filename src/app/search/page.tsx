import type { Metadata } from "next";
import ContentCard from "@/components/ContentCard";
import { supabase } from "@/lib/supabase";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q;
  
  if (!q) {
    return {
      title: "Pencarian",
      description: "Cari film dan anime di FlixVault.",
    };
  }
  
  return {
    title: `Pencarian: ${q} — FlixVault`,
    description: `Hasil pencarian untuk "${q}" di FlixVault.`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || "";

  let contents: any[] = [];
  
  if (q.trim()) {
    const { data } = await supabase
      .from("contents")
      .select("*, genres(*)")
      .ilike("title", `%${q}%`)
      .order("created_at", { ascending: false });
      
    contents = data || [];
  }

  return (
    <main className="wrap" style={{ paddingTop: "64px", paddingBottom: "64px", minHeight: "65vh" }}>
      <div className="section-head">
        <div>
          <div className="eyebrow">
            <span className="tick"></span>
            <span>Hasil Pencarian</span>
          </div>
          <h2>{q ? `Mencari "${q}"` : "Pencarian"}</h2>
        </div>
        <span style={{ color: "var(--text-dim)", fontSize: "13px", fontWeight: 600 }}>
          {contents.length} Konten
        </span>
      </div>

      {!q.trim() ? (
        <div
          style={{
            textAlign: "center",
            padding: "5rem 0",
            color: "var(--text-faint)",
          }}
        >
          <p style={{ fontSize: "3rem", margin: "1rem" }}>🔍</p>
          <p>Ketikkan sesuatu untuk mencari film atau anime.</p>
        </div>
      ) : contents.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "5rem 0",
            color: "var(--text-faint)",
          }}
        >
          <p style={{ fontSize: "3rem", margin: "1rem" }}>📭</p>
          <p>Tidak ada hasil yang ditemukan untuk "{q}".</p>
        </div>
      ) : (
        <div className="card-grid">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      )}
    </main>
  );
}
