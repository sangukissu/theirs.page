I checked the current repo before writing this. The membership foundation is now there: `getMemorialAccess()` has owner/co-admin/trusted/contributor capabilities, so the media system can finally build on one authoritative user×memorial relationship rather than inventing more roles.

The media problem is still exactly where we left it: Studio asks `/api/r2/presigned-upload-url`, performs one whole-file `PUT`, silently falls back through `/api/r2/upload`, then POSTs the staging key to the media API.  The media API then copies audio/video from `dashboard-staging/...` to `memorials/...`.  `lib/r2.ts` currently only has the ordinary PUT/copy primitives, not multipart lifecycle operations.  And Uppy isn't installed yet.

So this is the implementation brief I would hand Codex.

---

# Theirs — Production Media Upload & Contribution Architecture

## Mission

Replace the current fragile media-upload system with a production-grade upload architecture where large family audio/video files are:

* directly uploaded from browser → Cloudflare R2;
* resumable after network failure or refresh;
* retryable at the chunk level;
* represented by durable server-side upload sessions;
* protected by memorial membership and Pro-plan permissions;
* quota-safe;
* impossible to accidentally publish before finalization/moderation;
* recoverable after an interrupted client session;
* never silently routed through the application server as a large buffered upload.

At the same time, simplify public anonymous contributions:

**Anonymous visitors**

* text tributes/memories;
* photos;
* limited raw audio;
* YouTube video link;
* **no raw video file uploads**.

**Accepted memorial members**

* owner;
* co-admin;
* trusted contributor;
* contributor;

may upload original photos/audio/video using the authenticated resumable system, subject to their memorial role and plan entitlement.

Do not redesign the membership system again. Build on `getMemorialAccess()`.

---

# 1. Product rules are frozen

The implementation must follow this capability model.

| Actor               | Native photo | Native audio | Native raw video | YouTube | Upload UX                            |
| ------------------- | -----------: | -----------: | ---------------: | ------: | ------------------------------------ |
| Owner               |            ✅ |        ✅ Pro |            ✅ Pro |       ✅ | resumable authenticated              |
| Co-admin            |            ✅ |        ✅ Pro |            ✅ Pro |       ✅ | resumable authenticated              |
| Trusted contributor |            ✅ |        ✅ Pro |            ✅ Pro |       ✅ | resumable authenticated contribution |
| Contributor         |            ✅ |        ✅ Pro |            ✅ Pro |       ✅ | resumable authenticated contribution |
| Anonymous visitor   |    ✅ limited |    ✅ limited |                ❌ |       ✅ | lightweight guest flow               |

Membership and subscription are independent.

Being an accepted contributor does **not** grant Pro features. If the memorial itself is Free, existing Free limits remain authoritative.

Do not increase current authenticated file limits as part of this project. Initially preserve approximately:

```text
Images: 15 MB
Audio: 50 MB
Video: 100 MB
Memorial original-media quota: 10 GB
```

For anonymous voice contributions, reduce/keep a separate conservative ceiling around **20–25 MB**.

Do not change pricing/product entitlement unless existing code requires consistency.

---

# 2. There are three distinct media contexts

Do not treat all uploaders identically at the application layer.

### A. Owner / co-admin Studio media

This is editorial content.

```text
Studio → Photos
```

Owner/co-admin uploads become `media_items` directly after successful upload verification/finalization.

They do not require contribution moderation.

### B. Accepted trusted/contributor media

This is still a **contribution**.

Their dashboard's `Contribute` action should use an authenticated contribution composer with the resumable uploader.

The upload does **not** bypass:

```text
memories
contributor_role
pending_approval
trusted auto-approval rules
moderation
```

A regular contributor still requires approval.

A trusted contributor only auto-publishes content that genuinely receives a `safe` safety decision.

Raw audio/video currently deliberately receive `requireHumanMediaReview(...)`; preserve that. Do **not** accidentally make trusted audio/video auto-publish simply because the user is trusted. The existing completion route explicitly recognizes that automated audio/video media analysis has not been run.

### C. Anonymous public contribution

Keep the current Turnstile/rate-limit/contribution architecture.

But:

```text
Raw video upload
```

must disappear.

Replace it with:

```text
YouTube URL
```

Anonymous audio remains a raw upload but with a smaller hard limit and human approval.

---

# 3. Introduce a central media-capability resolver

Do not scatter:

```ts
if (role === ...)
if (isPaid ...)
if (anonymous ...)
```

across 10 components.

Add something conceptually like:

```ts
type MediaContext =
  | "studio"
  | "member_contribution"
  | "guest_contribution"

type MediaCapabilities = {
  nativePhoto: boolean
  nativeAudio: boolean
  nativeVideo: boolean
  youtubeVideo: boolean

  resumableUpload: boolean
  requiresModeration: boolean

  maxImageBytes: number
  maxAudioBytes: number
  maxVideoBytes: number | null
}
```

Resolve it from:

```text
getMemorialAccess()
memorial.is_paid
media context
contribution settings
existing quotas
```

The client may use this for UX, but **the server is authoritative**.

The same policy must power:

* Studio uploader;
* authenticated family contributor uploader;
* public contribution UI;
* upload-session APIs;
* finalization APIs.

---

# 4. Add durable upload sessions

Create the next migration rather than editing historical migrations.

Something in the shape of:

```sql
create table media_upload_sessions (
  id uuid primary key default gen_random_uuid(),

  memorial_id uuid not null references memorials(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,

  purpose text not null,
  -- studio_gallery
  -- member_contribution

  media_type text not null,
  -- image | audio | video

  original_filename text not null,
  mime_type text not null,
  file_size bigint not null,

  client_upload_id text not null,
  file_fingerprint text,

  r2_key text not null,
  multipart_upload_id text,

  upload_mode text not null,
  -- single | multipart

  status text not null,
  -- created
  -- uploading
  -- uploaded
  -- verifying
  -- finalizing
  -- complete
  -- failed
  -- aborted
  -- expired

  reserved_bytes bigint not null,

  result_media_item_id uuid references media_items(id),
  result_memory_id uuid references memories(id),

  error_code text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz
);
```

Exact schema can be adjusted after inspecting existing storage-quota structures, but these properties are mandatory.

Do not persist upload percentage to Supabase every few hundred milliseconds.

R2 already knows uploaded multipart parts.

The DB represents durable lifecycle state, not an analytics firehose.

Add indexes for at least:

```text
user_id + status
memorial_id + status
expires_at
r2_key
client_upload_id
```

Direct client mutation should not be allowed. Route all meaningful session mutations through server APIs/service role, consistent with the security-hardening style already used elsewhere.

---

# 5. Quota reservation happens before upload

Creating an upload session must reserve storage before issuing any R2 capability.

Reuse the existing 10 GB storage quota system instead of creating a competing quota counter.

Flow:

```text
request upload session
      ↓
authenticate
      ↓
resolve memorial membership
      ↓
resolve media capability
      ↓
validate size/MIME
      ↓
reserve bytes atomically
      ↓
create upload session
      ↓
issue upload mechanism
```

If session creation fails, reservation must be released.

If multipart creation fails, release it.

If user cancels, release it.

If upload expires, release it.

If finalization succeeds, convert the reservation into committed storage exactly once.

Concurrency must not allow two simultaneous upload sessions to oversubscribe the 10 GB limit.

---

# 6. R2 multipart support belongs in `lib/r2.ts`

Extend the existing R2 abstraction rather than scattering AWS commands inside routes.

Add wrappers around:

```ts
CreateMultipartUploadCommand
UploadPartCommand
ListPartsCommand
CompleteMultipartUploadCommand
AbortMultipartUploadCommand
```

and the existing:

```ts
HeadObjectCommand
PutObjectCommand
DeleteObjectCommand
```

Do not expose R2 credentials to the browser.

For multipart:

```text
Browser → Theirs API → create multipart on R2
Browser → Theirs API → ask for signed part URL
Browser ─────────────→ PUT part directly to R2
Browser → Theirs API → complete multipart
```

Only actual file bytes travel directly browser → R2.

Creation/listing/completion/abort may run server-side through AWS SDK.

Cloudflare R2 supports multipart specifically for resumability; parts must be at least 5 MiB except the final part. ([Cloudflare Docs][1])

---

# 7. Use Uppy headlessly — do NOT adopt the Uppy Dashboard UI

Install compatible versions of:

```text
@uppy/core
@uppy/aws-s3
@uppy/golden-retriever
```

Do not install or build around the deprecated separate:

```text
@uppy/aws-s3-multipart
```

The current Uppy API puts regular and multipart uploads in `@uppy/aws-s3`. ([Uppy][2])

Preserve Theirs' existing design.

Uppy should be an upload engine underneath your own cards/progress components.

Codex must inspect the **current installed Uppy types/docs** instead of blindly copying old blog snippets; this plugin has recently changed significantly.

Implement its own-server callbacks for:

```text
getUploadParameters
createMultipartUpload
listParts
signPart
completeMultipartUpload
abortMultipartUpload
```

The official uploader explicitly supports these hooks. ([Uppy][3])

---

# 8. Force multipart earlier than Uppy defaults

Uppy's normal default only switches around 100 MiB, which does not solve Theirs' real-world 6 MB/80 MB failure cases. ([Uppy][3])

Use approximately:

```ts
shouldUseMultipart(file) {
  if (file.size <= 5 * MiB) return false

  if (file.type.startsWith("audio/")) return true
  if (file.type.startsWith("video/")) return true

  return file.size > 10 * MiB
}
```

This is intentional.

The user's observed **6 MB audio upload** must gain resumability.

Use approximately:

```text
8 MiB multipart chunks
```

for the current 50/100 MB limits.

All non-final parts must have equal size and at least 5 MiB on R2. ([Cloudflare Docs][1])

Keep file concurrency conservative, approximately the existing **2 files concurrently**, rather than saturating mobile connections.

Retain automatic exponential-ish retry behavior.

---

# 9. Do not silently fall back through `/api/r2/upload`

Current Studio code does this:

```text
direct R2 fails
       ↓
console.warn(...)
       ↓
send whole file through /api/r2/upload
```

Remove this behavior for memorial audio/video.

A direct-storage failure should remain a direct-storage failure with:

```text
retry
resume
re-sign
network-state handling
```

Do not convert it into:

```text
Browser
↓
Cloudflare Next.js worker
↓
buffer full file
↓
R2
```

`/api/r2/upload` may continue to exist for small, specifically intended legacy/image/restoration flows if they require it, but it must not be the secret rescue path for Studio/member audio/video.

Search every caller before changing it.

---

# 10. Authenticated Studio audio/video should stop doing the extra R2 copy

Current flow:

```text
dashboard-staging
       ↓
CopyObject
       ↓
memorials/{id}/gallery
       ↓
media_items
       ↓
delete staging
```

For large authenticated owner/co-admin audio/video, replace this.

Allocate a stable final key before upload, e.g.:

```text
memorials/{memorialId}/uploads/{sessionId}/{randomUuid}.{ext}
```

Upload directly there.

The object must **not become visible simply because it exists**.

This requires one important hardening.

Current `/api/media` generally treats an object under:

```text
memorials/{memorial}/...
```

as readable whenever the memorial's visibility rules allow it; it does not first prove that the specific object is referenced by a finalized media record.

For this new upload prefix, require:

```text
media_upload_session complete
AND/OR
media_items.url = exact key
```

before delivery.

Unfinalized uploaded objects must return `404`, even on a public memorial.

Add the appropriate DB index.

This gives us:

```text
direct-to-final R2 key
+
no huge CopyObject
+
unfinished object remains invisible
```

---

# 11. Do not unnecessarily break the image archival pipeline

Images are different.

Current image logic has HEIC/original/display handling through `promoteStagedMemorialImage`.

Do not delete that merely to make every file follow identical storage mechanics.

Codex should inspect:

```text
lib/memorial-image-promotion.ts
archivalHeicKeyForDisplay()
storage quota accounting
```

and preserve original-vs-display archival behavior.

A reasonable final architecture is:

```text
ordinary audio/video
→ direct permanent object

images requiring processing/original+display split
→ upload session
→ existing inspected/promotion pipeline
```

The durable session architecture should cover both, but the underlying storage strategy may differ.

---

# 12. Finalization must be idempotent

This is non-negotiable.

Suppose:

```text
R2 upload finished
Theirs finalizes media
server response gets lost
browser retries /finalize
```

There must still be exactly **one** `media_items` row.

The session should retain:

```text
result_media_item_id
```

Once complete:

```text
POST /finalize again
```

returns the same result.

No duplicate media.

No duplicate quota accounting.

No duplicate R2 objects.

Use an atomic database operation/RPC if necessary.

Conceptually:

```text
lock session
↓
if already complete:
    return existing result

verify uploaded object
↓
create media row
↓
commit reservation
↓
mark session complete + result ID
```

in one authoritative finalization path.

---

# 13. Verify uploaded bytes after R2 completion

Do not trust:

```text
filename
browser MIME
client media_type
```

After single/multipart R2 completion:

```text
HeadObject
↓
exact content length
↓
expected content type
↓
magic-byte inspection
↓
server decides true media type
```

Reuse the good logic already present in `complete-contribution-upload`, which currently checks object size/content type and validates magic bytes before accepting audio/video.

Authenticated Studio uploads deserve the same protection.

Only after successful verification can a session become:

```text
uploaded / finalizing / complete
```

Invalid object:

```text
delete object
release quota
mark failed
```

---

# 14. Build one reusable authenticated upload engine

Create something like:

```text
lib/uploads/
components/uploads/
hooks/use-resumable-media-upload.ts
```

Do not keep upload mechanics inside `gallery-tab.tsx`.

The engine should accept something conceptually like:

```ts
{
  memorialId,
  purpose,
  allowedMediaTypes,
  defaultAlbum?,
}
```

It should expose UI-neutral state:

```ts
{
  id,
  filename,
  mediaType,

  bytesUploaded,
  totalBytes,
  percentage,

  bytesPerSecond,
  etaSeconds,

  status:
    | "preparing"
    | "uploading"
    | "paused"
    | "verifying"
    | "finalizing"
    | "complete"
    | "error",

  resumable,
  error,
}
```

Then Studio and authenticated family contribution can share the same uploader without sharing the same finalization/business rules.

---

# 15. Progress UI must show actual progress

Replace:

```text
Uploading 1 of 1...
```

with per-file progress.

Example:

**Dad's birthday.mp4**

```text
█████████████░░░░ 68%
54.7 MB of 80 MB · 2.8 MB/s · about 9 sec left
```

Then:

```text
Verifying upload…
```

then:

```text
Adding to Aachal's memorial…
```

then:

```text
Uploaded
```

Do not fake progress.

Do not leave the user staring at a spinner for three minutes.

For several files, each file gets its own independent state.

---

# 16. Refresh/recovery behavior

Use Golden Retriever to persist Uppy upload state.

It can use IndexedDB for state/small files and an optional Service Worker to improve recovery for larger file references. ([Uppy][4])

The UX contract is:

### Refresh while upload is running

Return to the page and attempt automatic restore/resume.

### File object can be recovered

Resume missing multipart parts.

### Browser cannot recover access to the original file

Show:

> **Upload paused at 68%**
> Choose the same file to continue. Your uploaded progress is safe.

When the same file is chosen, reconnect it to the existing upload session and use `ListParts` rather than starting over.

Use a fingerprint based on metadata such as:

```text
name
size
lastModified
mime
user
memorial
```

Do not hash an entire 100 MB file before uploading just to generate a fingerprint.

A lightweight first/last-chunk hash may be added if necessary, but avoid adding seconds of CPU work to mobile devices.

---

# 17. Do not promise background completion unless it truly exists

Previous UI wording such as:

> You can leave this page. We'll finish it here.

is only correct if an actual background-upload mechanism survives page closure.

Golden Retriever primarily gives **recovery/resume**, not magical server-side continuation of bytes that never reached R2.

Use copy like:

> **You can come back later. We'll keep your upload progress and resume where possible.**

Do not mislead users.

---

# 18. Handle lost network deliberately

Subscribe to browser connectivity state and uploader errors.

On network loss:

```text
Connection lost — upload paused
We'll continue when you're back online.
```

On reconnect:

```text
Resuming…
```

A failed multipart chunk should retry only that chunk.

Do not reset the entire media card.

Do not throw away the upload session.

If a presigned part URL expires, request a fresh signature for that part.

Cloudflare notes that expired presigned URLs return 403, so this must lead to re-signing rather than restarting the upload. ([Cloudflare Docs][5])

---

# 19. Every multipart API call must re-authorize the user

Do not assume that because somebody was authorized when upload began they remain authorized forever.

For:

```text
create
sign part
list parts
complete
abort
finalize
resume
```

resolve current auth/session ownership again.

For Studio purpose require:

```text
owner || co-admin
```

using the new membership capabilities.

For member-contribution purpose require:

```text
accepted memorial membership
&& access.canContribute
```

If a collaborator is revoked halfway through an upload:

```text
already-issued part URL may finish
next server operation → 403
finalization impossible
cleanup later aborts/removes session
quota released
```

That integrates with the revocation architecture you just finished.

---

# 20. Accepted contributor uploads are not Studio uploads

Do not grant:

```text
trusted
contributor
```

access to `/api/memorials/{id}/media POST`.

That endpoint represents direct editorial gallery management.

Instead build authenticated contribution mode.

Prefer refactoring the existing public form into something conceptually like:

```text
ContributionComposer
    ├── guest transport
    └── authenticated-member transport
```

Shared:

```text
author
relationship
memory/story
photo/audio/video
year
location
submit
```

Different transport/security behavior.

### Guest mode

```text
Turnstile
guest rate limits
guest upload intent
no raw video
```

### Member mode

```text
authenticated identity
getMemorialAccess
no Turnstile requirement
resumable native media
membership-specific contribution status
```

Do not duplicate the entire contribution form if it can be avoided.

---

# 21. Member contributor raw audio/video should upload into moderation-safe storage

Owner/co-admin Studio content can go directly to a final gallery key.

Contributor content cannot, because it may need approval.

For authenticated contributor audio/video use a durable private key/prefix tied to the upload session, e.g.:

```text
quarantine/{memorialId}/member/{uploadSessionId}/original/...
```

or another clearly protected equivalent.

Then:

```text
upload complete
↓
verify media
↓
submit contribution
↓
pending approval
```

The pending raw bytes remain private.

On approval:

```text
quarantine
↓
promote/copy once
↓
memorial permanent media
```

That server-side promotion is legitimate because it represents a **moderation boundary**.

The optimization rule is:

> Don't do unnecessary staging/copy for trusted editorial uploads.
> Do use private quarantine when content legitimately awaits approval.

---

# 22. Raw audio/video safety behavior remains conservative

Current audio/video guest completion correctly marks:

```text
human media review required
```

because automated media analysis was not run.

Preserve this for member-contributed raw audio/video too.

Therefore:

```text
trusted contributor + text/photo + genuinely safe
→ existing auto-publish behavior

trusted contributor + audio/video
→ pending human review

regular contributor
→ pending approval
```

Do not silently weaken this during uploader refactoring.

---

# 23. Anonymous raw video must be removed at both UI and API level

Do not merely hide the button.

The public API must reject raw `video` media upload attempts even if somebody manually calls it.

Current guest upload-intent still accepts:

```text
photo
memory
voice
video
```

and directly creates R2 upload capability for voice/video.

Change that architecture so anonymous/guest raw video cannot obtain an upload intent.

Membership-aware authenticated contribution gets its own uploader and does not rely on guest Turnstile upload intent.

---

# 24. Replace public video upload with YouTube URL

The public contribution form's video mode should become approximately:

**Share a video**

```text
YouTube link
[ https://youtube.com/watch?v=... ]
```

Helper copy:

> Paste a YouTube link to share a video with the family.

For accepted family members, additionally expose:

> **Have the original file?**
> Upload the original from your family workspace.

Do not accept arbitrary embed HTML.

Server validation must:

```text
accept only configured provider
parse URL
extract canonical video ID
reject invalid hosts
store normalized provider + video ID
```

Do not blindly store user iframe markup.

---

# 25. Model external media explicitly

A YouTube reference is not an R2 original.

Do not pretend otherwise.

Either extend the relevant media model or introduce normalized external-media metadata.

The invariant should be equivalent to:

```ts
source_type:
  | "uploaded"
  | "youtube"

external_provider?: "youtube"
external_id?: string
external_url?: string
```

For a pending contribution, keep the external reference attached to the contribution until approval.

On approval, create whatever gallery/rendering representation the existing product requires.

Do not:

```text
count YouTube against 10 GB
include it as an original binary in archive export
claim Theirs permanently preserves the original
```

Native upload = preservation.

YouTube = external reference/presentation.

---

# 26. Reuse the existing consent-aware YouTube rendering

The repo already contains:

```text
components/consent/youtube-embed.tsx
```

Use/rework that instead of introducing arbitrary iframe rendering.

Ensure any memorial page/gallery implementation follows the site's existing consent/privacy architecture.

---

# 27. Clean up abandoned sessions

Create an explicit cleanup job.

For expired sessions:

### Multipart still incomplete

```text
AbortMultipartUpload
release storage reservation
mark expired
```

### Single upload exists but was never finalized

```text
delete R2 object
release reservation
mark expired
```

### Multipart completed but DB finalization never occurred

```text
delete orphan object
release reservation
mark expired
```

All cleanup must be idempotent.

R2 automatically aborts incomplete multipart uploads after seven days by default, but Theirs should not rely on that as application cleanup. ([Cloudflare Docs][1])

Use a much shorter application lifecycle.

A reasonable starting point:

```text
active upload session expires after ~6 hours
cleanup cron removes expired sessions
R2 lifecycle remains final failsafe
```

Activity/resume operations may extend `expires_at`.

---

# 28. R2 CORS must explicitly support multipart browser PUTs

The browser must be able to read each uploaded part's `ETag`.

Without that, multipart completion fails. Uppy specifically requires `ETag` exposure for multipart. ([Uppy][6])

Since create/list/complete/abort should go through Theirs backend and only actual part bytes travel browser → R2, keep the browser R2 CORS surface minimal.

Production shape roughly:

```json
[
  {
    "AllowedOrigins": [
      "https://theirs.page",
      "http://localhost:3000"
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

Adjust only if the final Uppy implementation sends additional required headers.

Do not use `*` for production upload origins.

Cloudflare's R2 browser-upload documentation likewise requires matching CORS and exposes `ETag` for these workflows. ([Cloudflare Docs][7])

---

# 29. Add useful telemetry before declaring this fixed

We need to know whether the original 6 MB / 90-second case was bandwidth, CORS, retry behavior, fallback, or something else.

Record/upload analytics without storing sensitive filenames.

Events/fields approximately:

```text
upload_session_created

upload_transport:
  single_direct
  multipart_direct

actor_role:
  owner
  co_admin
  trusted
  contributor
  guest

purpose:
  studio_gallery
  member_contribution
  guest_contribution

media_type
bytes

prepare_ms
upload_ms
verify_ms
finalize_ms

effective_mbps
retry_count
resume_count

failure_stage:
  capability
  quota
  create
  sign
  upload_part
  complete
  verify
  finalize

http_status
error_code
```

Also log:

```text
upload_resumed
upload_cancelled
upload_expired
upload_completed
```

Do not put:

```text
personal filename
memorial person's name
caption
story text
```

into telemetry.

---

# 30. Preserve responsive video/audio delivery

Do not change existing media playback/range support accidentally.

`/api/media` currently supports:

```text
Range
206 responses
Accept-Ranges
Content-Range
```

for media streaming.

That is important for audio/video seeking.

Any new key prefixes or DB-reference checks must preserve byte-range streaming.

---

# 31. UI behavior for cancellation

User clicks Cancel:

### Multipart

```text
abort multipart
release reservation
mark aborted
remove UI item
```

### Completed-but-not-finalized

```text
delete R2 object
release reservation
mark aborted
```

Do not leave orphan files.

If the client disappears before it can send cancellation, expiry cleanup handles it later.

---

# 32. Navigation behavior

Do not block the whole app for three minutes.

An active upload may survive navigation if the upload manager lives high enough in the authenticated app shell, but this is optional.

The minimum requirement is:

```text
navigate away
return
session is still known
Uppy/GoldenRetriever restores
resume
```

If Codex can cleanly put the upload manager into the dashboard shell without creating global state complexity, do it.

Otherwise durable restoration is sufficient.

Avoid a giant new app-wide context unless it provides real value.

---

# 33. Error UX

Errors must describe the recoverable action.

Bad:

> Upload failed.

Better:

```text
Connection interrupted.
Your uploaded progress is safe.

[ Resume ]
```

Bad file:

```text
This file doesn't match the expected MP4 format.
Choose another video.
```

Membership revoked:

```text
You no longer have permission to upload to this memorial.
```

Quota:

```text
This memorial has reached its 10 GB media limit.
```

Pro restriction:

```text
Original audio and video are available on the Pro plan.
```

Do not turn a 403 into a generic network error.

---

# 34. Do not change these things accidentally

Do not:

* create another global user-role system;
* bypass `getMemorialAccess()`;
* expose R2 credentials to the browser;
* allow authenticated-but-nonmember users to use member uploads;
* let trusted/contributor users POST directly to editorial `media_items`;
* auto-publish unreviewed audio/video;
* send large audio/video through a Next.js `formData()` fallback;
* trust client MIME/media type;
* reserve quota only after bytes have already uploaded;
* insert duplicate `media_items` on finalize retry;
* show unfinalized permanent-key objects publicly;
* count YouTube embeds as archived storage;
* rewrite the HEIC/original-image architecture without understanding it;
* remove Range support from media delivery;
* silently start over from byte 0 after a failed multipart part.

---

# 35. Recommended code organization

Exact names may change after planning, but aim for a structure approximately like:

```text
lib/
  uploads/
    capabilities.ts
    constants.ts
    fingerprint.ts
    upload-session.ts
    authenticated-media.ts

  r2.ts
    + multipart helpers

components/
  uploads/
    media-upload-item.tsx
    media-upload-list.tsx
    media-upload-progress.tsx

hooks/
  use-resumable-media-upload.ts

app/api/memorials/[id]/
  uploads/
    sessions/
    multipart/
    finalize/
    abort/

components/memorial/
  contribution-composer...
```

Do not blindly follow these filenames if the repo already has a cleaner adjacent abstraction.

Plan against the codebase first.

---

# 36. Migration strategy

Use new migrations after the existing membership migration.

Likely:

```text
21_resumable_media_upload_sessions.sql
22_external_video_sources.sql
```

or one well-structured migration if appropriate.

Never modify migration `20_memorial_membership_read_access.sql` after deployment.

Include:

```text
tables
constraints
indexes
RLS/revokes
cleanup-related DB functions
atomic finalization RPC if required
```

---

# 37. Rollout strategy

Do not rip out the current working small-file path in one uncontrolled rewrite.

Implement in this order:

1. Durable upload-session schema. - COMPLETED
2. R2 multipart helpers. - COMPLETED
3. Server multipart/session APIs. - COMPLETED
4. Headless Uppy engine. - COMPLETED
5. Studio audio/video integration. - COMPLETED
6. Resume/refresh recovery. - COMPLETED
7. Verification + idempotent finalization. - COMPLETED
8. Remove silent server fallback. - COMPLETED
9. Authenticated contributor integration. - COMPLETED
10. Remove anonymous raw video. - COMPLETED
11. Add YouTube contribution. - COMPLETED
12. Cleanup cron. - COMPLETED
13. Observability. - COMPLETED
14. Harden media delivery for unfinalized direct keys. - COMPLETED
15. End-to-end role/network testing. - PENDING DEPLOYED ACCEPTANCE

Phase 15 is intentionally not marked complete yet. Local policy tests, TypeScript,
the Next.js production build, the OpenNext Cloudflare build, and a live local API
check rejecting anonymous raw video have passed. Migrations 21–22 have now been
applied successfully, and the signed-in owner/Pro Studio upload controls load
without application runtime errors. Migration 23 now hardens reservation/session
expiry coupling, lost multipart-completion reconciliation, and non-approved media
projection cleanup, but still needs to be applied before those paths can be tested.
The remaining throttled-network, refresh, role-revocation, real R2 multipart,
quota-race, and expiry-cleanup cases require confirmation that `r2-cors.json` is
active plus a disposable test memorial with owner, co-admin, trusted, contributor,
and nonmember accounts. They have not been run against the existing memorial
because the scenarios create, moderate, revoke, and delete real data.

If necessary, retain the old pipeline behind a temporary internal feature flag for rollback.

But never silently fall back from new → old during an upload. That would hide failures again.

---

# 38. Required acceptance tests

Do not consider this project complete until these scenarios actually pass.

### Owner / Studio

Upload an 80 MB MP4 on throttled internet.

At ~50%:

```text
refresh page
```

Expected:

```text
existing upload recovered
already uploaded chunks remain
upload resumes
one media item appears
```

No byte-zero restart.

### 6 MB audio

Use a deliberately slow uplink.

Expected:

```text
visible byte progress
multipart because >5 MiB
refresh/retry retains uploaded part
```

This specifically addresses the real production failure that started this work.

### Network cut

Kill internet during part N.

Expected:

```text
part fails
uploader pauses/retries
internet returns
only missing part resumes
```

### Expired signed part URL

Expected:

```text
fresh signature
same session
same multipart uploadId
no restart
```

### Duplicate finalization

Send finalize twice.

Expected:

```text
one media_items row
one storage commitment
same result returned
```

### Co-admin

Same Studio resumable behavior as owner.

No owner-only Manage/payment/privacy capability regression.

### Trusted contributor

Upload native video from authenticated contributor workspace.

Expected:

```text
upload succeeds resumably
submission is not direct editorial media
audio/video requires human review
owner can approve
then appears publicly exactly once
```

### Regular contributor

Same upload mechanics.

Contribution remains pending approval.

### Revoked member during upload

Remove membership halfway through.

Expected:

```text
next protected server operation returns 403
cannot finalize
session eventually aborted/cleaned
quota released
no public media
```

### Random authenticated user

Logged into Theirs but not an accepted member.

Expected:

```text
cannot access authenticated raw-video upload APIs
```

### Anonymous public visitor

Expected contribution options:

```text
tribute
memory
photo
voice
YouTube video
```

No raw video file chooser.

Calling raw-video guest API manually must also fail.

### Free memorial

Attempt owner/co-admin/member native audio/video.

Server denies it regardless of hacked client UI.

### Quota race

Start several uploads when close to 10 GB.

Expected:

```text
atomic reservations prevent exceeding entitlement
```

### Invalid MIME

Rename executable/junk bytes:

```text
fake.mp4
```

Expected:

```text
post-upload magic-byte verification fails
object removed
quota released
```

### Orphan cleanup

Create multipart upload and abandon it.

Expected after expiry:

```text
multipart aborted
session expired
reservation released
```

### Public-object safety

Complete bytes into the new direct permanent-key prefix but do not finalize DB media row.

Attempt `/api/media?key=...`.

Expected:

```text
404
```

Finalize.

Expected:

```text
media becomes readable according to memorial privacy
```

---

# 39. Definition of done

The task is not done when:

> Multipart upload works on localhost.

It is done when the entire production behavior is coherent:

```text
Owner/co-admin:
original family media
→ durable direct/resumable R2 upload
→ verified
→ permanent archive

Accepted contributor:
original family media
→ durable direct/resumable upload
→ contribution/moderation rules
→ approved archive

Anonymous:
lightweight contribution
→ no raw video abuse surface
→ YouTube reference when video is needed
```

And the core invariant must hold:

> **Once Theirs tells a user that part of a file has been uploaded, ordinary refreshes, temporary network failures, and retryable server errors must not force those successfully uploaded bytes to be sent again.**

That is the standard this implementation should optimize for.

[1]: https://developers.cloudflare.com/r2/objects/upload-objects/?utm_source=chatgpt.com "Upload objects · Cloudflare R2 docs"
[2]: https://uppy.io/docs/guides/migration-guides/?utm_source=chatgpt.com "Migration guides | Uppy"
[3]: https://uppy.io/docs/aws-s3/ "AWS S3 | Uppy"
[4]: https://uppy.io/docs/golden-retriever/?utm_source=chatgpt.com "Golden Retriever | Uppy"
[5]: https://developers.cloudflare.com/r2/buckets/cors/?utm_source=chatgpt.com "Configure CORS · Cloudflare R2 docs"
[6]: https://uppy.io/docs/aws-s3/?utm_source=chatgpt.com "AWS S3 | Uppy"
[7]: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js/?utm_source=chatgpt.com "aws-sdk-js · Cloudflare R2 docs"
