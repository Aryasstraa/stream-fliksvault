"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const NAV_LINKS = [
    { label: "Beranda", href: "/" },
    { label: "Film", href: "/film" },
    { label: "Anime", href: "/anime" },
    { label: "Drama Korea", href: "/drakor" },
    { label: "Drama China", href: "/drachin" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="nav">
      <div className="wrap nav-row">
        <div className="logo" style={{ display: "flex", alignItems: "center" }}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="FlixVault Logo"
              width={120}
              height={36}
              priority
            />
          </Link>
        </div>
        <nav className="links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(253, 246, 227, 0.16)',
                color: '#FDF6E3',
                padding: '6px 12px',
                borderRadius: '6px',
                marginRight: '8px',
                outline: 'none',
                fontSize: '14px',
                width: '180px'
              }}
            />
            <button 
              type="submit" 
              className="search-btn" 
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
