"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { makeSlug, parseEpisodeUrls } from "@/lib/utils";

export default function TambahKontenPage() {
  const [genresList, setGenresList] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    async function loadGenres() {
      const { data } = await supabase.from("genres").select("id, name").order("name");
      if (data) setGenresList(data);
    }
    loadGenres();
  }, []);

  const [form, setForm] = useState({
    title: "",
    type: "film" as "film" | "series",
    synopsis: "",
    year: new Date().getFullYear().toString(),
    rating: "",
    selectedGenres: [] as string[],
    episodeUrl: "",       // untuk film (tunggal)
    episodesBulk: "",     // untuk series (bulk textarea)
  });
  const [slug, setSlug] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newGenreText, setNewGenreText] = useState("");
  const [addingGenre, setAddingGenre] = useState(false);

  const handleTitleChange = (val: string) => {
    setForm((p) => ({ ...p, title: val }));
    setSlug(makeSlug(val));
  };

  const toggleGenre = (genreId: string) => {
    setForm((p) => ({
      ...p,
      selectedGenres: p.selectedGenres.includes(genreId)
        ? p.selectedGenres.filter((id) => id !== genreId)
        : [...p.selectedGenres, genreId],
    }));
  };

  const handleAddCustomGenre = async () => {
    if (!newGenreText.trim()) return;
    setAddingGenre(true);
    const customSlug = makeSlug(newGenreText);
    
    try {
      const { data, error } = await supabase
        .from("genres")
        .insert({ name: newGenreText.trim(), slug: customSlug })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setGenresList(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        // Otomatis pilih genre yang baru ditambahkan
        setForm(p => ({ ...p, selectedGenres: [...p.selectedGenres, data.id] }));
        setNewGenreText("");
      }
    } catch (err) {
      console.error("Gagal menambahkan genre:", err);
      alert("Gagal menambahkan genre. Mungkin genre sudah ada.");
    } finally {
      setAddingGenre(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // === STEP 1: Upload Poster & Banner ke R2 ===
      let posterUrl = "";
      let bannerUrl = "";

      if (posterFile) {
        const fd = new FormData();
        fd.append("file", posterFile);
        fd.append("folder", "posters");
        fd.append("filename", `${slug}.${posterFile.name.split(".").pop()}`);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        posterUrl = data.url;
      }

      if (bannerFile) {
        const fd = new FormData();
        fd.append("file", bannerFile);
        fd.append("folder", "banners");
        fd.append("filename", `${slug}.${bannerFile.name.split(".").pop()}`);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        bannerUrl = data.url;
      }

      // === STEP 2: Simpan konten ke Supabase ===
      const { data: content, error: contentError } = await supabase
        .from("contents")
        .insert({
          title: form.title,
          slug,
          type: form.type,
          synopsis: form.synopsis,
          year: parseInt(form.year),
          rating: parseFloat(form.rating) || 0,
          poster_url: posterUrl || null,
          banner_url: bannerUrl || null,
        })
        .select()
        .single();
        
      if (contentError || !content) throw contentError;

      // === STEP 3: Simpan episodes ke Supabase ===
      const episodeUrls =
        form.type === "series"
          ? parseEpisodeUrls(form.episodesBulk)
          : form.episodeUrl ? [form.episodeUrl] : [];

      if (episodeUrls.length > 0) {
        const episodes = episodeUrls.map((url, i) => ({ 
          content_id: content.id, 
          episode_number: i+1, 
          external_url: url 
        }));
        await supabase.from("episodes").insert(episodes);
      }
      
      // === STEP 4: Simpan relasi genre ===
      if (form.selectedGenres.length > 0) {
        const contentGenres = form.selectedGenres.map(gId => ({
          content_id: content.id,
          genre_id: gId
        }));
        await supabase.from("content_genres").insert(contentGenres);
      }

      console.log("Form submitted:", {
        ...form,
        slug,
        posterUrl,
        bannerUrl,
        episodeUrls,
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="admin-wrapper" style={{ paddingTop: 0 }}>
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">
            <span className="logo-text">Admin<span>Panel</span></span>
          </div>
        </aside>
        <main className="admin-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
            <h2>Konten berhasil ditambahkan!</h2>
            <p style={{ color: "var(--text-secondary)", margin: "1rem 0 1.5rem" }}>
              Slug: <code style={{ color: "var(--admin-accent)" }}>/nonton/{slug}</code>
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <Link href="/admin/dashboard" className="btn btn-ghost">
                ← Kembali ke Dashboard
              </Link>
              <button
                className="btn btn-admin"
                onClick={() => { setSuccess(false); setForm({ title: "", type: "film", synopsis: "", year: new Date().getFullYear().toString(), rating: "", selectedGenres: [], episodeUrl: "", episodesBulk: "" }); setSlug(""); }}
              >
                + Tambah Lagi
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-wrapper" style={{ paddingTop: 0 }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span className="logo-text">Admin<span>Panel</span></span>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li><Link href="/admin/dashboard" id="nav-list">📋 Daftar Konten</Link></li>
            <li><Link href="/admin/dashboard/tambah" id="nav-add" className="active">➕ Tambah Konten</Link></li>
            <li><Link href="/admin/dashboard/pengaturan" id="nav-settings">⚙️ Pengaturan</Link></li>
            <li><Link href="/" id="nav-site">🌐 Lihat Website</Link></li>
            <li><Link href="/admin" id="nav-logout">🚪 Logout</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Form */}
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-page-title">➕ Tambah Konten Baru</h1>
          <Link href="/admin/dashboard" className="btn btn-ghost btn-sm">
            ← Kembali
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}
          >
            {/* Kolom Kiri */}
            <div>
              <div
                className="settings-card"
                style={{ marginBottom: "1.5rem" }}
              >
                <div className="settings-card-title">Informasi Dasar</div>
                <div className="settings-card-desc">Isi data utama konten.</div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-title">Judul</label>
                  <input
                    id="input-title"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Jujutsu Legends Season 2"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                  {slug && (
                    <p className="form-hint">
                      Slug URL: <code style={{ color: "var(--admin-accent)" }}>/nonton/{slug}</code>
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-type">Tipe Konten</label>
                  <select
                    id="input-type"
                    className="form-select"
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        type: e.target.value as "film" | "series",
                      }))
                    }
                  >
                    <option value="film">🎥 Film</option>
                    <option value="series">📺 Series / Anime</option>
                  </select>
                </div>

                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
                >
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-year">Tahun Rilis</label>
                    <input
                      id="input-year"
                      type="number"
                      className="form-input"
                      min="1990"
                      max="2030"
                      value={form.year}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, year: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-rating">Rating (0-10)</label>
                    <input
                      id="input-rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="form-input"
                      placeholder="8.5"
                      value={form.rating}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, rating: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-synopsis">Sinopsis</label>
                  <textarea
                    id="input-synopsis"
                    className="form-textarea"
                    placeholder="Tulis sinopsis singkat di sini..."
                    value={form.synopsis}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, synopsis: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Genre Select */}
              <div className="settings-card">
                <div className="settings-card-title">Genre</div>
                <div className="settings-card-desc">Pilih satu atau lebih genre.</div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  {genresList.map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      style={{
                        padding: "0.35rem 0.9rem",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: form.selectedGenres.includes(genre.id)
                          ? "2px solid var(--admin-accent)"
                          : "1px solid var(--border)",
                        background: form.selectedGenres.includes(genre.id)
                          ? "var(--admin-accent-soft)"
                          : "var(--bg-base)",
                        color: form.selectedGenres.includes(genre.id)
                          ? "var(--admin-accent)"
                          : "var(--text-secondary)",
                        transition: "var(--transition-fast)",
                      }}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
                
                {/* Input Custom Genre */}
                <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px dashed var(--border)", display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Tambah genre baru..."
                    value={newGenreText}
                    onChange={(e) => setNewGenreText(e.target.value)}
                    style={{ flex: 1, padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomGenre();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddCustomGenre}
                    disabled={addingGenre || !newGenreText.trim()}
                    style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                  >
                    {addingGenre ? "⏳" : "Tambah"}
                  </button>
                </div>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div>
              {/* Upload Aset */}
              <div className="settings-card" style={{ marginBottom: "1.5rem" }}>
                <div className="settings-card-title">Upload Aset (Cloudflare R2)</div>
                <div className="settings-card-desc">
                  File akan diupload langsung ke R2. URL disimpan ke Supabase.
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-poster">Poster (JPG/PNG, rasio 2:3)</label>
                  <input
                    id="input-poster"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="form-input"
                    style={{ paddingTop: "0.4rem" }}
                    onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-banner">Banner / Background (rasio 16:9)</label>
                  <input
                    id="input-banner"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="form-input"
                    style={{ paddingTop: "0.4rem" }}
                    onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              {/* Episode Input */}
              <div className="settings-card">
                <div className="settings-card-title">
                  {form.type === "film" ? "Link Video Film" : "Bulk Insert Episode"}
                </div>
                <div className="settings-card-desc">
                  {form.type === "film"
                    ? "Paste satu URL link eksternal video film."
                    : "Paste semua URL episode, satu baris per episode. Urutan = nomor episode."}
                </div>

                {form.type === "film" ? (
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-film-url">URL Video Eksternal</label>
                    <input
                      id="input-film-url"
                      type="url"
                      className="form-input"
                      placeholder="https://lk21.la/movies/..."
                      value={form.episodeUrl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, episodeUrl: e.target.value }))
                      }
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-bulk-eps">URL Episode (satu per baris)</label>
                    <textarea
                      id="input-bulk-eps"
                      className="form-textarea"
                      rows={10}
                      placeholder={`https://example.com/anime/eps1\nhttps://example.com/anime/eps2\nhttps://example.com/anime/eps3\n...`}
                      value={form.episodesBulk}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, episodesBulk: e.target.value }))
                      }
                    />
                    {form.episodesBulk && (
                      <p className="form-hint">
                        Terdeteksi:{" "}
                        <strong>
                          {parseEpisodeUrls(form.episodesBulk).length} episode
                        </strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
            <button
              id="submit-konten-btn"
              type="submit"
              className="btn btn-admin"
              disabled={loading}
              style={{ padding: "0.8rem 2rem" }}
            >
              {loading ? "⏳ Menyimpan..." : "💾 Simpan Konten"}
            </button>
            <Link href="/admin/dashboard" className="btn btn-ghost">
              Batal
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
