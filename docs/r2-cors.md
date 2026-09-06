# Cloudflare R2 CORS Configuration for Theirs (`theirs.page`)

Direct browser-to-R2 uploads using presigned PUT URLs require Cross-Origin Resource Sharing (CORS) rules applied to your Cloudflare R2 storage bucket.

---

## 1. CORS Rules Configuration

In the Cloudflare Dashboard:
1. Navigate to **R2 Storage** > Select your bucket (e.g. `theirs-media` or configured `R2_BUCKET_NAME`).
2. Go to **Settings** tab > Scroll to **CORS Policy**.
3. Click **Add CORS Policy** and paste the JSON below:

```json
[
  {
    "AllowedOrigins": [
      "https://theirs.page",
      "https://www.theirs.page",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:8787",
      "http://127.0.0.1:8787"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "Content-Type",
      "Content-Length",
      "x-amz-*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Type",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

Or using `wrangler r2 bucket cors set`:

```bash
npx wrangler r2 bucket cors set <R2_BUCKET_NAME> --file r2-cors.json
```

---

## 2. Security & Bucket Privacy Principles

1. **Bucket Remains Completely Private**:
   - Do **NOT** enable public bucket access or public `r2.dev` bucket endpoints.
   - Uploads are authorized individually using short-lived S3 HMAC-SHA256 presigned PUT URLs signed by the backend.
   - Presigned upload URLs expire after 10 minutes (600 seconds) and can only be used for the exact authorized S3 key and MIME type.

2. **Keys vs URLs**:
   - The database stores only the relative storage key (e.g. `memorials/{id}/gallery/{timestamp}_{uuid}_{filename}`).
   - Public rendering continues to be delivered securely via `/api/media?key={key}` or custom authorized domain routing.
