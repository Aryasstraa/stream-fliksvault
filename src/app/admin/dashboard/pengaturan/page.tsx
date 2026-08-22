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
            <li><Link href="/admin/dashboard" id="nav-list">Daftar Konten</Link></li>
            <li><Link href="/admin/dashboard/tambah" id="nav-add">Tambah Konten</Link></li>
            <li><Link href="/admin/dashboard/pengaturan" id="nav-settings" className="active">Pengaturan</Link></li>
            <li><Link href="/" id="nav-site">Lihat Website</Link></li>
            <li><Link href="/admin" id="nav-logout">Logout</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-page-title">Pengaturan Iklan</h1>
        </div>

        {/* Popunder Settings */}
        <form onSubmit={handleSave}>
          <div className="settings-card">
            <div className="settings-card-title">Konfigurasi Popunder Iklan</div>
            <div className="settings-card-desc">
              Masukkan script HTML mentah iklan Popunder dari penyedia jaringan iklan Anda (contoh: Adsterra, Propeller Ads, dll).
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="popunder-url">
                Script Popunder (Raw HTML)
              </label>
              <textarea
                id="popunder-url"
                className="form-textarea"
                rows={4}
                placeholder={`<script src="...">...</script>`}
                value={popunderUrl}
                onChange={(e) => setPopunderUrl(e.target.value)}
              />
              <p className="form-hint">
                Script ini akan disisipkan di seluruh halaman.
              </p>
            </div>

            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label className="form-label" htmlFor="native-banner-url">
                Script Iklan Native Banner (Raw HTML)
              </label>
              <textarea
                id="native-banner-url"
                className="form-textarea"
                rows={5}
                placeholder={`<script src="...">...</script>\n<div id="..."></div>`}
                value={nativeBannerUrl}
                onChange={(e) => setNativeBannerUrl(e.target.value)}
              />
              <p className="form-hint">
                Banner iklan statis yang akan ditampilkan di bawah player video.
                Isi dengan script (kode HTML mentah) jaringan banner Anda.
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
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>

        {/* Info Card */}
        <div className="settings-card">
          <div className="settings-card-title">ℹ️ Cara Kerja Sistem Iklan</div>
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              lineHeight: "1.8",
            }}
          >
            <p>
              Script yang Anda masukkan akan langsung disisipkan ke dalam kode HTML website. Ini sangat cocok untuk iklan <strong>Adsterra, Monetag, PropellerAds</strong>, dan jaringan lain yang mengharuskan pemasangan raw script.
            </p>
            <p style={{ marginTop: "0.8rem", color: "var(--gold)" }}>
              🎯 <strong>Smart Trigger:</strong> Sistem kami telah dirancang secara khusus untuk memblokir iklan Popunder agar <strong>TIDAK</strong> muncul saat pengunjung asal klik di halaman. Iklan Popunder <strong>HANYA</strong> akan ter-trigger saat pengunjung secara spesifik menekan tombol <strong>Nonton / Pilih Episode</strong>!
            </p>
            <p style={{ marginTop: "0.8rem" }}>
              💡 <strong style={{ color: "var(--text-primary)" }}>Perhatian:</strong> Pastikan Anda menyalin kode script dengan utuh dan tidak terpotong agar iklan dapat berjalan dengan baik.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
