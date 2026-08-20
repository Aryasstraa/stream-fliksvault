"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PengaturanPage() {
  const [popunderUrl, setPopunderUrl] = useState("");
  const [nativeBannerUrl, setNativeBannerUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from("settings").select("*");
      if (data) {
        const popunder = data.find((s: any) => s.key === "popunder_script_url");
        if (popunder) setPopunderUrl(popunder.value);
        
        const nativeBanner = data.find((s: any) => s.key === "native_banner_url");
        if (nativeBanner) setNativeBannerUrl(nativeBanner.value);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simpan Popunder
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "popunder_script_url", value: popunderUrl }),
      });
      // Simpan Native Banner
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "native_banner_url", value: nativeBannerUrl }),
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
            <li><Link href="/admin/dashboard" id="nav-list">📋 Daftar Konten</Link></li>
            <li><Link href="/admin/dashboard/tambah" id="nav-add">➕ Tambah Konten</Link></li>
            <li><Link href="/admin/dashboard/pengaturan" id="nav-settings" className="active">⚙️ Pengaturan</Link></li>
            <li><Link href="/" id="nav-site">🌐 Lihat Website</Link></li>
            <li><Link href="/admin" id="nav-logout">🚪 Logout</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-page-title">⚙️ Pengaturan Global</h1>
        </div>

        {/* Popunder Settings */}
        <form onSubmit={handleSave}>
          <div className="settings-card">
            <div className="settings-card-title">🎯 Konfigurasi Popunder Iklan</div>
            <div className="settings-card-desc">
              Masukkan URL script iklan Popunder dari penyedia jaringan iklan Anda (contoh: Propeller Ads, PopAds, Hilltop Ads, dll).
              Setiap kali user mengklik tombol episode, script ini akan dipanggil.
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="popunder-url">
                URL Script Popunder
              </label>
              <input
                id="popunder-url"
                type="url"
                className="form-input"
                placeholder="https://your-ad-network.com/popunder?id=YOUR_ID"
                value={popunderUrl}
                onChange={(e) => setPopunderUrl(e.target.value)}
              />
              <p className="form-hint">
                URL ini disimpan di tabel <code>settings</code> Supabase.
                Ubah kapan saja untuk merotasi penyedia iklan tanpa coding ulang.
              </p>
            </div>

            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label className="form-label" htmlFor="native-banner-url">
                URL Iklan Native Banner
              </label>
              <input
                id="native-banner-url"
                type="url"
                className="form-input"
                placeholder="https://your-ad-network.com/banner?id=YOUR_ID"
                value={nativeBannerUrl}
                onChange={(e) => setNativeBannerUrl(e.target.value)}
              />
              <p className="form-hint">
                Banner iklan statis yang akan ditampilkan (misalnya di bawah player video). 
                Isi dengan link iklan jaringan banner Anda.
              </p>
            </div>

            {saved && (
              <div
                style={{
                  background: "rgba(63, 185, 80, 0.1)",
                  border: "1px solid rgba(63, 185, 80, 0.3)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.6rem 0.9rem",
                  marginBottom: "1rem",
                  fontSize: "0.85rem",
                  color: "var(--success)",
                }}
              >
                ✅ Pengaturan berhasil disimpan ke Supabase!
              </div>
            )}

            <button
              id="save-settings-btn"
              type="submit"
              className="btn btn-admin"
              disabled={saving}
            >
              {saving ? "⏳ Menyimpan..." : "💾 Simpan Pengaturan"}
            </button>
          </div>
        </form>

        {/* Info Card */}
        <div className="settings-card">
          <div className="settings-card-title">ℹ️ Cara Kerja Sistem Monetisasi</div>
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              lineHeight: "1.8",
            }}
          >
            <ol style={{ paddingLeft: "1.25rem" }}>
              <li>
                <strong style={{ color: "var(--text-primary)" }}>User Klik Episode</strong> → JavaScript berjalan secara instan.
              </li>
              <li>
                <strong style={{ color: "var(--text-primary)" }}>Popunder Trigger</strong> → Tab baru terbuka di latar belakang, memuat URL script iklan yang sudah Anda konfigurasi di halaman ini.
              </li>
              <li>
                <strong style={{ color: "var(--text-primary)" }}>Redirect Otomatis</strong> → Tab utama user langsung berpindah ke URL video eksternal (LK21, Anime, dll).
              </li>
            </ol>
            <p style={{ marginTop: "1rem" }}>
              💡 <strong style={{ color: "var(--text-primary)" }}>Tips Rotasi:</strong> Ganti URL script di sini kapan saja untuk berpindah penyedia iklan tanpa perlu deploy ulang.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
