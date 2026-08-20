// middleware.ts — Root middleware (Next.js)
// Proteksi semua route /admin/dashboard/* dari akses tidak sah

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-middleware";

// Route yang dilindungi — hanya bisa diakses dengan sesi aktif
const PROTECTED_ROUTES = ["/admin/dashboard"];

// Route login admin
const ADMIN_LOGIN_ROUTE = "/admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah path termasuk route yang dilindungi
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next({ request });
  }

  // Buat Supabase client dengan cookie dari request
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  // Ambil sesi dari cookie (JANGAN gunakan getSession() di middleware — gunakan getUser() untuk keamanan)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Jika tidak ada user atau terjadi error → redirect ke halaman login admin
  if (error || !user) {
    const loginUrl = new URL(ADMIN_LOGIN_ROUTE, request.url);
    // Tambahkan parameter `next` agar setelah login bisa redirect balik
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User terautentikasi — lanjutkan request dengan response yang sudah di-update cookie-nya
  return response;
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua request path KECUALI:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico
     * - File publik (gambar, dll)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
