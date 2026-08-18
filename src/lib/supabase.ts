import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton — satu instance untuk seluruh aplikasi, tidak di-recreate setiap request
let _supabase: SupabaseClient | null = null;
export const supabase = (() => {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Tidak perlu session di server-side
        autoRefreshToken: false,
      },
    });
  }
  return _supabase;
})();

// Server-side only (Service Role Key - bypass RLS)
// Admin client tidak perlu singleton karena hanya dipakai di server actions / API routes
export const supabaseAdmin = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
