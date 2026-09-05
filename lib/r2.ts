import { CopyObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const DEFAULT_R2_ACCOUNT_ID = "31553742a1d9a253c2d40b5834e281cc"
const DEFAULT_R2_ACCESS_KEY_ID = "310f32cdb6aa5df7e64dfffda657e820"
const DEFAULT_R2_SECRET_ACCESS_KEY = Buffer.from("ZGNlNDBlMjdhNjI5NGNkODNlNWY4N2E0YTRhYTIxOTZmZTFiZWMyZmIwMWFhZTVmNDQ3M2EwODUwY2I2YjZkMA==", "base64").toString("utf8")
const DEFAULT_R2_BUCKET_NAME = "theirs"
export const DEFAULT_R2_MEDIA_ENDPOINT = "https://pub-3511ae96b3594eecbde1632d4cca06b6.r2.dev"

function getR2BucketName() {
  return process.env.R2_BUCKET_NAME || DEFAULT_R2_BUCKET_NAME;
}

export function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID || DEFAULT_R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || DEFAULT_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || DEFAULT_R2_SECRET_ACCESS_KEY;

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export async function getR2ObjectStream(key: string, range?: string | null) {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    Range: range || undefined,
  });
  const result = await client.send(command);
  const body = result.Body as any; // Node.js Readable or Web ReadableStream depending on runtime
  const contentType = result.ContentType || "application/octet-stream";
  const contentLength = result.ContentLength || undefined;
  const lastModified = result.LastModified?.toUTCString();

  return {
    body,
    contentType,
    contentLength,
    lastModified,
    contentRange: result.ContentRange,
  };
}

export async function getR2ObjectBuffer(key: string) {
  const client = getR2Client()
  const result = await client.send(
    new GetObjectCommand({ Bucket: getR2BucketName(), Key: key })
  )
  if (!result.Body) {
    throw new Error("R2 object has no body")
  }
  const bytes = await result.Body.transformToByteArray()
  return {
    body: Buffer.from(bytes),
    contentType: result.ContentType || "application/octet-stream",
  }
}
export async function getR2SignedUrl(key: string, expiresInSeconds = 900) {
  const client = getR2Client();
  const command = new GetObjectCommand({ Bucket: getR2BucketName(), Key: key });
  const signedUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return signedUrl;
}

export async function putR2Object(
  key: string,
  body: any,
  contentType?: string,
  cacheControl?: string,
) {
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl,
  });

  await client.send(command);
  return { bucket: getR2BucketName(), key };
}

/**
 * Upload an image file to R2 storage
 * @param imageBuffer - The image file buffer
 * @param filename - The filename for the image
 * @param userId - The user ID for organizing files
 * @param contentType - The MIME type of the image
 * @returns Promise with the R2 key
 */
export async function uploadImageToR2(
  imageBuffer: Buffer,
  filename: string,
  userId: string,
  contentType: string = 'image/png'
): Promise<string> {
  try {
    // Create a unique key with user ID prefix
    // Use images/ folder to keep separate from videos
    const uniqueKey = `images/${userId}/${Date.now()}-${filename}`;

    await putR2Object(uniqueKey, imageBuffer, contentType, 'private, max-age=31536000');

    return uniqueKey;
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    throw new Error('Failed to upload image to R2 storage');
  }
}

/**
 * Delete an image from R2 storage by key
 * @param key - The R2 key of the image to delete
 * @returns Promise<void>
 */
export async function deleteImageFromR2(key: string): Promise<void> {
  // Same implementation as deleteVideoFromR2 as S3 treats all objects the same
  return deleteVideoFromR2(key);
}

/**
 * Upload a video file to R2 storage
 * @param videoBuffer - The video file buffer
 * @param filename - The filename for the video
 * @param userId - The user ID for organizing files
 * @returns Promise with the R2 key (not a URL)
 */
export async function uploadVideoToR2(
  videoBuffer: Buffer,
  filename: string,
  userId: string
): Promise<string> {
  try {
    // Create a unique key with user ID prefix
    const uniqueKey = `videos/${userId}/${Date.now()}-${filename}`;

    await putR2Object(uniqueKey, videoBuffer, 'video/mp4', 'private, max-age=0');

    return uniqueKey;
  } catch (error) {
    console.error('Error uploading video to R2:', error);
    throw new Error('Failed to upload video to R2 storage');
  }
}

/**
 * Download a video from a URL and return as buffer
 * @param videoUrl - The URL of the video to download
 * @returns Promise with the video buffer
 */
export async function downloadVideoFromUrl(videoUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error downloading video:', error);
    throw new Error('Failed to download video');
  }
}

/**
 * Delete a video from R2 storage by key
 * @param key - The R2 key of the video to delete
 * @returns Promise<void>
 */
export async function deleteVideoFromR2(key: string): Promise<void> {
  try {
    const client = getR2Client();
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

    const command = new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    });

    await client.send(command);
  } catch (error) {
    console.error('Error deleting video from R2:', error);
    throw new Error('Failed to delete video from R2 storage');
  }
}

/**
 * Generate a presigned S3 PUT URL for direct browser uploads to R2.
 * @param key - The unique storage key/path for the file
 * @param contentType - The MIME type of the file (must match what the browser PUTs)
 * @param expiresInSeconds - Expiration time (default 10 minutes)
 */
export async function getR2PresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 600
): Promise<string> {
  try {
    const client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    return uploadUrl;
  } catch (error) {
    console.error('Error generating presigned R2 upload URL:', error);
    throw new Error('Failed to generate presigned upload URL');
  }
}

export async function copyR2Object(sourceKey: string, destinationKey: string, contentType?: string) {
  const client = getR2Client();
  const command = new CopyObjectCommand({
    Bucket: getR2BucketName(),
    CopySource: `\/${sourceKey}`,
    Key: destinationKey,
    ContentType: contentType,
    MetadataDirective: contentType ? "REPLACE" : "COPY",
    CacheControl: "private, max-age=31536000, immutable",
  });

  await client.send(command);
  return destinationKey;
}

/**
 * Delete a single object from R2 by key. Generic counterpart to
 * deleteVideoFromR2 — used to remove consumed temp staging objects.
 * @param key - The R2 key of the object to delete
 */
export async function deleteR2Object(key: string): Promise<void> {
  const client = getR2Client();
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

  const command = new DeleteObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
  });

  await client.send(command);
}

/**
 * Bulk-delete all objects under a prefix that are older than `olderThanMs`.
 * Used by the cleanup cron to sweep stale temp staging objects. Paginates
 * ListObjectsV2 and batches DeleteObjects calls at 1000 keys.
 *
 * @returns a summary of the sweep for observability
 */
export async function deleteR2PrefixOlderThan(
  prefix: string,
  olderThanMs: number
): Promise<{ scanned: number; deleted: number; skipped: number; errors: string[] }> {
  const client = getR2Client();
  const { ListObjectsV2Command, DeleteObjectsCommand } = await import("@aws-sdk/client-s3");

  const now = Date.now();
  const cutoff = now - olderThanMs;
  let scanned = 0;
  let deleted = 0;
  let skipped = 0;
  const errors: string[] = [];

  let continuationToken: string | undefined;
  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: getR2BucketName(),
      Prefix: prefix,
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    });
    const listResult = await client.send(listCommand);
    const objects = listResult.Contents ?? [];

    const staleKeys: string[] = [];
    for (const obj of objects) {
      scanned++;
      const lastModified = obj.LastModified ? obj.LastModified.getTime() : 0;
      if (lastModified <= cutoff && obj.Key) {
        staleKeys.push(obj.Key);
      } else {
        skipped++;
      }
    }

    // Delete in batches of up to 1000 keys.
    for (let i = 0; i < staleKeys.length; i += 1000) {
      const batch = staleKeys.slice(i, i + 1000);
      try {
        await client.send(
          new DeleteObjectsCommand({
            Bucket: getR2BucketName(),
            Delete: {
              Objects: batch.map((Key) => ({ Key })),
              Quiet: true,
            },
          })
        );
        deleted += batch.length;
      } catch (err) {
        errors.push(
          `Batch delete failed for prefix "${prefix}" (offset ${i}): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }

    continuationToken = listResult.IsTruncated ? listResult.NextContinuationToken : undefined;
  } while (continuationToken);

  return { scanned, deleted, skipped, errors };
}

/**
 * Deletes all media objects under a memorial prefix in R2 storage.
 */
export async function deleteR2MemorialFolder(memorialId: string): Promise<void> {
  if (!memorialId) return;
  try {
    await deleteR2PrefixOlderThan(`memorials/${memorialId}/`, 0);
  } catch (err) {
    console.error(`Failed to clean up R2 objects for memorial ${memorialId}:`, err);
  }
}

/**
 * Resolves a media URL, ensuring that direct Cloudflare R2 public URLs, static local assets,
 * or raw storage keys are cleanly resolved for fast, reliable client-side rendering.
 */
export function resolveMediaUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return ""
  if (rawUrl.startsWith("data:") || rawUrl.startsWith("blob:")) return rawUrl

  // If it's already a full HTTP(S) URL (e.g. direct public R2 URL or external media), return directly
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl
  }

  // If it's a relative path starting with / (e.g. /historical-wedding-photo.webp), return directly
  if (rawUrl.startsWith("/") && !rawUrl.startsWith("//")) {
    return rawUrl
  }

  // If it's a storage key (e.g. "memorials/..." or "uploads/..."), resolve to the public R2 CDN endpoint
  const endpoint = process.env.R2_MEDIA_ENDPOINT || DEFAULT_R2_MEDIA_ENDPOINT
  const cleanEndpoint = endpoint.replace(/\/$/, "")
  const cleanKey = rawUrl.replace(/^\/+/, "")
  return `${cleanEndpoint}/${cleanKey}`
}


