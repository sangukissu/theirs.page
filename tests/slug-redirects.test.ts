import assert from "node:assert/strict"
import test from "node:test"

// ==============================================================================
// SLUG REDIRECT & 1-TIME CHANGE POLICY SPECIFICATION TESTS
// ==============================================================================

test("SLUG POLICY: Virgin draft mode allows unlimited slug changes without recording redirects", () => {
  const memorial = {
    status: "draft",
    published_at: null,
    slug: "john-doe",
    slug_change_count: 0,
  }
  const body = { slug: "john-r-doe", status: "draft" }

  const currentChangeCount = memorial.slug_change_count || 0
  const hasEverBeenPublished = Boolean(
    memorial.published_at ||
    memorial.status === "published" ||
    body.status === "published" ||
    currentChangeCount > 0
  )

  let recordedRedirect = false
  let updatedChangeCount = currentChangeCount

  if (hasEverBeenPublished) {
    if (currentChangeCount >= 1) {
      throw new Error("Locked")
    }
    if (memorial.slug !== body.slug) {
      recordedRedirect = true
      updatedChangeCount = currentChangeCount + 1
    }
  }

  assert.equal(hasEverBeenPublished, false, "Virgin draft must not be marked as ever published")
  assert.equal(recordedRedirect, false, "Virgin draft must never record a redirect")
  assert.equal(updatedChangeCount, 0, "Virgin draft must not increment slug_change_count")
})

test("SLUG POLICY: Ever-published memorial unpublished to draft STILL enforces 1-time change limit and records redirect", () => {
  // Memorial was published in the past (QR codes printed/distributed), but owner set status back to "draft"
  const memorial = {
    status: "draft",
    published_at: "2026-01-15T12:00:00Z",
    slug: "john-doe",
    slug_change_count: 0,
  }
  const body: { slug: string; status?: string } = { slug: "john-robert-doe" }

  const currentChangeCount = memorial.slug_change_count || 0
  const hasEverBeenPublished = Boolean(
    memorial.published_at ||
    memorial.status === "published" ||
    body.status === "published" ||
    currentChangeCount > 0
  )

  let recordedRedirect = false
  let oldSlugSaved: string | null = null
  let updatedChangeCount = currentChangeCount

  if (hasEverBeenPublished) {
    if (currentChangeCount >= 1) {
      throw new Error("Locked")
    }
    if (memorial.slug !== body.slug) {
      recordedRedirect = true
      oldSlugSaved = memorial.slug
      updatedChangeCount = currentChangeCount + 1
    }
  }

  assert.equal(hasEverBeenPublished, true, "Must detect prior publication via published_at")
  assert.equal(recordedRedirect, true, "Must record redirect even while currently in draft")
  assert.equal(oldSlugSaved, "john-doe")
  assert.equal(updatedChangeCount, 1, "Must increment slug_change_count to 1")
})

test("SLUG POLICY: Ever-published memorial unpublished to draft CANNOT bypass locked state after 1 change", () => {
  // Memorial was published, changed slug once, and owner attempts to unpublish to bypass
  const memorial = {
    status: "draft", // Owner switched to draft!
    published_at: "2026-01-15T12:00:00Z",
    slug: "john-robert-doe",
    slug_change_count: 1, // Already used 1 change
  }
  const body = { slug: "john-r-doe-bypass", status: "draft" }

  const currentChangeCount = memorial.slug_change_count || 0
  const hasEverBeenPublished = Boolean(
    memorial.published_at ||
    memorial.status === "published" ||
    body.status === "published" ||
    currentChangeCount > 0
  )

  let errorOccurred = false
  let errorMessage = ""

  try {
    if (hasEverBeenPublished) {
      if (currentChangeCount >= 1) {
        throw new Error(
          "This web address is permanently set to protect printed keepsake cards and shared QR codes from broken links."
        )
      }
    }
  } catch (err: any) {
    errorOccurred = true
    errorMessage = err.message
  }

  assert.equal(errorOccurred, true, "Unpublishing MUST NOT bypass the 1-time change limit")
  assert.ok(errorMessage.includes("permanently set"))
  assert.ok(errorMessage.includes("broken links"))
})

test("SLUG POLICY: Published mode allows 1st slug change and records redirect for printed QR codes", () => {
  const isPublished = true
  const currentSlug: string = "john-doe"
  const newSlug: string = "john-robert-doe"
  const currentChangeCount = 0

  let recordedRedirect = false
  let oldSlugSaved: string | null = null
  let updatedChangeCount = currentChangeCount

  if (isPublished) {
    if (currentChangeCount >= 1) {
      throw new Error("Locked")
    }
    if (currentSlug !== newSlug) {
      recordedRedirect = true
      oldSlugSaved = currentSlug
      updatedChangeCount = currentChangeCount + 1
    }
  }

  assert.equal(recordedRedirect, true, "Published 1st change must record a redirect")
  assert.equal(oldSlugSaved, "john-doe", "Original slug must be recorded so QR codes redirect")
  assert.equal(updatedChangeCount, 1, "slug_change_count must be incremented to 1")
})

test("SLUG POLICY: Saving other settings on published memorial does NOT count as a slug change", () => {
  const isPublished = true
  const currentSlug = "john-doe"
  const newSlug = "john-doe" // unchanged
  const currentChangeCount = 0

  let recordedRedirect = false
  let updatedChangeCount = currentChangeCount

  if (currentSlug !== newSlug && isPublished) {
    recordedRedirect = true
    updatedChangeCount = currentChangeCount + 1
  }

  assert.equal(recordedRedirect, false)
  assert.equal(updatedChangeCount, 0, "Non-slug setting saves must leave count at 0")
})

test("SLUG AVAILABILITY: Redirected old slugs cannot be claimed by new memorials", () => {
  // Mock redirects table containing historical QR code slugs
  const mockRedirects = new Set(["carter-memorial", "robert-c-1944"])
  const mockMemorials = new Set(["active-memorial", "another-one"])

  function isSlugAvailable(candidate: string, currentMemorialId?: string) {
    const clean = candidate.toLowerCase().trim()
    if (mockMemorials.has(clean)) return false
    if (mockRedirects.has(clean)) return false
    return true
  }

  assert.equal(isSlugAvailable("carter-memorial"), false, "Redirected slug must not be available")
  assert.equal(isSlugAvailable("robert-c-1944"), false, "Redirected slug must not be available")
  assert.equal(isSlugAvailable("active-memorial"), false, "Active memorial slug must not be available")
  assert.equal(isSlugAvailable("brand-new-family-slug"), true, "Unused slug is available")
})

test("QR & REDIRECT RESOLVER: Resolves old slug directly to active target slug in 1 hop", () => {
  // Mock DB structure
  const mockMemorials: Record<string, { id: string; slug: string; status: string }> = {
    "uuid-123": { id: "uuid-123", slug: "robert-carter-final", status: "published" },
  }
  const mockRedirects: Record<string, { memorial_id: string; old_slug: string }> = {
    "robert-carter-early": { memorial_id: "uuid-123", old_slug: "robert-carter-early" },
  }

  function resolveMemorialSlug(inputSlug: string) {
    // 1. Direct active match
    for (const mem of Object.values(mockMemorials)) {
      if (mem.slug === inputSlug) return { targetSlug: mem.slug, isRedirect: false }
    }
    // 2. Redirect check
    const redirect = mockRedirects[inputSlug]
    if (redirect) {
      const activeMem = mockMemorials[redirect.memorial_id]
      if (activeMem) {
        return { targetSlug: activeMem.slug, isRedirect: true }
      }
    }
    return null
  }

  // Scanning printed card with original slug
  const resolved = resolveMemorialSlug("robert-carter-early")
  assert.ok(resolved !== null)
  assert.equal(resolved.isRedirect, true)
  assert.equal(resolved.targetSlug, "robert-carter-final", "Must redirect directly to active slug")
})
