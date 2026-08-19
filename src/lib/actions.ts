// src/lib/actions.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath, revalidateTag } from "next/cache";
import { makeSlug } from "@/lib/utils";

export async function updateContentAction(id: string, payload: any) {
    const admin = supabaseAdmin();

    try {
        // 1. Update Tabel Utama
        const { error: contentError } = await admin
            .from("contents")
            .update({
                title: payload.title,
                slug: payload.slug,
                type: payload.type,
                synopsis: payload.synopsis,
                year: payload.year,
                rating: payload.rating,
                poster_url: payload.poster_url,
                banner_url: payload.banner_url,
            })
            .eq("id", id);

        if (contentError) throw new Error(`Konten Error: ${contentError.message}`);

        // 2. Update Episode (Hapus dan Insert ulang)
        const { error: delEpError } = await admin.from("episodes").delete().eq("content_id", id);
        if (delEpError) throw new Error(`Gagal hapus episode lama: ${delEpError.message}`);

        if (payload.episodes && payload.episodes.length > 0) {
            // Pastikan format data episode bersih
            const cleanEpisodes = payload.episodes.map((ep: any) => ({
                content_id: id,
                episode_number: parseInt(ep.episode_number),
                external_url: ep.external_url.trim()
            }));

            const { error: insEpError } = await admin.from("episodes").insert(cleanEpisodes);
            if (insEpError) throw new Error(`Gagal simpan episode baru: ${insEpError.message}`);
        }

        // 3. Update Genre (Hapus dan Insert ulang)
        const { error: delGenError } = await admin.from("content_genres").delete().eq("content_id", id);
        if (delGenError) throw new Error(`Gagal hapus genre lama: ${delGenError.message}`);

        if (payload.genres && payload.genres.length > 0) {
            const cleanGenres = payload.genres.map((gId: string) => ({
                content_id: id,
                genre_id: gId
            }));

            const { error: insGenError } = await admin.from("content_genres").insert(cleanGenres);
            if (insGenError) throw new Error(`Gagal simpan genre baru: ${insGenError.message}`);
        }

        // 4. Force Revalidate (Gunakan revalidatePath agar instan)
        revalidateTag("contents");
        revalidatePath("/", "layout"); // Revalidasi seluruh site agar navigasi & home update
        revalidatePath(`/nonton/${payload.slug}`);

        return { success: true };
    } catch (err: any) {
        console.error("Error Detail:", err.message);
        return { success: false, error: err.message };
    }
}

export async function bulkInjectAction(data: any[]) {
    const admin = supabaseAdmin();
    try {
        let successCount = 0;
        let skippedCount = 0;

        for (const item of data) {
            const rawTitle = item.title || "Unknown";
            const slug = makeSlug(rawTitle);

            // Cek duplikasi via slug
            const { data: existing } = await admin
                .from("contents")
                .select("id")
                .eq("slug", slug)
                .maybeSingle();

            if (existing) {
                skippedCount++;
                continue;
            }

            // Bersihkan data tahun dan rating
            const yearStr = item.year ? String(item.year).replace(/\D/g, "") : "";
            const year = parseInt(yearStr) || new Date().getFullYear();
            const rating = parseFloat(item.rating) || 0;

            const { data: newContent, error: contentError } = await admin
                .from("contents")
                .insert({
                    title: rawTitle,
                    slug: slug,
                    type: "film",
                    synopsis: item.synopsis || "",
                    year: year,
                    rating: rating,
                    poster_url: item.poster_url && item.poster_url !== "N/A" ? item.poster_url : null,
                    banner_url: item.banner_url && item.banner_url !== "N/A" ? item.banner_url : null,
                })

                .select()
                .single();

            if (contentError) {
                console.error("Gagal insert konten:", rawTitle, contentError.message);
                skippedCount++;
                continue;
            }

            const contentId = newContent.id;
            const genreIds: string[] = [];
            const genres = Array.isArray(item.genres) ? item.genres : [];

            for (const genreName of genres) {
                const cleanName = typeof genreName === 'string' ? genreName.trim() : '';
                if (!cleanName) continue;
                const genreSlug = makeSlug(cleanName);

                const { data: existingGenre } = await admin
                    .from("genres")
                    .select("id")
                    .eq("slug", genreSlug)
                    .maybeSingle();

                if (existingGenre) {
                    genreIds.push(existingGenre.id);
                } else {
                    const { data: newGenre, error: genreErr } = await admin
                        .from("genres")
                        .insert({ name: cleanName, slug: genreSlug })
                        .select()
                        .maybeSingle();
                    if (newGenre && !genreErr) genreIds.push(newGenre.id);
                }
            }

            if (genreIds.length > 0) {
                const contentGenres = genreIds.map((gId) => ({
                    content_id: contentId,
                    genre_id: gId,
                }));
                await admin.from("content_genres").insert(contentGenres);
            }

            if (item.source_url && item.source_url !== "N/A") {
                await admin.from("episodes").insert({
                    content_id: contentId,
                    episode_number: 1,
                    external_url: item.source_url,
                });
            }

            successCount++;
        }

        revalidateTag("contents");
        revalidatePath("/", "layout");

        return { success: true, inserted: successCount, skipped: skippedCount };
    } catch (err: any) {
        console.error("Bulk Inject Error:", err.message);
        return { success: false, error: err.message };
    }
}

export async function bulkDeleteAction(ids: string[]) {
    const admin = supabaseAdmin();
    try {
        if (!ids || ids.length === 0) {
            return { success: false, error: "Tidak ada ID yang dipilih" };
        }

        const { error } = await admin
            .from("contents")
            .delete()
            .in("id", ids);

        if (error) {
            throw new Error(error.message);
        }

        revalidateTag("contents");
        revalidatePath("/", "layout");

        return { success: true };
    } catch (err: any) {
        console.error("Bulk Delete Error:", err.message);
        return { success: false, error: err.message };
    }
}