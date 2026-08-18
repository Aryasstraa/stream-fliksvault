"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      router.push("/admin/dashboard");
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

  // Demo login tanpa Supabase untuk testing lokal
  const handleDemoLogin = () => {
    router.push("/admin/dashboard");
  };

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
              placeholder="admin@flixvault.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>

          <button
            type="submit"
            className="btn btn-admin"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: "1.25rem",
            paddingTop: "1.25rem",
          }}
        >
          <button
            id="demo-login-btn"
            onClick={handleDemoLogin}
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: "0.85rem" }}
          >
            🚀 Demo Login (tanpa Supabase)
          </button>
        </div>
      </div>
    </div>
  );
}
