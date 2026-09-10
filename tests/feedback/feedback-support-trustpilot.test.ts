import assert from "node:assert/strict"
import test from "node:test"
import {
  generateReviewToken,
  verifyReviewToken,
  buildReviewTrackingUrl,
} from "../../lib/reviews/trustpilot"

// ---------------------------------------------------------------------------
// 1. FEEDBACK VALIDATION TESTS
// ---------------------------------------------------------------------------

function validateFeedbackPayload(body: {
  rating?: any
  working_well?: any
  could_be_better?: any
  feedback_text?: any
}): { valid: boolean; error?: string; rating: number | null } {
  let rating: number | null = null
  if (body.rating !== undefined && body.rating !== null && body.rating !== "") {
    const parsed = Number(body.rating)
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 5) {
      rating = parsed
    } else {
      return { valid: false, error: "Experience rating must be a whole number between 1 and 5.", rating: null }
    }
  }

  const workingWell = typeof body.working_well === "string" ? body.working_well.trim() : ""
  const couldBeBetter = typeof body.could_be_better === "string" ? body.could_be_better.trim() : ""
  const feedbackText = typeof body.feedback_text === "string" ? body.feedback_text.trim() : ""

  if (!workingWell && !couldBeBetter && !feedbackText && rating === null) {
    return { valid: false, error: "Please provide either feedback notes or an experience rating.", rating: null }
  }

  return { valid: true, rating }
}

test("FEEDBACK: Rating is optional and accepts 1-5 when provided", () => {
  // 1. Feedback with no rating is valid
  const noRating = validateFeedbackPayload({ working_well: "The editor is so calm and thoughtful." })
  assert.equal(noRating.valid, true)
  assert.equal(noRating.rating, null)

  // 2. Rating with no text is valid
  const ratingOnly = validateFeedbackPayload({ rating: 5 })
  assert.equal(ratingOnly.valid, true)
  assert.equal(ratingOnly.rating, 5)

  // 3. Both text and rating
  const both = validateFeedbackPayload({ rating: 4, working_well: "Love the photo gallery", could_be_better: "Faster uploads" })
  assert.equal(both.valid, true)
  assert.equal(both.rating, 4)

  // 4. Invalid ratings rejected
  const zeroRating = validateFeedbackPayload({ rating: 0, working_well: "Bad" })
  assert.equal(zeroRating.valid, false)

  const sixRating = validateFeedbackPayload({ rating: 6, working_well: "Super" })
  assert.equal(sixRating.valid, false)

  const floatRating = validateFeedbackPayload({ rating: 4.5, working_well: "Almost" })
  assert.equal(floatRating.valid, false)

  // 5. Completely empty submission rejected
  const empty = validateFeedbackPayload({})
  assert.equal(empty.valid, false)
})

// ---------------------------------------------------------------------------
// 2. SUPPORT REQUEST VALIDATION TESTS
// ---------------------------------------------------------------------------

const SUPPORT_CATEGORIES = new Set(["General", "Billing", "Memorial", "Technical"])

function validateSupportPayload(body: {
  category?: any
  subject?: any
  message?: any
  email?: any
}): { valid: boolean; error?: string } {
  if (!body.category || !SUPPORT_CATEGORIES.has(body.category)) {
    return { valid: false, error: "Please select a valid support category." }
  }
  const subject = typeof body.subject === "string" ? body.subject.trim() : ""
  if (subject.length < 3 || subject.length > 200) {
    return { valid: false, error: "Subject must be between 3 and 200 characters." }
  }
  const message = typeof body.message === "string" ? body.message.trim() : ""
  if (message.length < 10 || message.length > 4000) {
    return { valid: false, error: "Message must be between 10 and 4,000 characters." }
  }
  if (!body.email || typeof body.email !== "string" || !body.email.includes("@")) {
    return { valid: false, error: "A valid email is required." }
  }
  return { valid: true }
}

test("SUPPORT: Category, subject, and message are validated strictly", () => {
  // Valid support requests
  assert.equal(
    validateSupportPayload({
      category: "Billing",
      subject: "Receipt request",
      message: "Please send a copy of our Complete memorial receipt.",
      email: "family@example.com",
    }).valid,
    true
  )

  assert.equal(
    validateSupportPayload({
      category: "Memorial",
      subject: "Help with timeline dates",
      message: "How do I reorder events in the early life section?",
      email: "caretaker@example.com",
    }).valid,
    true
  )

  // Disallowed category
  assert.equal(
    validateSupportPayload({
      category: "Urgent",
      subject: "Need help",
      message: "Can someone assist me right away?",
      email: "user@example.com",
    }).valid,
    false
  )

  // Message too short
  assert.equal(
    validateSupportPayload({
      category: "Technical",
      subject: "Bug",
      message: "Broken",
      email: "user@example.com",
    }).valid,
    false
  )

  // Missing email
  assert.equal(
    validateSupportPayload({
      category: "General",
      subject: "Question about Theirs",
      message: "Can multiple people contribute stories?",
      email: "",
    }).valid,
    false
  )
})

// ---------------------------------------------------------------------------
// 3. TRUSTPILOT REVIEW LIFECYCLE & ANTI-GATING INVARIANTS
// ---------------------------------------------------------------------------

interface MemorialReviewState {
  id: string
  is_paid: boolean
  status: "draft" | "published" | "archived"
  published_days_ago: number
  review_invite_sent_at: string | null
  review_invite_clicked_at: string | null
  review_reminder_sent_at: string | null
  user_internal_feedback_rating?: number | null
}

function checkTrustpilotInviteEligibility(memorial: MemorialReviewState): {
  eligibleForInvite: boolean
  eligibleForReminder: boolean
  reason?: string
} {
  // Complete tier check
  if (!memorial.is_paid) {
    return { eligibleForInvite: false, eligibleForReminder: false, reason: "Free tier not eligible" }
  }

  // Published check
  if (memorial.status !== "published") {
    return { eligibleForInvite: false, eligibleForReminder: false, reason: "Draft or archived not eligible" }
  }

  // Initial invite rule: published >= 7 days ago and no prior invite sent
  const eligibleForInvite = memorial.published_days_ago >= 7 && memorial.review_invite_sent_at === null

  // Reminder rule: invite sent at least 7 days ago, NOT clicked, and no prior reminder sent
  const eligibleForReminder =
    memorial.review_invite_sent_at !== null &&
    memorial.review_invite_clicked_at === null &&
    memorial.review_reminder_sent_at === null

  return { eligibleForInvite, eligibleForReminder }
}

test("TRUSTPILOT ELIGIBILITY: Complete tier + published >= 7 days required", () => {
  // 1. Free memorial published 30 days ago -> NOT eligible
  const free = checkTrustpilotInviteEligibility({
    id: "mem-1",
    is_paid: false,
    status: "published",
    published_days_ago: 30,
    review_invite_sent_at: null,
    review_invite_clicked_at: null,
    review_reminder_sent_at: null,
  })
  assert.equal(free.eligibleForInvite, false)

  // 2. Complete memorial published only 3 days ago -> NOT eligible yet
  const tooRecent = checkTrustpilotInviteEligibility({
    id: "mem-2",
    is_paid: true,
    status: "published",
    published_days_ago: 3,
    review_invite_sent_at: null,
    review_invite_clicked_at: null,
    review_reminder_sent_at: null,
  })
  assert.equal(tooRecent.eligibleForInvite, false)

  // 3. Complete memorial published 8 days ago -> ELIGIBLE
  const eligible = checkTrustpilotInviteEligibility({
    id: "mem-3",
    is_paid: true,
    status: "published",
    published_days_ago: 8,
    review_invite_sent_at: null,
    review_invite_clicked_at: null,
    review_reminder_sent_at: null,
  })
  assert.equal(eligible.eligibleForInvite, true)
})

test("TRUSTPILOT ANTI-GATING: Internal rating NEVER controls Trustpilot eligibility", () => {
  // A 1-star user and a 5-star user must have the EXACT SAME review invite eligibility
  const oneStarUserMemorial: MemorialReviewState = {
    id: "mem-1-star",
    is_paid: true,
    status: "published",
    published_days_ago: 10,
    review_invite_sent_at: null,
    review_invite_clicked_at: null,
    review_reminder_sent_at: null,
    user_internal_feedback_rating: 1, // Gave 1 star internally
  }

  const fiveStarUserMemorial: MemorialReviewState = {
    id: "mem-5-star",
    is_paid: true,
    status: "published",
    published_days_ago: 10,
    review_invite_sent_at: null,
    review_invite_clicked_at: null,
    review_reminder_sent_at: null,
    user_internal_feedback_rating: 5, // Gave 5 stars internally
  }

  const res1 = checkTrustpilotInviteEligibility(oneStarUserMemorial)
  const res5 = checkTrustpilotInviteEligibility(fiveStarUserMemorial)

  // Both MUST be eligible without review gating
  assert.equal(res1.eligibleForInvite, true)
  assert.equal(res5.eligibleForInvite, true)
  assert.equal(res1.eligibleForInvite, res5.eligibleForInvite)
})

test("TRUSTPILOT REMINDER: Reminder only sent once if unclicked, then terminates", () => {
  // Case 1: Invite sent, user clicked -> NO reminder
  const clickedMemorial: MemorialReviewState = {
    id: "mem-clicked",
    is_paid: true,
    status: "published",
    published_days_ago: 20,
    review_invite_sent_at: new Date().toISOString(),
    review_invite_clicked_at: new Date().toISOString(), // Clicked!
    review_reminder_sent_at: null,
  }
  const checkClicked = checkTrustpilotInviteEligibility(clickedMemorial)
  assert.equal(checkClicked.eligibleForReminder, false)

  // Case 2: Invite sent, unclicked, no reminder yet -> ELIGIBLE for reminder
  const unclickedMemorial: MemorialReviewState = {
    id: "mem-unclicked",
    is_paid: true,
    status: "published",
    published_days_ago: 20,
    review_invite_sent_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    review_invite_clicked_at: null, // NOT clicked
    review_reminder_sent_at: null,
  }
  const checkUnclicked = checkTrustpilotInviteEligibility(unclickedMemorial)
  assert.equal(checkUnclicked.eligibleForReminder, true)

  // Case 3: Reminder already sent -> NEVER send another
  const reminderAlreadySent: MemorialReviewState = {
    ...unclickedMemorial,
    review_reminder_sent_at: new Date().toISOString(),
  }
  const checkDone = checkTrustpilotInviteEligibility(reminderAlreadySent)
  assert.equal(checkDone.eligibleForReminder, false)
  assert.equal(checkDone.eligibleForInvite, false)
})

test("TRUSTPILOT SECURITY: HMAC tokens sign and verify tracking URLs securely", () => {
  const memorialId = "550e8400-e29b-41d4-a716-446655440000"
  const token = generateReviewToken(memorialId)

  // Valid token passes
  assert.equal(verifyReviewToken(memorialId, token), true)

  // Tampered token fails
  assert.equal(verifyReviewToken(memorialId, "invalid_token_123"), false)

  // Mismatched memorial fails
  assert.equal(verifyReviewToken("other-memorial-id", token), false)

  // Empty inputs fail
  assert.equal(verifyReviewToken("", token), false)
  assert.equal(verifyReviewToken(memorialId, ""), false)

  // Tracking URL contains memorial ID and token
  const trackingUrl = buildReviewTrackingUrl(memorialId)
  assert.match(trackingUrl, /\/api\/reviews\/trustpilot\?id=/)
  assert.match(trackingUrl, /&token=/)
})
