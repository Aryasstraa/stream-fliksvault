"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { makeSlug, parseEpisodeUrls } from "@/lib/utils";
import Swal from "sweetalert2";

export default function TambahKontenPage() {
  const router = useRouter();
  const [genresList, setGenresList] = useState<{ id: string, name: string }[]>([]);

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
    media_format: "",
    synopsis: "",
    year: new Date().getFullYear().toString(),
    rating: "",
    selectedGenres: [] as string[],
    episodeUrl: "",       // untuk film (tunggal)
    episodesBulk: "",     // untuk series (bulk textarea)
  });
  const [slug, setSlug] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleDeleteGenre = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from("genres").delete().eq("id", id);
      if (error) throw error;
      setGenresList(prev => prev.filter(g => g.id !== id));
      setForm(p => ({
        ...p,
        selectedGenres: p.selectedGenres.filter(gId => gId !== id)
      }));
    } catch (err: any) {
      console.error(err);
      alert("Gagal menghapus genre.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // === STEP 1: Simpan konten ke Supabase ===
      const { data: content, error: contentError } = await supabase
        .from("contents")
        .insert({
          title: form.title,
          slug,
          type: form.type,
          media_format: form.media_format || null,
          synopsis: form.synopsis,
          year: parseInt(form.year),
          rating: parseFloat(form.rating) || 0,
          poster_url: posterUrl || null,
          banner_url: bannerUrl || null,
        })
        .select()
        .single();

      if (contentError || !content) throw contentError;

      // === STEP 2: Simpan episodes ke Supabase ===
      const episodeUrls =
        form.type === "series"
          ? parseEpisodeUrls(form.episodesBulk)
          : form.episodeUrl ? [form.episodeUrl] : [];

      if (episodeUrls.length > 0) {
        const episodes = episodeUrls.map((url, i) => ({
          content_id: content.id,
          episode_number: i + 1,
          external_url: url
        }));
        await supabase.from("episodes").insert(episodes);
      }

      // === STEP 3: Simpan relasi genre ===
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

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Konten berhasil ditambahkan!',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        background: 'var(--bg-card)',
        color: 'var(--text-primary)'
      }).then(() => {
        router.push('/admin/dashboard');
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="admin-wrapper" style={{ paddingTop: 0 }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span className="logo-text">Admin<span>Panel</span></span>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li><Link href="/admin/dashboard" id="nav-list">Daftar Konten</Link></li>
            <li><Link href="/admin/dashboard/tambah" id="nav-add" className="active">Tambah Konten</Link></li>
            <li><Link href="/admin/dashboard/pengaturan" id="nav-settings">Pengaturan</Link></li>
            <li><Link href="/" id="nav-site">Lihat Website</Link></li>
            <li><Link href="/admin" id="nav-logout">Logout</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Form */}
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-page-title">Tambah Konten Baru</h1>
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
                    <option value="film">Film</option>
                    <option value="series">Series / Anime</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-media-format">Format Media (Opsional)</label>
                  <select
                    id="input-media-format"
                    className="form-select"
                    value={form.media_format}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        media_format: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- Pilih Format --</option>
                    <option value="Drama China">Drama China</option>
                    <option value="Drama Korea">Drama Korea</option>
                    <option value="Anime">Anime</option>
                    <option value="Animasi">Animasi</option>
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
                    <div key={genre.id} style={{ position: "relative", display: "inline-block" }}>
                      <button
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGenre(genre.id, genre.name);
                        }}
                        title="Hapus Genre"
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "16px",
                          height: "16px",
                          fontSize: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                      >
                        x
                      </button>
                    </div>
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
                <div className="settings-card-title">Gambar Aset (URL Eksternal)</div>
                <div className="settings-card-desc">
                  Masukkan link gambar dari web lain (misal dari TMDB, IMDB, Pinterest).
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-poster">URL Poster (rasio 2:3)</label>
                  <input
                    id="input-poster"
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                  />
                  {posterUrl && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <img src={posterUrl} alt="Preview Poster" style={{ width: "80px", borderRadius: "4px" }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-banner">URL Banner / Background (rasio 16:9)</label>
                  <input
                    id="input-banner"
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                  />
                  {bannerUrl && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <img src={bannerUrl} alt="Preview Banner" style={{ width: "100%", maxHeight: "100px", objectFit: "cover", borderRadius: "4px" }} />
                    </div>
                  )}
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
              {loading ? "Menyimpan..." : "Simpan Konten"}
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
