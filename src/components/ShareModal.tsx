"use client";

import { useState } from "react";
import Image from "next/image";
import { ShareData, SocialPlatform } from "@/lib/types";
import { buildUtmUrl } from "@/lib/utils";

interface ShareModalProps {
  data: ShareData;
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORMS: { id: SocialPlatform; label: string; icon: string }[] = [
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "x", label: "X / Twitter", icon: "𝕏" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "facebook", label: "Facebook", icon: "👍" },
];

export default function ShareModal({ data, isOpen, onClose }: ShareModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>("none");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://flixvault.app";

  const generatedUrl = buildUtmUrl(baseUrl, data.slug, selectedPlatform);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = generatedUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">🔗 Generate Link Sosmed</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Platform Selector */}
        <p className="form-label" style={{ marginBottom: "0.5rem" }}>Pilih Platform (UTM Tracking)</p>
        <div className="platform-grid">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              className={`platform-btn ${selectedPlatform === p.id ? "active" : ""}`}
              onClick={() => setSelectedPlatform(p.id)}
            >
              <span className="platform-icon">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Social Preview Card */}
        <p className="form-label" style={{ marginBottom: "0.5rem" }}>Preview Meta Card</p>
        <div className="social-preview-card">
          {data.posterUrl && (
            <div style={{ position: "relative", height: "180px" }}>
              <Image
                src={data.posterUrl}
                alt={data.title}
                fill
                className="preview-poster"
                style={{ objectFit: "cover", objectPosition: "top" }}
              />
            </div>
          )}
          <div className="preview-body">
            <div className="preview-domain">flixvault.app</div>
            <div className="preview-title-text">{data.title}</div>
            <div className="preview-desc-text">{data.synopsis}</div>
          </div>
        </div>

        {/* Copy Link */}
        <p className="form-label" style={{ marginBottom: "0.5rem" }}>Link Siap Salin</p>
        <div className="copy-box">
          <input
            type="text"
            className="copy-input"
            value={generatedUrl}
            readOnly
          />
          <button
            className={`copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>

        {selectedPlatform !== "none" && (
          <p
            style={{
              marginTop: "0.6rem",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
            }}
          >
            UTM: utm_source={selectedPlatform}&utm_medium=...&utm_campaign=share_content
          </p>
        )}
      </div>
    </div>
  );
}
