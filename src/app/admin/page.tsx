"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  // Jika user sudah login, langsung redirect ke dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: import('@supabase/supabase-js').User | null } }) => {
      if (user) {
        const next = searchParams.get("next") || "/admin/dashboard";
        router.replace(next);
      } else {
        setChecking(false);
      }
    });
  }, [router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Setelah login sukses, redirect ke halaman yang dituju (atau dashboard)
      const next = searchParams.get("next") || "/admin/dashboard";
      router.push(next);
      router.refresh(); // Penting: refresh agar middleware membaca session baru
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login gagal. Periksa email dan password Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan loading spinner saat mengecek status login
  if (checking) {
    return (
      <div
        className="login-page"
        style={{
          paddingTop: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔐</div>
          <p style={{ fontSize: "0.9rem" }}>Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page" style={{ paddingTop: 0 }}>
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-text" style={{ fontSize: "1.8rem" }}>
            Flix<span>Vault</span>
          </span>
        </div>

        <p className="login-title">Masuk ke Admin Dashboard</p>

        {error && (
          <div
            style={{
              background: "rgba(248, 81, 73, 0.1)",
              border: "1px solid rgba(248, 81, 73, 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "0.75rem",
              marginBottom: "1rem",
              fontSize: "0.85rem",
              color: "var(--error)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="admin@movieteater.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-admin"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Memproses..." : "🔐 Masuk"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.25rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          🔒 Area terbatas. Hanya administrator yang diizinkan masuk.
        </div>
      </div>
    </div>
  );
}
