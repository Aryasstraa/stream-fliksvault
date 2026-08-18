import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    // Kembalikan semua settings
    const { data, error } = await supabaseAdmin()
      .from("settings")
      .select("*");

    if (error) {
      // Fallback: Supabase belum dikonfigurasi
      return NextResponse.json({ key: "popunder_script_url", value: "" });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await supabaseAdmin()
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    return NextResponse.json({ key, value: "" });
  }

  return NextResponse.json({ key, value: data.value });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin()
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) throw error;

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json(
      { error: "Failed to save settings. Pastikan SUPABASE_SERVICE_ROLE_KEY sudah diisi." },
      { status: 500 }
    );
  }
}
