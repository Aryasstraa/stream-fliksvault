"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const NAV_LINKS = [
    { label: "Beranda", href: "/" },
    { label: "Film", href: "/film" },
    { label: "Anime", href: "/anime" },
    { label: "Drama Korea", href: "/drakor" },
    { label: "Drama China", href: "/drachin" },
  ];

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        setShowSuggestions(true);

        const safeQuery = searchQuery.trim().replace(/[^a-zA-Z0-9]/g, '');

        if (safeQuery.length < 2) {
          setSuggestions([]);
          setIsSearching(false);
          return;
        }

        const searchPattern = safeQuery.split('').join('[-\\s:]?');

        const { data } = await supabase
          .from("contents")
          .select("id, title, slug, type, year")
          .filter("title", "imatch", searchPattern)
          .limit(5);

        setSuggestions(data || []);
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="nav">
      <div className="wrap nav-row">
        <div className="logo" style={{ display: "flex", alignItems: "center" }}>
          <Link href="/">
            <Image
              src="/logo1.png"
              alt="MovieTeater Logo"
              width={240}
              height={80}
              style={{ width: "auto", height: "40px", objectFit: "contain" }}
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
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim().length > 1) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: '44px',
                  marginTop: '8px',
                  background: '#1F1813',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '8px',
                  zIndex: 100,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                {isSearching ? (
                  <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center' }}>
                    Mencari...
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map(s => (
                      <Link
                        key={s.id}
                        href={`/nonton/${s.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        style={{
                          display: 'block',
                          padding: '10px 12px',
                          textDecoration: 'none',
                          color: 'var(--text)',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
                          {s.type === 'series' ? 'Series' : 'Film'} • {s.year}
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => setShowSuggestions(false)}
                      style={{
                        display: 'block',
                        padding: '10px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: 'var(--gold)',
                        fontWeight: 700,
                        background: 'rgba(232, 93, 4, 0.05)',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(232, 93, 4, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(232, 93, 4, 0.05)'}
                    >
                      Lihat Semua Hasil
                    </Link>
                  </>
                ) : (
                  <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center' }}>
                    Tidak ditemukan
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </header>
  );
}
