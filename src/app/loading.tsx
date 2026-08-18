// Loading skeleton untuk Home page
// Next.js otomatis menampilkan ini saat data sedang di-fetch
export default function Loading() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="hero" style={{ minHeight: "86vh" }}>
        <div className="hero-bg"></div>
        <div className="wrap hero-layout">
          <div className="hero-content">
            <div className="badge-row">
              <div className="skeleton skeleton-chip"></div>
              <div className="skeleton skeleton-chip" style={{ width: 120 }}></div>
            </div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text" style={{ width: "70%" }}></div>
            <div className="skeleton skeleton-text" style={{ width: "50%", marginBottom: 32 }}></div>
            <div style={{ display: "flex", gap: 14 }}>
              <div className="skeleton skeleton-btn"></div>
              <div className="skeleton skeleton-btn" style={{ width: 120 }}></div>
            </div>
          </div>
          <div className="hero-poster">
            <div className="skeleton skeleton-poster"></div>
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <main className="wrap">
        <section className="row-section">
          <div className="section-head">
            <div>
              <div className="skeleton" style={{ width: 100, height: 10, borderRadius: 4, marginBottom: 8 }}></div>
              <div className="skeleton" style={{ width: 200, height: 30, borderRadius: 6 }}></div>
            </div>
          </div>
          <div className="card-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton skeleton-card-img"></div>
                <div className="card-body">
                  <div className="skeleton" style={{ height: 18, borderRadius: 4, marginBottom: 8 }}></div>
                  <div className="skeleton" style={{ height: 13, width: "60%", borderRadius: 4 }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
