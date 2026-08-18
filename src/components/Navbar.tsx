"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const NAV_LINKS = [
    { label: "Beranda", href: "/" },
    { label: "Film", href: "/film" },
    { label: "Anime", href: "/anime" },
    { label: "Drama Korea", href: "/drakor" },
  ];

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
          <button className="search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
