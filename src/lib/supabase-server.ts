// src/lib/supabase-server.ts
// Server-side Supabase client menggunakan cookie-based sessions (@supabase/ssr)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat Supabase client untuk Server Components, Server Actions, dan Route Handlers.
 * Menggunakan cookie sebagai storage session sehingga autentikasi persisten & aman.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll dipanggil dari Server Component — abaikan error ini
            // Middleware akan tetap me-refresh session sebelum halaman render
          }
        },
      },
    }
  );
}
