// Loading skeleton untuk Genre pages (/anime, /film, /drakor, dll)
export default function Loading() {
  return (
    <main className="wrap" style={{ paddingTop: "64px", paddingBottom: "64px", minHeight: "65vh" }}>
      <div className="section-head">
        <div>
          <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 4, marginBottom: 8 }}></div>
          <div className="skeleton" style={{ width: 220, height: 32, borderRadius: 6 }}></div>
        </div>
        <div className="skeleton" style={{ width: 80, height: 18, borderRadius: 4 }}></div>
      </div>
      <div className="card-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton skeleton-card-img"></div>
            <div className="card-body">
              <div className="skeleton" style={{ height: 18, borderRadius: 4, marginBottom: 8 }}></div>
              <div className="skeleton" style={{ height: 13, width: "60%", borderRadius: 4 }}></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
