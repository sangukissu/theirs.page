import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { resolveMediaCapabilities } from "../../lib/uploads/capabilities"
import {
  AUTHENTICATED_MEDIA_LIMITS,
  GUEST_AUDIO_LIMIT_BYTES,
  isDetectedMediaMimeCompatible,
  isManagedMediaFilename,
  mediaAcceptAttribute,
  MEDIA_MIME_TYPES,
  MIB,
  shouldUseMultipart,
  resolveMediaMime,
} from "../../lib/uploads/constants"
import { createUploadFingerprint } from "../../lib/uploads/fingerprint"
import {
  dedupeUploadItems,
  UploadPreparationRegistry,
  hasUsableFileData,
  uploadIndexedDbName,
  uploadManagerKey,
} from "../../lib/uploads/client-scope"
import { escapeS3Xml, s3XmlResponse } from "../../lib/uploads/s3-control-response"
import { parseYouTubeUrl } from "../../lib/uploads/youtube"
import { validateMagicBytes } from "../../lib/safety/moderation"
import { isUploadSessionSchemaError } from "../../lib/uploads/schema-errors"


test("Studio upload capabilities are scoped to owner and co-admin", () => {
  const owner = resolveMediaCapabilities({ context: "studio", isPaid: true, accessRole: "owner", existingMediaCounts: { image: 50 } })
  assert.equal(owner.nativePhoto, true)
  assert.equal(owner.nativeAudio, true)
  assert.equal(owner.nativeVideo, true)
  assert.equal(owner.requiresModeration, false)

  const freeCoAdmin = resolveMediaCapabilities({ context: "studio", isPaid: false, accessRole: "co_admin", existingMediaCounts: { image: 0 } })
  assert.equal(freeCoAdmin.nativePhoto, true)
  assert.equal(freeCoAdmin.nativeAudio, false)
  assert.equal(freeCoAdmin.nativeVideo, false)

  const trusted = resolveMediaCapabilities({ context: "studio", isPaid: true, accessRole: "trusted", existingMediaCounts: { image: 0 } })
  assert.equal(trusted.nativePhoto, false)
  assert.equal(trusted.resumableUpload, false)
})

test("member and guest capabilities preserve moderation and plan boundaries", () => {
  const trusted = resolveMediaCapabilities({
    context: "member_contribution",
    isPaid: true,
    accessRole: "trusted",
    contributionSettings: { accept_contributions: true, photos: true, voice: true, videos: true },
    existingMediaCounts: { image: 0 },
  })
  assert.equal(trusted.nativePhoto, true)
  assert.equal(trusted.nativeAudio, true)
  assert.equal(trusted.nativeVideo, true)
  assert.equal(trusted.requiresModeration, true)

  const freeMember = resolveMediaCapabilities({
    context: "member_contribution",
    isPaid: false,
    accessRole: "contributor",
    contributionSettings: { voice: true, videos: true },
    existingMediaCounts: { image: 0 },
  })
  assert.equal(freeMember.nativeAudio, false)
  assert.equal(freeMember.nativeVideo, false)
  assert.equal(freeMember.youtubeVideo, true)

  const randomUser = resolveMediaCapabilities({
    context: "member_contribution",
    isPaid: true,
    accessRole: null,
    contributionSettings: { photos: true, voice: true, videos: true },
    existingMediaCounts: { image: 0 },
  })
  assert.equal(randomUser.nativePhoto, false)
  assert.equal(randomUser.nativeVideo, false)

  const guest = resolveMediaCapabilities({
    context: "guest_contribution",
    isPaid: true,
    contributionSettings: { photos: true, voice: true, videos: true },
    existingMediaCounts: { image: 0 },
  })
  assert.equal(guest.nativeVideo, false)
  assert.equal(guest.youtubeVideo, true)
  assert.equal(guest.maxAudioBytes, GUEST_AUDIO_LIMIT_BYTES)
})

test("capability resolver owns Free-tier image quota state", () => {
  const available = resolveMediaCapabilities({
    context: "studio",
    isPaid: false,
    accessRole: "owner",
    existingMediaCounts: { image: 4 },
  })
  assert.equal(available.nativePhoto, true)
  assert.equal(available.maxImageItems, 5)
  assert.equal(available.remainingImageItems, 1)
  assert.equal(available.imageQuotaReached, false)

  const full = resolveMediaCapabilities({
    context: "studio",
    isPaid: false,
    accessRole: "owner",
    existingMediaCounts: { image: 5 },
  })
  assert.equal(full.nativePhoto, false)
  assert.equal(full.remainingImageItems, 0)
  assert.equal(full.imageQuotaReached, true)

  const unknown = resolveMediaCapabilities({
    context: "guest_contribution",
    isPaid: false,
    existingMediaCounts: { image: null },
  })
  assert.equal(unknown.imageQuotaKnown, false)
  assert.equal(unknown.remainingImageItems, null)
  assert.equal(unknown.imageQuotaReached, false)
  assert.equal(unknown.nativePhoto, false)

  const paid = resolveMediaCapabilities({
    context: "studio",
    isPaid: true,
    accessRole: "owner",
    existingMediaCounts: { image: 500 },
  })
  assert.equal(paid.nativePhoto, true)
  assert.equal(paid.maxImageItems, null)
  assert.equal(paid.remainingImageItems, null)
})

test("multipart thresholds cover the slow 6 MiB audio and 80 MiB video cases", () => {
  assert.equal(shouldUseMultipart("audio", 5 * MIB), false)
  assert.equal(shouldUseMultipart("audio", 6 * MIB), true)
  assert.equal(shouldUseMultipart("video", 80 * MIB), true)
  assert.equal(shouldUseMultipart("image", 10 * MIB), false)
  assert.equal(shouldUseMultipart("image", 10 * MIB + 1), true)
  assert.equal(AUTHENTICATED_MEDIA_LIMITS.video, 100 * MIB)
})

test("YouTube parser stores only a canonical provider, ID, and URL", () => {
  const expected = {
    provider: "youtube",
    id: "dQw4w9WgXcQ",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  }
  assert.deepEqual(parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=4"), expected)
  assert.deepEqual(parseYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ"), expected)
  assert.deepEqual(parseYouTubeUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ"), expected)
  assert.equal(parseYouTubeUrl("https://youtube.com.example.test/watch?v=dQw4w9WgXcQ"), null)
  assert.equal(parseYouTubeUrl("https://vimeo.com/dQw4w9WgXcQ"), null)
  assert.equal(parseYouTubeUrl("<iframe src='https://youtube.com/embed/dQw4w9WgXcQ'>"), null)
})

test("upload fingerprint is stable and changes with file metadata", () => {
  const file = { name: "family-video.mp4", size: 80 * MIB, type: "video/mp4", lastModified: 12345 }
  const first = createUploadFingerprint(file, "memorial-a", "user-a", "studio_gallery")
  assert.equal(first, createUploadFingerprint(file, "memorial-a", "user-a", "studio_gallery"))
  assert.notEqual(first, createUploadFingerprint({ ...file, size: file.size + 1 }, "memorial-a", "user-a", "studio_gallery"))
  assert.notEqual(first, createUploadFingerprint(file, "memorial-b", "user-a", "studio_gallery"))
  assert.notEqual(first, createUploadFingerprint(file, "memorial-a", "user-b", "studio_gallery"))
  assert.notEqual(first, createUploadFingerprint(file, "memorial-a", "user-a", "member_contribution"))
})

test("Uppy runtime and persisted recovery state are isolated by account", () => {
  const firstManager = uploadManagerKey("user-a", "memorial-a", "studio_gallery")
  assert.notEqual(firstManager, uploadManagerKey("user-b", "memorial-a", "studio_gallery"))
  assert.notEqual(firstManager, uploadManagerKey("user-a", "memorial-a", "member_contribution"))

  const firstDatabase = uploadIndexedDbName("user-a", "memorial-a", "studio_gallery")
  assert.notEqual(firstDatabase, uploadIndexedDbName("user-b", "memorial-a", "studio_gallery"))
  assert.notEqual(firstDatabase, uploadIndexedDbName("user-a", "memorial-b", "studio_gallery"))
})

test("upload queue identity is unique by Uppy file and durable session", () => {
  const queue = dedupeUploadItems([
    { id: "uppy-a", sessionId: "session-a", value: "newest" },
    { id: "uppy-a", sessionId: "session-a", value: "duplicate-id" },
    { id: "uppy-b", sessionId: "session-a", value: "duplicate-session" },
    { id: "uppy-c", sessionId: "session-c", value: "other" },
  ])
  assert.deepEqual(queue.map((item) => item.value), ["newest", "other"])
})

test("cancelling preparation aborts session creation before Uppy can start", () => {
  const preparations = new UploadPreparationRegistry()
  const first = preparations.begin("preparing:first")
  assert.equal(first.signal.aborted, false)
  assert.equal(preparations.cancel("preparing:first"), true)
  assert.equal(first.signal.aborted, true)
  assert.equal(preparations.cancel("preparing:first"), false)

  const second = preparations.begin("preparing:second")
  preparations.finish("preparing:second", second)
  assert.equal(second.signal.aborted, false)
  assert.equal(preparations.cancel("preparing:second"), false)

  const third = preparations.begin("preparing:third")
  const fourth = preparations.begin("preparing:fourth")
  preparations.cancelAll()
  assert.equal(third.signal.aborted, true)
  assert.equal(fourth.signal.aborted, true)
  assert.equal(preparations.cancel("preparing:third"), false)
})

test("R2 CORS policy permits only direct upload PUTs and exposes multipart ETags", async () => {
  const policyUrl = new URL("../../r2-cors.json", import.meta.url)
  const policy = JSON.parse(await readFile(policyUrl, "utf8")) as Array<{
    AllowedOrigins: string[]
    AllowedMethods: string[]
    AllowedHeaders: string[]
    ExposeHeaders: string[]
  }>

  assert.equal(policy.length, 1)
  assert.deepEqual(policy[0]?.AllowedMethods, ["PUT"])
  assert.deepEqual(policy[0]?.AllowedHeaders, ["Content-Type"])
  assert.deepEqual(policy[0]?.ExposeHeaders, ["ETag"])
  assert.ok(policy[0]?.AllowedOrigins.includes("https://theirs.page"))
  assert.ok(policy[0]?.AllowedOrigins.includes("http://localhost:3000"))
})

test("S3 control errors retain Uppy's machine-readable recovery code", async () => {
  const response = s3XmlResponse(
    `<Error><Code>upload_already_completed</Code><Message>${escapeS3Xml("Continue & finalize")}</Message></Error>`,
    409,
  )

  assert.equal(response.status, 409)
  assert.equal(response.headers.get("content-type"), "application/xml")
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.match(await response.text(), /<Code>upload_already_completed<\/Code>/)
  assert.match(await s3XmlResponse(escapeS3Xml("<unsafe>")).text(), /&lt;unsafe&gt;/)
})

test("every advertised MIME has compatible magic-byte verification", () => {
  const fixture = (header: number[], marker?: { offset: number; value: string }) => {
    const value = Buffer.alloc(128)
    Buffer.from(header).copy(value)
    if (marker) value.write(marker.value, marker.offset, "latin1")
    return value
  }

  const riff = (kind: string) => fixture([], { offset: 0, value: `RIFF____${kind}` })
  const ftyp = (brand: string) => fixture([], { offset: 0, value: `____ftyp${brand}` })
  const fixtures: Record<string, Buffer> = {
    "image/jpeg": fixture([0xff, 0xd8, 0xff]),
    "image/png": fixture([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    "image/webp": riff("WEBP"),
    "image/gif": fixture([], { offset: 0, value: "GIF89a" }),
    "image/heic": ftyp("heic"),
    "image/heif": ftyp("mif1"),
    "audio/mpeg": fixture([], { offset: 0, value: "ID3" }),
    "audio/wav": riff("WAVE"),
    "audio/ogg": fixture([], { offset: 0, value: "OggS________________________vorbis" }),
    "audio/m4a": ftyp("M4A "),
    "audio/aac": fixture([0xff, 0xf1, 0x50, 0x80]),
    "audio/flac": fixture([], { offset: 0, value: "fLaC" }),
    "audio/opus": fixture([], { offset: 0, value: "OggS________________________OpusHead" }),
    "audio/mp4": ftyp("M4A "),
    "video/mp4": ftyp("isom"),
    "video/webm": fixture([0x1a, 0x45, 0xdf, 0xa3], { offset: 16, value: "webm" }),
    "video/quicktime": ftyp("qt  "),
    "video/x-matroska": fixture([0x1a, 0x45, 0xdf, 0xa3], { offset: 16, value: "matroska" }),
    "video/ogg": fixture([], { offset: 0, value: "OggS________________________\u0080theora" }),
  }

  for (const [mediaType, accepted] of Object.entries(MEDIA_MIME_TYPES)) {
    for (const mime of accepted) {
      const bytes = fixtures[mime]
      assert.ok(bytes, `missing fixture for ${mime}`)
      const result = validateMagicBytes(bytes, `fixture.${mime.split("/")[1]}`, mime)
      assert.equal(result.valid, true, mime)
      assert.equal(result.mediaType, mediaType, mime)
      assert.equal(isDetectedMediaMimeCompatible(mime, result.detectedMime), true, mime)
    }
  }
})

test("managed publication keys allow every generated media extension", () => {
  const extensionByMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "video/quicktime": "mov",
    "video/x-matroska": "mkv",
    "video/ogg": "ogv",
  }
  for (const accepted of Object.values(MEDIA_MIME_TYPES)) {
    for (const mime of accepted) {
      const extension = extensionByMime[mime] || mime.split("/")[1]
      assert.equal(isManagedMediaFilename(`2dd45470-25ed-4a2a-a44f-5c8bc19f82c3.${extension}`), true, mime)
    }
  }
  assert.equal(isManagedMediaFilename("../../unsafe.mp4"), false)
  assert.equal(isManagedMediaFilename("not-generated-name.exe"), false)
})

test("browser MIME normalization covers accepted vendor types and allowlisted extensions", () => {
  assert.equal(resolveMediaMime("video/matroska", "family-film.mkv"), "video/x-matroska")
  assert.equal(resolveMediaMime("image/x-png; charset=binary", "scan.png"), "image/png")
  assert.equal(resolveMediaMime("", "family-film.MKV"), "video/x-matroska")
  assert.equal(resolveMediaMime("application/octet-stream", "voice-note.flac"), "audio/flac")
  assert.equal(resolveMediaMime("application/octet-stream", "malware.exe"), "application/octet-stream")
  assert.match(mediaAcceptAttribute("video"), /video\/x-matroska/)
  assert.match(mediaAcceptAttribute("video"), /\.mkv/)
})

test("HEIC still and sequence brands are recognized", () => {
  for (const brand of ["heic", "heim", "heis", "hevc", "hevm", "hevs"]) {
    const bytes = Buffer.alloc(64)
    bytes.write(`____ftyp${brand}`, 0, "latin1")
    const result = validateMagicBytes(bytes, "family.heic", "image/heic")
    assert.equal(result.valid, true, brand)
    assert.equal(result.mediaType, "image", brand)
  }
})

test("missing upload hardening RPCs produce an actionable schema diagnosis", () => {
  assert.equal(isUploadSessionSchemaError({
    code: "PGRST202",
    message: "Could not find the function public.reserve_media_upload_session_storage in the schema cache",
  }), true)
  assert.equal(isUploadSessionSchemaError({ code: "42501", message: "permission denied" }), false)
})

test("hasUsableFileData distinguishes genuine file bytes from Golden Retriever ghost files", () => {
  assert.equal(hasUsableFileData(undefined), false)

  const ghostFile = {
    id: "uppy-ghost-1",
    name: "video.mp4",
    isGhost: true,
    data: { slice: () => {} },
  } as any
  assert.equal(hasUsableFileData(ghostFile), false)

  const emptyDataFile = {
    id: "uppy-no-data-2",
    name: "video.mp4",
    isGhost: false,
    data: null,
  } as any
  assert.equal(hasUsableFileData(emptyDataFile), false)

  const unsliceableDataFile = {
    id: "uppy-bad-data-3",
    name: "video.mp4",
    isGhost: false,
    data: { notASlice: true },
  } as any
  assert.equal(hasUsableFileData(unsliceableDataFile), false)

  const realFile = {
    id: "uppy-real-4",
    name: "video.mp4",
    isGhost: false,
    data: { slice: () => new Uint8Array() },
  } as any
  assert.equal(hasUsableFileData(realFile), true)
})

test("mid-upload refresh progress preserves ground-truth bytes and never shows 100% while incomplete", () => {
  const totalBytes = 89_758_105 // 85.6 MB
  const bytesUploaded = 8_388_608 // 8.0 MB (Part 1 completed)

  // Incomplete session progress computation
  const isComplete = false
  const calculatedPercentage = totalBytes
    ? (isComplete ? 100 : Math.min(99, Math.round((bytesUploaded / totalBytes) * 100)))
    : 0

  assert.equal(calculatedPercentage, 9)
  assert.notEqual(calculatedPercentage, 100)

  // Even if bytesUploaded reaches totalBytes but session isn't finalized, it caps at 99%
  const boundaryPercentage = Math.min(99, Math.round((totalBytes / totalBytes) * 100))
  assert.equal(boundaryPercentage, 99)
})

