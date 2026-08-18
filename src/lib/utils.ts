import slugifyLib from "slugify";

/** Buat slug URL dari judul konten */
export function makeSlug(title: string): string {
  return slugifyLib(title, { lower: true, strict: true, locale: "id" });
}

/** Buat URL dengan UTM parameters untuk social sharing */
export function buildUtmUrl(
  baseUrl: string,
  slug: string,
  platform: string
): string {
  if (platform === "none") return `${baseUrl}/nonton/${slug}`;

  const utmMap: Record<string, Record<string, string>> = {
    tiktok: { utm_source: "tiktok", utm_medium: "bio_link" },
    x: { utm_source: "x", utm_medium: "social" },
    instagram: { utm_source: "instagram", utm_medium: "stories" },
    facebook: { utm_source: "facebook", utm_medium: "group" },
  };

  const utmParams = utmMap[platform] || {};
  const params = new URLSearchParams({
    ...utmParams,
    utm_campaign: "share_content",
  });

  return `${baseUrl}/nonton/${slug}?${params.toString()}`;
}

/** Format angka menjadi tampilan rating */
export function formatRating(rating: number): string {
  return rating?.toFixed(1) ?? "N/A";
}

/** Pecah textarea URLs menjadi array per baris */
export function parseEpisodeUrls(rawText: string): string[] {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
