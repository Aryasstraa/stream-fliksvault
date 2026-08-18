import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload file ke Cloudflare R2.
 * @param key - Path/nama file di bucket (contoh: "posters/film-slug.jpg")
 * @param body - Buffer atau Readable stream dari file
 * @param contentType - MIME type (contoh: "image/jpeg")
 * @returns URL publik file yang bisa disimpan ke Supabase
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Kembalikan URL publik
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
}

/**
 * Generate pre-signed URL untuk upload langsung dari browser (opsional).
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}
