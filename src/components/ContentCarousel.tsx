"use client";

import { useRef, useState, useEffect } from "react";
import ContentCard from "./ContentCard";
import { Content } from "@/lib/types";

export default function ContentCarousel({ items }: { items: Content[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const checkArrows = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    // Add small buffer to account for rounding errors
    setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
  };

  useEffect(() => {
    checkArrows();
    window.addEventListener("resize", checkArrows);
    return () => window.removeEventListener("resize", checkArrows);
  }, [items]);

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) {
    return <p style={{ color: "var(--text-faint)", fontSize: "14px", padding: "10px 0" }}>Belum ada konten di kategori ini.</p>;
  }
  return (
    <div className="content-carousel-wrapper">
      {showLeftArrow && (
        <button 
          onClick={() => scrollBy(-800)} 
          className="carousel-arrow left"
          aria-label="Scroll left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      )}
      
      <div 
        ref={scrollRef} 
        onScroll={checkArrows}
        className="carousel-track" 
      >
        {items.map((content) => (
          <div key={content.id} className="carousel-slide">
            <ContentCard content={content} />
          </div>
        ))}
      </div>

      {showRightArrow && items.length > 4 && (
        <button 
          onClick={() => scrollBy(800)} 
          className="carousel-arrow right"
          aria-label="Scroll right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      )}
      
      <style jsx>{`
        .content-carousel-wrapper {
          position: relative;
        }
        .carousel-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
          padding-bottom: 16px;
          margin-bottom: -16px;
        }
        .carousel-track::-webkit-scrollbar {
          display: none;
        }
        .carousel-slide {
          flex: 0 0 calc((100% - 72px) / 4); /* 4 items visible, 3 gaps of 24px */
          scroll-snap-align: start;
        }
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          background: rgba(18, 14, 11, 0.8);
          border: 1px solid var(--line-strong);
          color: var(--text);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
        }
        .carousel-arrow:hover {
          background: var(--gold);
          color: #120E0B;
          border-color: var(--gold);
        }
        .carousel-arrow.left {
          left: -24px;
        }
        .carousel-arrow.right {
          right: -24px;
        }
        @media (max-width: 1024px) {
          .carousel-slide {
            flex: 0 0 calc((100% - 48px) / 3);
          }
        }
        @media (max-width: 768px) {
          .carousel-slide {
            flex: 0 0 calc((100% - 24px) / 2);
          }
          .carousel-arrow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
