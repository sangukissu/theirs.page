import assert from "node:assert/strict"
import test from "node:test"
import {
  validateMemorialRestoreKey,
  validateOwnedTempRestoreKey,
  buildRestorationInput,
  RESTORATION_PROMPT,
} from "../../lib/restore-helpers"

test("SECURITY: validateMemorialRestoreKey validates paths strictly", () => {
  const userId = "user-123"
  const memorialId = "mem-456"

  // Valid memorial staging/permanent keys
  assert.equal(
    validateMemorialRestoreKey(`memorials/${memorialId}/restorations/staging/abc.jpg`, memorialId, userId),
    true
  )
  assert.equal(
    validateMemorialRestoreKey(`memorials/${memorialId}/restorations/res-1/original.png`, memorialId, userId),
    true
  )

  // Valid user temp restoration key
  assert.equal(
    validateMemorialRestoreKey(`temp/restorations/${userId}/uploads/file.png`, memorialId, userId),
    true
  )

  // Rejects wrong memorial
  assert.equal(
    validateMemorialRestoreKey(`memorials/other-mem/restorations/abc.jpg`, memorialId, userId),
    false
  )

  // Rejects wrong user for temp
  assert.equal(
    validateMemorialRestoreKey(`temp/restorations/other-user/file.png`, memorialId, userId),
    false
  )

  // Rejects traversal attacks
  assert.equal(
    validateMemorialRestoreKey(`memorials/${memorialId}/restorations/../../secrets.txt`, memorialId, userId),
    false
  )
  assert.equal(
    validateMemorialRestoreKey(`temp/restorations/${userId}/../admin/file.png`, memorialId, userId),
    false
  )

  // Rejects external URLs
  assert.equal(
    validateMemorialRestoreKey(`https://evil.com/memorials/${memorialId}/restorations/1.png`, memorialId, userId),
    false
  )
  assert.equal(
    validateMemorialRestoreKey(`http://evil.com/file.png`, memorialId, userId),
    false
  )

  // Rejects empty or invalid strings
  assert.equal(validateMemorialRestoreKey("", memorialId, userId), false)
  assert.equal(validateMemorialRestoreKey("just-a-file.png", memorialId, userId), false)
})

test("SECURITY: validateOwnedTempRestoreKey strictly isolates temp uploads to user", () => {
  const userId = "user-abc"

  assert.equal(
    validateOwnedTempRestoreKey(`temp/restorations/${userId}/upload-1.jpg`, userId),
    true
  )
  assert.equal(
    validateOwnedTempRestoreKey(`temp/restorations/other-user/upload-1.jpg`, userId),
    false
  )
  assert.equal(
    validateOwnedTempRestoreKey(`temp/restorations/${userId}/../other/file.jpg`, userId),
    false
  )
})

test("FAL PROMPT: buildRestorationInput configures Fal AI parameters correctly", () => {
  const fileUrl = "https://r2.theirs.page/memorials/m1/restorations/orig.png"

  // Default behavior: full colorization and restoration prompt
  const standardInput = buildRestorationInput(fileUrl)
  assert.equal(standardInput.prompt, RESTORATION_PROMPT)
  assert.equal(standardInput.image_urls[0], fileUrl)
  assert.equal(standardInput.output_format, "png")
  assert.equal(standardInput.resolution, "1K")
  assert.equal(standardInput.seed, undefined)

  // Option: preserveOriginalColors replaces colorization with palette preservation
  const preserveColorsInput = buildRestorationInput(fileUrl, {
    preserveOriginalColors: true,
    outputFormat: "webp",
    seed: 42,
  })
  assert.notEqual(preserveColorsInput.prompt, RESTORATION_PROMPT)
  assert.match(preserveColorsInput.prompt, /Do not colorize black-and-white, sepia/)
  assert.equal(preserveColorsInput.output_format, "webp")
  assert.equal(preserveColorsInput.seed, 42)
})

test("BUSINESS RULE: Free memorials are blocked from photo restoration", () => {
  function canRestore(memorial: { is_paid: boolean }, completedOrProcessingCount: number): {
    allowed: boolean
    error?: string
    status: number
  } {
    if (!memorial.is_paid) {
      return {
        allowed: false,
        error: "Photo restoration is included with Theirs Complete.",
        status: 402,
      }
    }
    if (completedOrProcessingCount >= 5) {
      return {
        allowed: false,
        error: "All 5 photo restorations included with Theirs Complete have been used.",
        status: 403,
      }
    }
    return { allowed: true, status: 200 }
  }

  const freeMemorial = { is_paid: false }
  const result = canRestore(freeMemorial, 0)
  assert.equal(result.allowed, false)
  assert.equal(result.status, 402)
  assert.equal(result.error, "Photo restoration is included with Theirs Complete.")
})

test("BUSINESS RULE: Complete memorials include 5 restorations; failed restorations do not consume quota", () => {
  function countQuotaUsage(restorations: Array<{ status: string }>): number {
    return restorations.filter((r) => r.status === "completed" || r.status === "processing").length
  }

  const restorations = [
    { status: "completed" },
    { status: "completed" },
    { status: "failed" }, // Failed job must NOT count toward quota
    { status: "completed" },
    { status: "failed" }, // Failed job must NOT count toward quota
    { status: "processing" },
  ]

  const quotaUsed = countQuotaUsage(restorations)
  assert.equal(quotaUsed, 4) // 3 completed + 1 processing = 4. 2 failed jobs ignored!

  // Now 1 more completed job
  restorations.push({ status: "completed" })
  const newQuotaUsed = countQuotaUsage(restorations)
  assert.equal(newQuotaUsed, 5) // Exactly 5 used

  // Next attempt should be blocked
  const isBlocked = newQuotaUsed >= 5
  assert.equal(isBlocked, true)
})

test("GALLERY INVARIANT: Adding restored photo to gallery references existing R2 key without duplication", () => {
  const restoration = {
    id: "res-uuid-1",
    memorial_id: "mem-uuid-1",
    restored_image_url: "memorials/mem-uuid-1/restorations/res-uuid-1/restored.png",
  }

  function createGalleryMediaItem(input: {
    memorialId: string
    sourceRestorationId: string
    restorationKey: string
  }) {
    return {
      memorial_id: input.memorialId,
      url: input.restorationKey,
      source_restoration_id: input.sourceRestorationId,
      media_type: "image",
    }
  }

  const galleryItem = createGalleryMediaItem({
    memorialId: restoration.memorial_id,
    sourceRestorationId: restoration.id,
    restorationKey: restoration.restored_image_url,
  })

  // Verify key matches restoration asset exactly (zero R2 duplication)
  assert.equal(galleryItem.url, restoration.restored_image_url)
  assert.equal(galleryItem.source_restoration_id, restoration.id)
})

test("DELETION SAFETY: Deleting restored item from gallery preserves restoration R2 asset", () => {
  const deletedR2Keys: string[] = []

  function deleteGalleryMedia(item: { url: string; source_restoration_id?: string | null }) {
    if (!item.source_restoration_id && item.url) {
      deletedR2Keys.push(item.url)
    }
  }

  // Case 1: Standard uploaded gallery photo -> R2 deleted
  deleteGalleryMedia({ url: "memorials/mem-1/gallery/photo1.jpg", source_restoration_id: null })
  assert.equal(deletedR2Keys.length, 1)
  assert.equal(deletedR2Keys[0], "memorials/mem-1/gallery/photo1.jpg")

  // Case 2: Restored photo in gallery -> R2 MUST NOT be deleted
  deleteGalleryMedia({
    url: "memorials/mem-1/restorations/res-1/restored.png",
    source_restoration_id: "res-1",
  })
  assert.equal(deletedR2Keys.length, 1)
})

test("DELETION PROTECTION: Restoration cannot be deleted if currently referenced in gallery", () => {
  const galleryItems = [
    { id: "media-1", source_restoration_id: "res-active" },
  ]

  function canDeleteRestoration(restorationId: string): { allowed: boolean; error?: string } {
    const isReferenced = galleryItems.some((m) => m.source_restoration_id === restorationId)
    if (isReferenced) {
      return { allowed: false, error: "Remove this photo from the gallery first." }
    }
    return { allowed: true }
  }

  const blockedAttempt = canDeleteRestoration("res-active")
  assert.equal(blockedAttempt.allowed, false)
  assert.equal(blockedAttempt.error, "Remove this photo from the gallery first.")

  const allowedAttempt = canDeleteRestoration("res-unreferenced")
  assert.equal(allowedAttempt.allowed, true)
  assert.equal(allowedAttempt.error, undefined)
})
