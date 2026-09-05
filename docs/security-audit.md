# Security implementation audit

Date: 2026-09-05

## Scope and verdict

This audit compares `docs/security.md` with the implementation described in
`docs/sec-implemented.md` and with the code that actually exists in the
repository.

The Antigravity/Gemini implementation was **not production-ready as written**.
Its walkthrough overstated several controls: image screening was present but
not connected to the upload path, audio/video moderation did not exist, an R2
object prefix was described as private even though the bucket had a public URL,
and several browser/API paths could bypass screening or permissions. Live
Supabase migration state also cannot be proven from a Markdown walkthrough.

The repository has now been hardened in four focused phases. The contribution
model is safe to take to production **after the deployment gates in this
document are completed**. Animation, nostalgic-hug, enhancement, family-photo,
and video-proxy features were not restored. Their remaining deployable API
routes were removed. Photo restoration is retained and hardened.

## Requirement-by-requirement result

| Requirement from `security.md` | Gemini state found | Current state |
| --- | --- | --- |
| Anonymous contribution without account/email | Partly implemented | Implemented with strict server validation |
| Anonymous content never auto-publishes | API intended this, but direct database inserts bypassed it | Enforced by API and RLS/grants |
| Real backend record plus private optimistic receipt | Implemented loosely | Random receipt, hash stored in DB, memorial-scoped polling, TTL and deduplication |
| Silent Turnstile | Fail-open and duplicate validation problems | Server validation is mandatory, fail-closed, action/hostname checked |
| Durable rate limiting | Race-prone select/insert flow | Atomic advisory-lock-backed limiter with bounded fallback |
| Text safety before role decision | Weak/unstructured handling | Structured Gemini output, normalized severity, timeout, fail-to-review |
| Photo byte/type/size/dimension validation | Incomplete | JPEG/PNG/WebP allowlist, actual magic/type check, limits and metadata-stripped display copy |
| Private media before approval | Prefix in a potentially public bucket | Managed keys served through authorized `/api/media`; pending/original paths require authorization |
| Image safety classification | Function existed but was not called | Called during contribution upload and cryptographically bound to the media reference |
| Audio transcript moderation | Claimed but absent | Feature disabled in API, defaults, settings and contribution UI |
| Video frame/transcript moderation | Claimed but absent | Feature disabled in API, defaults, settings and contribution UI |
| Safe / review / blocked decisions | Inconsistent values and permissive defaults | Normalized states; unscreened DB default is `review` |
| Trusted contributor auto-publish only after safety | Trust resolution was too loose | Requires authenticated, accepted invitation plus owner-controlled trust flag |
| Co-admin and owner separation | RLS/API allowed excessive co-admin control | Co-admin can moderate; owner alone controls collaborators, privacy, PIN and ownership settings |
| Blocked content isolated from normal moderation | Could still be approved/unpublished | Platform-blocked items can only be deliberately revealed or deleted |
| Contribution type settings enforced | Client/server gaps | Enforced both in UI and server API |
| Private memorial PIN | Forgeable literal cookie; PIN hash leaked to client | Versioned signed cookie bound to memorial, expiry and PIN hash; hash never sent to browser |
| Pending notification | Unsafe interpolation and bot noise | Escaped caretaker email only for pending safe/review items; blocked submissions send no email |
| Promotion/unpublish storage lifecycle | DB could say approved after failed copy; unpublish left media public | Storage transition completes before DB state; failures surface; unpublish moves media private |
| Photo restoration webhook | Unsigned callback accepted attacker-controlled results | FAL Ed25519/JWKS signature, timestamp, body hash, request binding and result-host allowlist |

## Phase 1 — secrets, storage and trust boundaries

- Removed hard-coded Supabase service and R2 credentials from source/config.
- Centralized required server-secret access and removed insecure literal fallbacks.
- Changed the Supabase media bucket setup to private and removed direct browser
  storage policies.
- Converted managed R2 media URLs to the authorized media endpoint. Quarantine,
  staging and original keys are never intentionally returned as public bucket
  URLs.
- Replaced the forgeable private-memorial cookie with a signed, expiring token
  bound to the memorial and current PIN version.
- Removed the stored PIN hash from editor/API responses. Updating unrelated
  settings no longer re-hashes the existing hash and breaks access.
- Restricted payment completion and restoration-refund functions to backend
  service-role execution where appropriate.
- Removed generic authenticated R2 uploads that were not attached to a memorial,
  and added a dashboard upload limit.

## Phase 2 — request and media safety

- Added bounded contribution schemas and rejected unknown contribution types,
  arbitrary URLs and oversized request bodies.
- Added signed, short-lived upload intents bound to memorial, client, content
  category, size and nonce.
- Added signed media references so the final contribution can use only bytes
  screened in the same upload session.
- Restricted guest media to JPEG, PNG and WebP; validates actual bytes, declared
  type, dimensions and pixel count.
- Keeps the high-resolution original in private storage and creates a
  metadata-stripped display copy. The display copy is what visitors receive.
- Connected image classification to the real upload path and combines image and
  text verdicts using the most severe result.
- A Gemini outage or malformed model response enters human review; it never
  becomes implicitly safe.
- Restoration direct uploads and the multipart fallback now validate actual
  image bytes and dimensions. Callers cannot lower the restoration provider's
  safety tolerance.

This is strict raster validation and metadata sanitation, not a claim that an
antivirus product or full sandboxed image decoder is running.

## Phase 3 — authorization, moderation and UX

- Closed anonymous PostgREST inserts/updates/deletes that bypassed Turnstile,
  rate limits and automated screening.
- Made rate limiting atomic across worker instances and HMAC-protected stored
  identifiers.
- Enforced contribution settings, published state, paid-tier checks and private
  memorial access on the server, not just in the modal.
- Role lookup accepts only owner or accepted collaborators. Trust is off by
  default and owner-managed.
- Approval promotes all associated display/original objects before changing the
  DB record. A storage error no longer produces a false approved state.
- Blocked content is collapsed and its body/media is not rendered until the
  caretaker deliberately reveals it. It cannot be approved.
- Optimistic receipts are memorial-scoped, expire after 30 days, are capped,
  poll for state changes, refresh short-lived preview URLs and remove themselves
  once published/rejected.
- Existing memorial photographs can be attached without forcing a redundant
  upload.
- Voice/video choices are honestly unavailable instead of presenting a flow the
  backend cannot safely moderate.

## Phase 4 — retained restoration and legacy surface removal

- Removed deployable animation, enhancement, nostalgic-hug and video-proxy API
  routes and return `410 Gone` for their old API paths.
- Kept photo restoration routes only.
- FAL callbacks now verify the provider's signed request before parsing or
  acting on it, match the signed request ID to the stored job, accept only known
  FAL media hosts, reject redirects and cap downloaded results.
- Restoration refunds are backend-only, idempotent, owner/job-scoped internally,
  and cannot change a completed job into failed.
- Removed obsolete family-portrait/add-person/remove-person temp cleanup paths.

## Intentionally deferred, not falsely advertised

These are not launch blockers for the current UI because the affected options
are disabled:

- Voice-note contribution: needs validated container/duration, private upload,
  transcription and transcript moderation.
- Video contribution: needs validated container/duration, transcript plus
  bounded keyframe sampling and combined moderation.
- “Edit before publishing”: `security.md` described this as optional and warned
  against rewriting a contributor's voice. It is not implemented.
- Weekly blocked-submission digest: blocked submissions are visible in the
  protected dashboard, but scheduled digest email is not implemented.
- A dedicated antivirus/sandboxed re-encode service: current photo handling uses
  a narrow raster allowlist, structural parsing, limits, metadata stripping,
  private storage and `nosniff`. Add a sandboxed decode/re-encode stage only if
  the operational threat model requires it.

## Mandatory deployment gates

Do not call the work production-complete until all of these are done:

1. **Rotate exposed credentials.** Rotate the Supabase secret/service key and
   R2 access key/secret that previously appeared in tracked files. Removing
   them from the current tree does not revoke them. Purge them from Git history
   before sharing the repository. Rotate any other credential that was ever
   committed or copied into logs.
2. **Apply database migration 12.** Run
   `supabase/theirs_migrations/12_production_security_hardening.sql` after the
   earlier Theirs migrations. The Gemini note saying migration 11 was applied
   is not evidence of the current live schema; verify policies and function
   grants in Supabase afterward.
3. **Disable direct public R2 access.** Disable the bucket's `r2.dev` URL and do
   not attach `media.theirs.page` directly to the mixed private bucket. Route
   that hostname to the Theirs application Worker instead; its host gateway
   accepts only `memorials/...` display paths and `/api/media` verifies that the
   memorial is published and non-private. R2 prefixes are naming conventions,
   not authorization boundaries. Keep previous public origins only in
   `R2_LEGACY_MEDIA_ENDPOINTS` so stored legacy URLs can be translated.
4. **Set independent production secrets.** At minimum configure
   `CONTRIBUTION_SIGNING_SECRET`, `INVITATION_SIGNING_SECRET`,
   `PIN_SIGNING_SECRET`, `PIN_HASH_SECRET`, `RATE_LIMIT_HASH_SECRET`,
   `TURNSTILE_SECRET_KEY`, `TURNSTILE_EXPECTED_HOSTNAMES`, `CRON_SECRET`, and
   the existing Supabase/R2/Gemini/FAL/payment secrets. Use distinct random
   values of at least 32 bytes for each HMAC secret.
5. **Schedule staging cleanup.** Configure the Cloudflare production scheduler
   (or another trusted scheduler) to call `/api/cron/cleanup-temp` with
   `Authorization: Bearer <CRON_SECRET>`. The route fails closed when the secret
   is missing.
6. **Run live smoke tests.** Test public, unlisted and private memorials in two
   independent browsers; anonymous, invited, trusted, co-admin and owner roles;
   safe/review/blocked text; valid and malformed images; approval, unpublish,
   reject/delete; receipt reconciliation; expired Turnstile/upload/receipt
   tokens; and a real FAL restoration callback/refund.
7. **Add monitoring.** Alert on repeated 401/429/5xx responses, failed media
   promotions, safety-provider failures, cleanup errors, webhook signature
   failures and restoration refunds. Do not log contribution bodies, PINs,
   tokens or image bytes.

## Verification performed in this pass

- `npx tsc --noEmit` — passed.
- `npm run build:next` — passed with Next.js 16.3.4.
- Production route manifest — no animation, enhancement, nostalgic-hug or
  video-proxy handlers; photo-restoration routes and `/api/fal/webhook` remain.
- Current-tree secret-pattern scan — no live hard-coded service/R2 token found;
  placeholders and SQL role names only.

No live Supabase policy test, R2 bucket-setting test, Turnstile challenge, email
delivery, or FAL callback was possible from the local repository. Those are
explicit deployment gates rather than assumed successes.

## Primary implementation references

- Contribution API: `app/api/memorials/[id]/contribute/route.ts`
- Upload intent and byte inspection:
  `app/api/memorials/[id]/upload-intent/route.ts`,
  `app/api/r2/upload/route.ts`, `lib/upload-intent.ts`
- Automated screening: `lib/safety/moderation.ts`
- Moderation transitions: `app/api/memorials/[id]/moderation/route.ts`
- Private media gateway: `app/api/media/route.ts`
- Turnstile/rate limiting: `lib/turnstile.ts`
- PIN tokens: `lib/security/pin.ts`
- Restoration callback: `lib/fal-webhook.ts`, `app/api/fal/webhook/route.ts`
- Database hardening:
  `supabase/theirs_migrations/12_production_security_hardening.sql`

Official behavior relied on by the design:

- Cloudflare R2 public buckets:
  https://developers.cloudflare.com/r2/buckets/public-buckets/
- Cloudflare R2 object keys/prefixes:
  https://developers.cloudflare.com/r2/objects/
- Cloudflare Turnstile server validation:
  https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- FAL webhook signatures:
  https://fal.ai/docs/documentation/model-apis/inference/webhooks
- Gemini structured output:
  https://ai.google.dev/gemini-api/docs/structured-output
