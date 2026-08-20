"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Content } from "@/lib/types";

interface HeroCarouselProps {
    items: Content[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fungsi untuk pindah slide
    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }, [items.length]);

    // Auto slide setiap 5 detik
    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide, items.length]);

    if (!items || items.length === 0) {
        return (
            <section className="hero" style={{ minHeight: "40vh" }}>
                <div className="wrap">
                    <h1>Belum Ada Konten</h1>
                </div>
            </section>
        );
    }

    const currentContent = items[currentIndex];

    return (
        <section className="hero">
            {/* Background Glow/Ambient yang mengikuti warna tone (opsional) */}
            <div className={`hero-bg t${(currentContent.title.length % 6) + 1}`}></div>

            <div className="wrap hero-layout">
                {/* Konten Kiri (Informasi) */}
                <div className="hero-content">
                    <div className="badge-row">
                        <span className="chip trend">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c1 2 1 4 0 6a7 7 0 1 1-9-11c1.5-1 3.5-1 5-2z" />
                            </svg>
                            Sedang Populer
                        </span>
                        <span className="chip outline">
                            {currentContent.genres?.[0]?.name || "Genre"} • {currentContent.year || "2024"}
                        </span>
                    </div>

                    <h1 key={currentContent.slug} className="fade-in-up">
                        {currentContent.title}
                    </h1>

                    <p className="desc fade-in-up delay-1">
                        {currentContent.synopsis || "Tidak ada deskripsi tersedia untuk judul ini."}
                    </p>

                    <div className="cta-row fade-in-up delay-2">
                        <Link href={`/nonton/${currentContent.slug}`} className="btn primary">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Nonton Sekarang
                        </Link>
                        <Link href={`/nonton/${currentContent.slug}`} className="btn ghost">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8h.01M11 12h1v5h1" />
                            </svg>
                            Detail Info
                        </Link>
                    </div>

                    {/* Indicator Dots */}
                    {items.length > 1 && (
                        <div className="carousel-indicators">
                            {items.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`dot ${idx === currentIndex ? "active" : ""}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Konten Kanan (Poster) */}
                <div className="hero-poster">
                    {currentContent.poster_url && (
                        <div className="hero-poster-wrapper fade-in-right">
                            <Image
                                src={currentContent.poster_url}
                                alt={currentContent.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 400px"
                                style={{ objectFit: "cover" }}
                                priority
                            />
                            <div className="hero-poster-overlay">
                                <span className="hero-poster-label">
                                    {currentContent.type === "series" ? "ORIGINAL SERIES" : "MOVIETEATER EXCLUSIVE"}
                                </span>
                                <span className="hero-poster-tagline">
                                    {currentContent.rating ? `Rating ${currentContent.rating.toFixed(1)}/10` : "Tonton Sekarang"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}