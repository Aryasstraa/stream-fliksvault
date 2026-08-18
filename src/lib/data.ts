import { unstable_cache } from "next/cache";
import { supabase } from "./supabase";

// ============================================================
// Cached Data Fetchers — bekerja di dev & production
// unstable_cache menyimpan hasil di memori server selama `revalidate` detik
// ============================================================

/** Ambil semua konten (untuk home page) — cache 5 menit */
export const getCachedAllContents = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("contents")
      .select("*, genres(*)")
      .order("rating", { ascending: false })
      .limit(24);
    return data || [];
  },
  ["all-contents"],
  { revalidate: 300, tags: ["contents"] }
);

/** Ambil konten berdasarkan genre slug — cache 5 menit per genre */
export const getCachedContentsByGenre = unstable_cache(
  async (genre: string) => {
    if (genre === "film") {
      const { data } = await supabase
        .from("contents")
        .select("*, genres(*)")
        .eq("type", "film")
        .order("created_at", { ascending: false });
      return { contents: data || [], pageTitle: "Semua Film" };
    }

    if (genre === "semua") {
      const { data } = await supabase
        .from("contents")
        .select("*, genres(*)")
        .order("created_at", { ascending: false });
      return { contents: data || [], pageTitle: "Semua Konten" };
    }

    // Genre spesifik (anime, drakor, drachin, dll)
    const { data: genreData } = await supabase
      .from("genres")
      .select("*")
      .eq("slug", genre)
      .single();

    if (!genreData) return null;

    const { data } = await supabase
      .from("contents")
      .select("*, genres!inner(*)")
      .eq("genres.slug", genre)
      .order("created_at", { ascending: false });

    return { contents: data || [], pageTitle: genreData.name };
  },
  ["contents-by-genre"],
  { revalidate: 300, tags: ["contents"] }
);

/** Ambil satu konten berdasarkan slug — cache 1 jam */
export const getCachedContentBySlug = unstable_cache(
  async (slug: string) => {
    const { data } = await supabase
      .from("contents")
      .select("*, genres(*), episodes(*)")
      .eq("slug", slug)
      .single();
    return data;
  },
  ["content-by-slug"],
  { revalidate: 3600, tags: ["contents"] }
);

/** Ambil semua genre slugs (untuk generateStaticParams) */
export const getCachedGenreSlugs = unstable_cache(
  async () => {
    const { data } = await supabase.from("genres").select("slug");
    return data || [];
  },
  ["genre-slugs"],
  { revalidate: 86400, tags: ["genres"] } // cache 24 jam
);

/** Ambil semua content slugs (untuk generateStaticParams) */
export const getCachedContentSlugs = unstable_cache(
  async () => {
    const { data } = await supabase.from("contents").select("slug");
    return data || [];
  },
  ["content-slugs"],
  { revalidate: 3600, tags: ["contents"] }
);
