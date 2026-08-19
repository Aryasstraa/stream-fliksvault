"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ShareModal from "@/components/ShareModal";
import { supabase } from "@/lib/supabase";
import { Content, ShareData } from "@/lib/types";
import { bulkInjectAction, bulkDeleteAction } from "@/lib/actions";

const SIDEBAR_LINKS = [
  { href: "/admin/dashboard", label: "📋 Daftar Konten", id: "nav-list" },
  { href: "/admin/dashboard/tambah", label: "➕ Tambah Konten", id: "nav-add" },
  { href: "/admin/dashboard/pengaturan", label: "⚙️ Pengaturan", id: "nav-settings" },
  { href: "/", label: "🌐 Lihat Website", id: "nav-site" },
  { href: "/admin", label: "🚪 Logout", id: "nav-logout" },
];

export default function AdminDashboardPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [shareTarget, setShareTarget] = useState<ShareData | null>(null);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadContents = async () => {
    const { data } = await supabase
      .from("contents")
      .select("*, episodes(id)")
      .order("created_at", { ascending: false });
    if (data) {
      setContents(data as any);
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  const handleShareClick = (content: Content) => {
    setShareTarget({
      title: content.title,
      slug: content.slug,
      posterUrl: content.poster_url ?? "",
      synopsis: content.synopsis ?? "",
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus film/series "${title}"? Data tidak dapat dikembalikan.`)) return;

    try {
      const { error } = await supabase.from("contents").delete().eq("id", id);
      if (error) throw error;
      setContents(contents.filter(c => c.id !== id));
      alert("Konten berhasil dihapus.");
    } catch (err) {
      console.error("Gagal menghapus:", err);
      alert("Terjadi kesalahan saat menghapus konten.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsInjecting(true);
      const text = await file.text();
      const jsonData = JSON.parse(text);

      if (!Array.isArray(jsonData)) {
        throw new Error("Format JSON tidak valid. Harus berupa Array.");
      }

      const res = await bulkInjectAction(jsonData);
      if (res.success) {
        alert(`Injeksi selesai! Berhasil: ${res.inserted}, Dilewati (sudah ada): ${res.skipped}`);
        loadContents();
      } else {
        alert(`Gagal injeksi data: ${res.error}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsInjecting(false);
      // Reset input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(contents.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Yakin ingin menghapus ${selectedIds.length} konten yang dipilih? Data tidak dapat dikembalikan.`)) return;

    try {
      setIsDeleting(true);
      const res = await bulkDeleteAction(selectedIds);
      if (res.success) {
        alert("Konten terpilih berhasil dihapus.");
        loadContents();
      } else {
        alert(`Gagal menghapus data: ${res.error}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsDeleting(false);
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
            {SIDEBAR_LINKS.map((link) => (
              <li key={link.id}>
                <Link
                  id={link.id}
                  href={link.href}
                  className={link.href === "/admin/dashboard" ? "active" : ""}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="admin-page-title">📋 Daftar Konten</h1>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {selectedIds.length > 0 && (
              <button 
                className="btn btn-danger btn-sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "⏳ Menghapus..." : `🗑 Hapus Terpilih (${selectedIds.length})`}
              </button>
            )}
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isInjecting}
            >
              {isInjecting ? "⏳ Menginjeksi..." : "⚡ Auto Inject (JSON)"}
            </button>
            <Link href="/admin/dashboard/tambah" className="btn btn-admin btn-sm">
              + Tambah Konten
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {[
            { label: "Total Konten", value: contents.length, icon: "🎬" },
            { label: "Film", value: contents.filter((c) => c.type === "film").length, icon: "🎥" },
            { label: "Series/Anime", value: contents.filter((c) => c.type === "series").length, icon: "📺" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center" }}>
                  <input 
                    type="checkbox" 
                    checked={contents.length > 0 && selectedIds.length === contents.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Konten</th>
                <th>Tipe</th>
                <th>Tahun</th>
                <th>Episode</th>
                <th>Rating</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((content) => (
                <tr key={content.id}>
                  <td style={{ textAlign: "center" }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(content.id)}
                      onChange={(e) => handleSelectRow(content.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {content.poster_url && (
                        <Image
                          src={content.poster_url}
                          alt={content.title}
                          width={36}
                          height={52}
                          style={{ borderRadius: "4px", objectFit: "cover", flexShrink: 0 }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>
                          {content.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          /nonton/{content.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${content.type === "series" ? "type-badge-series" : "type-badge-film"}`}>
                      {content.type === "series" ? "Series" : "Film"}
                    </span>
                  </td>
                  <td>{content.year}</td>
                  <td>
                    {content.type === "series"
                      ? `${content.episodes?.length ?? 0} Eps`
                      : "1 Link"}
                  </td>
                  <td>⭐ {content.rating?.toFixed(1) ?? "-"}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        href={`/admin/dashboard/edit/${content.slug}`}
                        className="btn btn-ghost btn-sm"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        id={`share-btn-${content.id}`}
                        className="btn btn-admin btn-sm"
                        onClick={() => handleShareClick(content)}
                      >
                        🔗 Share
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(content.id, content.title)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal
          data={shareTarget}
          isOpen={!!shareTarget}
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  );
}
