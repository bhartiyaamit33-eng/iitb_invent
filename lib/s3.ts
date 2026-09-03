import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const region = process.env.AWS_REGION || "ap-south-1";
const bucket = process.env.S3_BUCKET || "";
const prefix = (process.env.S3_UPLOAD_PREFIX || "uploads/").replace(/^\//, "");

const client = new S3Client({ region });

export function isS3Configured(): boolean {
  return Boolean(bucket);
}

export function publicObjectUrl(key: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Resize/compress an image and upload under uploads/speakers/.
 * Returns a public HTTPS URL (bucket policy must allow GetObject on uploads/*).
 */
export async function uploadSpeakerPhoto(opts: {
  speakerId: string;
  bytes: Buffer;
  contentType: string;
}): Promise<{ key: string; url: string }> {
  if (!bucket) throw new Error("S3_BUCKET is not configured");

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(opts.contentType)) {
    throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed");
  }
  if (opts.bytes.length > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8 MB");
  }

  const processed = await sharp(opts.bytes)
    .rotate()
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  const key = `${prefix}speakers/${opts.speakerId}-${Date.now()}.jpg`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: processed,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { key, url: publicObjectUrl(key) };
}
