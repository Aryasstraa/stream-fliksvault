import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string ?? "uploads";
    const filename = formData.get("filename") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${folder}/${filename || file.name}`;

    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Pastikan environment variables R2 sudah diisi di .env.local" },
      { status: 500 }
    );
  }
}
