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
      "http://127.0.0.1:3000"
    ],
    "AllowedMethods": [
      "PUT"
    ],
    "AllowedHeaders": [
      "Content-Type"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

Or using `wrangler r2 bucket cors set`:

```bash
npm run r2:cors:apply
npm run r2:cors:check
```

The scripts target the production `theirs` bucket declared in `wrangler.jsonc`.
They require either an authenticated `wrangler login` session or a Cloudflare API
token with R2 bucket configuration access. The check must show the same origins,
`PUT` method, `Content-Type` request header, and exposed `ETag` response header as
[`r2-cors.json`](../r2-cors.json).

After applying the policy, complete one single-part image upload and one multipart
audio or video upload from the production origin. In browser developer tools,
confirm that each R2 `OPTIONS` request succeeds, each `PUT` succeeds, and multipart
part responses expose a non-empty `ETag`. A policy listing alone does not prove the
browser-to-R2 data path.

---

## 2. Security & Bucket Privacy Principles

1. **Bucket Remains Completely Private**:
   - Do **NOT** enable public bucket access or public `r2.dev` bucket endpoints.
   - Uploads are authorized individually using short-lived S3 HMAC-SHA256 presigned PUT URLs signed by the backend.
   - Presigned single-upload and part URLs expire after 15 minutes and can only be used for the exact authorized R2 operation.
   - Multipart create, list, complete, and abort operations pass through authenticated Theirs routes. Only file bytes use browser-to-R2 `PUT` requests.

2. **Keys vs URLs**:
   - The database stores only the relative storage key (e.g. `memorials/{id}/gallery/{timestamp}_{uuid}_{filename}`).
   - Public rendering continues to be delivered securely via `/api/media?key={key}` or custom authorized domain routing.
