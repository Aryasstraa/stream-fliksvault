// Loading skeleton untuk Detail page (/nonton/[slug])
export default function Loading() {
  return (
    <>
      {/* Hero Banner Skeleton */}
      <div className="detail-hero">
        <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0 }}></div>
        <div className="detail-hero-overlay" />
      </div>

      {/* Detail Layout Skeleton */}
      <div className="container">
        <div className="detail-layout">
          {/* Poster */}
          <aside>
            <div className="skeleton" style={{ width: "100%", aspectRatio: "2/3", borderRadius: 16 }}></div>
          </aside>

          {/* Info */}
          <section className="detail-info">
            {/* Genres */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div className="skeleton" style={{ width: 70, height: 24, borderRadius: 20 }}></div>
              <div className="skeleton" style={{ width: 90, height: 24, borderRadius: 20 }}></div>
            </div>

            {/* Title */}
            <div className="skeleton" style={{ width: "70%", height: 44, borderRadius: 8, marginBottom: 12 }}></div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 4 }}></div>
              <div className="skeleton" style={{ width: 40, height: 18, borderRadius: 4 }}></div>
              <div className="skeleton" style={{ width: 80, height: 18, borderRadius: 4 }}></div>
            </div>

            {/* Synopsis */}
            <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 8 }}></div>
            <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 8 }}></div>
            <div className="skeleton" style={{ height: 14, width: "80%", borderRadius: 4, marginBottom: 32 }}></div>

            {/* Episode section */}
            <div className="skeleton" style={{ height: 20, width: 120, borderRadius: 4, marginBottom: 16 }}></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(58px, 1fr))", gap: "0.6rem" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 42, borderRadius: 6 }}></div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
