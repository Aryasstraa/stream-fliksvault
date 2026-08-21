import { unstable_cache } from "next/cache";
import { supabase } from "./supabase";
import type { Content } from "./types";

// ============================================================
// Cached Data Fetchers — bekerja di dev & production
// unstable_cache menyimpan hasil di memori server selama `revalidate` detik
// ============================================================

/** Ambil semua konten (untuk home page) — cache 5 menit */
export const getCachedAllContents = unstable_cache(
  async (): Promise<Content[]> => {
    const { data } = await supabase
      .from("contents")
      .select("*, genres(*)")
      .order("rating", { ascending: false })
      .limit(24);
    return (data as Content[]) || [];
  },
  ["all-contents"],
  { revalidate: 300, tags: ["contents"] }
);

/** Ambil konten berdasarkan genre slug atau media_format — cache 5 menit per genre */
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

    // Media format categories — query langsung via kolom media_format
    const mediaFormatMap: Record<string, string> = {
      anime: "Anime",
      drakor: "Drama Korea",
      drachin: "Drama China",
      animasi: "Animasi",
    };

    if (mediaFormatMap[genre]) {
      const formatValue = mediaFormatMap[genre];
      
      // 1. Fetch by media_format (Data baru yang sudah di-set dari admin)
      const { data: byFormat } = await supabase
        .from("contents")
        .select("*, genres(*)")
        .eq("media_format", formatValue)
        .order("created_at", { ascending: false });
        
      // 2. Fetch by fallback genre slug (Data lama yang mengandalkan genre)
      let fallbackSlugs = [genre];
      if (genre === 'anime') fallbackSlugs = ['anime', 'animation'];
      else if (genre === 'animasi') fallbackSlugs = ['animation'];
      
      const { data: byGenre } = await supabase
        .from("contents")
        .select("*, genres!inner(*)")
        .in("genres.slug", fallbackSlugs)
        .order("created_at", { ascending: false });

      // 3. Merge dan deduplikasi berdasarkan ID
      const allContents = [...(byFormat || []), ...(byGenre || [])];
      const uniqueContents = Array.from(new Map(allContents.map(item => [item.id, item])).values());
      
      // 4. Sort ulang berdasarkan created_at desc
      uniqueContents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { contents: uniqueContents, pageTitle: formatValue };
    }

    // Fallback: Genre spesifik lainnya (action, comedy, dll)
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
