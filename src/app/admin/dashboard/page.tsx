"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ShareModal from "@/components/ShareModal";
import { supabase } from "@/lib/supabase";
import { Content, ShareData } from "@/lib/types";

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

  useEffect(() => {
    async function fetchContents() {
      const { data } = await supabase
        .from("contents")
        .select("*, episodes(id)")
        .order("created_at", { ascending: false });
      if (data) setContents(data as any);
    }
    fetchContents();
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
        <div className="admin-header">
          <h1 className="admin-page-title">📋 Daftar Konten</h1>
          <Link href="/admin/dashboard/tambah" className="btn btn-admin btn-sm">
            + Tambah Konten
          </Link>
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
