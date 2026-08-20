// src/lib/supabase.ts
// Client-side Supabase client (browser)
// Untuk server-side (Server Components / Actions), gunakan supabase-server.ts

import { createBrowserClient } from "@supabase/ssr";

// Singleton browser client — satu instance untuk seluruh aplikasi client
let _supabase: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = (() => {
  if (!_supabase) {
    // createBrowserClient dari @supabase/ssr secara otomatis menggunakan
    // cookie sebagai storage session sehingga session persisten & aman
    _supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
})();

// Server-side only (Service Role Key - bypass RLS)
// Admin client hanya dipakai di server actions / API routes (tidak di browser)
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
