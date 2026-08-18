// ============================================================
// Database Types — Sesuai dengan schema Supabase
// ============================================================

export type ContentType = "film" | "series";

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  synopsis: string | null;
  year: number | null;
  rating: number | null;
  poster_url: string | null;
  banner_url: string | null;
  created_at: string;
  // Joined relations
  genres?: Genre[];
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  content_id: string;
  episode_number: number;
  external_url: string;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
}

// ============================================================
// Form / UI Types
// ============================================================

export type SocialPlatform = "none" | "tiktok" | "x" | "instagram" | "facebook";

export interface ShareData {
  title: string;
  slug: string;
  posterUrl: string;
  synopsis: string;
}

// ============================================================
// Mock Data — Untuk development tanpa Supabase
// ============================================================

export const MOCK_CONTENTS: Content[] = [
  {
    id: "1",
    title: "Jujutsu Legends",
    slug: "jujutsu-legends",
    type: "series",
    synopsis:
      "Kisah Yuji, remaja SMA yang memakan pusaka kutukan tingkat tinggi untuk menyelamatkan teman-temannya. Kini ia harus memburu sisa kutukan sambil bersekolah di sekolah penyihir Jujutsu.",
    year: 2023,
    rating: 9.1,
    poster_url:
      "https://images.unsplash.com/photo-1580204556488-fc8ca35091ff?w=400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80",
    created_at: new Date().toISOString(),
    genres: [{ id: "1", name: "Anime", slug: "anime" }, { id: "2", name: "Action", slug: "action" }],
    episodes: Array.from({ length: 24 }, (_, i) => ({
      id: `eps-${i + 1}`,
      content_id: "1",
      episode_number: i + 1,
      external_url: `https://example-host.com/video/eps${i + 1}`,
      created_at: new Date().toISOString(),
    })),
  },
  {
    id: "2",
    title: "Cybernetic Dawn",
    slug: "cybernetic-dawn",
    type: "film",
    synopsis:
      "Di tahun 2089, seorang hacker jenius mencoba meruntuhkan megacorporation yang menguasai seluruh kehidupan manusia di kota dystopian terbesar di dunia.",
    year: 2024,
    rating: 8.5,
    poster_url:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1920&q=80",
    created_at: new Date().toISOString(),
    genres: [{ id: "3", name: "Sci-Fi", slug: "sci-fi" }, { id: "4", name: "Thriller", slug: "thriller" }],
    episodes: [
      {
        id: "eps-film-1",
        content_id: "2",
        episode_number: 1,
        external_url: "https://example-host.com/video/cybernetic-dawn",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "3",
    title: "Seoul Dynasty",
    slug: "seoul-dynasty",
    type: "series",
    synopsis:
      "Drama keluarga kerajaan modern di Seoul. Seorang pewaris tahta yang hidup sederhana tiba-tiba harus menghadapi konspirasi besar yang mengancam kehidupannya.",
    year: 2024,
    rating: 8.8,
    poster_url:
      "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
    created_at: new Date().toISOString(),
    genres: [{ id: "5", name: "Drama Korea", slug: "drakor" }, { id: "6", name: "Romance", slug: "romance" }],
    episodes: Array.from({ length: 16 }, (_, i) => ({
      id: `eps-seoul-${i + 1}`,
      content_id: "3",
      episode_number: i + 1,
      external_url: `https://example-host.com/video/seoul-eps${i + 1}`,
      created_at: new Date().toISOString(),
    })),
  },
  {
    id: "4",
    title: "Echoes of Terror",
    slug: "echoes-of-terror",
    type: "film",
    synopsis:
      "Sebuah keluarga pindah ke rumah tua di desa terpencil. Malam demi malam, suara-suara aneh muncul dari dinding, dan teror perlahan mengungkap rahasia gelap masa lalu rumah tersebut.",
    year: 2023,
    rating: 7.2,
    poster_url:
      "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80",
    created_at: new Date().toISOString(),
    genres: [{ id: "7", name: "Horror", slug: "horror" }],
    episodes: [
      {
        id: "eps-horror-1",
        content_id: "4",
        episode_number: 1,
        external_url: "https://example-host.com/video/echoes-of-terror",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "5",
    title: "Quantum Paradox",
    slug: "quantum-paradox",
    type: "film",
    synopsis:
      "Seorang ilmuwan jenius secara tidak sengaja membuka portal ke dimensi lain. Kini ia harus berlomba dengan waktu untuk menutupnya sebelum dua realitas bertabrakan dan menghancurkan segalanya.",
    year: 2024,
    rating: 8.9,
    poster_url:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
    created_at: new Date().toISOString(),
    genres: [{ id: "3", name: "Sci-Fi", slug: "sci-fi" }, { id: "8", name: "Action", slug: "action" }],
    episodes: [
      {
        id: "eps-quantum-1",
        content_id: "5",
        episode_number: 1,
        external_url: "https://example-host.com/video/quantum-paradox",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "6",
    title: "Mystic Academy",
    slug: "mystic-academy",
    type: "series",
    synopsis:
      "Sekolah ajaib tempat para penyihir muda belajar sihir kuno. Tokoh utama menemukan bahwa ia memiliki kekuatan yang tidak pernah ada sebelumnya dan harus melindungi akademi dari ancaman kegelapan.",
    year: 2023,
    rating: 8.3,
    poster_url:
      "https://images.unsplash.com/photo-1580204556488-fc8ca35091ff?w=400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80",
    created_at: new Date().toISOString(),
    genres: [{ id: "9", name: "Fantasy", slug: "fantasy" }, { id: "1", name: "Anime", slug: "anime" }],
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: `eps-mystic-${i + 1}`,
      content_id: "6",
      episode_number: i + 1,
      external_url: `https://example-host.com/video/mystic-eps${i + 1}`,
      created_at: new Date().toISOString(),
    })),
  },
];

export const MOCK_GENRES: Genre[] = [
  { id: "1", name: "Anime", slug: "anime" },
  { id: "2", name: "Action", slug: "action" },
  { id: "3", name: "Sci-Fi", slug: "sci-fi" },
  { id: "4", name: "Thriller", slug: "thriller" },
  { id: "5", name: "Drama Korea", slug: "drakor" },
  { id: "6", name: "Romance", slug: "romance" },
  { id: "7", name: "Horror", slug: "horror" },
  { id: "8", name: "Fantasy", slug: "fantasy" },
  { id: "9", name: "Comedy", slug: "comedy" },
];
