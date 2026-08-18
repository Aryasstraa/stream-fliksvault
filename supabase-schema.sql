-- ============================================================
-- FlixVault — Supabase Database Schema
-- Jalankan query ini di Supabase SQL Editor
-- ============================================================

-- 1. Tabel Konten Utama
CREATE TABLE IF NOT EXISTS public.contents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  type          TEXT NOT NULL CHECK (type IN ('film', 'series')),
  synopsis      TEXT,
  year          INTEGER,
  rating        NUMERIC(3, 1) DEFAULT 0,
  poster_url    TEXT,
  banner_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Genre
CREATE TABLE IF NOT EXISTS public.genres (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE
);

-- 3. Relasi Many-to-Many: Content ↔ Genre
CREATE TABLE IF NOT EXISTS public.content_genres (
  content_id  UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  genre_id    UUID REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, genre_id)
);

-- 4. Tabel Episode
CREATE TABLE IF NOT EXISTS public.episodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  episode_number  INTEGER NOT NULL,
  external_url    TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (content_id, episode_number)
);

-- 5. Tabel Settings (untuk URL Popunder dan config global lainnya)
CREATE TABLE IF NOT EXISTS public.settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

-- ============================================================
-- Seed Data Awal
-- ============================================================

-- Genre default
INSERT INTO public.genres (name, slug) VALUES
  ('Action', 'action'),
  ('Comedy', 'comedy'),
  ('Horror', 'horror'),
  ('Romance', 'romance'),
  ('Drama Korea', 'drakor'),
  ('Anime', 'anime'),
  ('Fantasy', 'fantasy'),
  ('Sci-Fi', 'sci-fi'),
  ('Thriller', 'thriller')
ON CONFLICT (slug) DO NOTHING;

-- Setting Popunder default (kosong, isi dari Dashboard)
INSERT INTO public.settings (key, value) VALUES
  ('popunder_script_url', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- RLS (Row Level Security) — Konten publik bisa dibaca siapa saja
-- ============================================================
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa READ (SELECT) konten, genre, episodes
CREATE POLICY "Public can read contents" ON public.contents FOR SELECT USING (true);
CREATE POLICY "Public can read genres" ON public.genres FOR SELECT USING (true);
CREATE POLICY "Public can read content_genres" ON public.content_genres FOR SELECT USING (true);
CREATE POLICY "Public can read episodes" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Public can read settings" ON public.settings FOR SELECT USING (true);

-- Policy: Hanya authenticated admin yang bisa INSERT, UPDATE, DELETE
CREATE POLICY "Auth can write contents" ON public.contents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can write genres" ON public.genres FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can write content_genres" ON public.content_genres FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can write episodes" ON public.episodes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can write settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');
