// src/lib/actions.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath, revalidateTag } from "next/cache";

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