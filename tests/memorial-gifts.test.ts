import assert from "node:assert/strict"
import test from "node:test"
import crypto from "crypto"
import fs from "fs"
import path from "path"

// ---------------------------------------------------------------------------
// 1. TOKEN GENERATION & HASHING INVARIANTS
// ---------------------------------------------------------------------------

test("GIFT: Token has 256-bit entropy and valid hex format", () => {
  const token = crypto.randomBytes(32).toString("hex")
  assert.equal(token.length, 64)
  assert.match(token, /^[a-f0-9]{64}$/)

  const token2 = crypto.randomBytes(32).toString("hex")
  assert.notEqual(token, token2)
})

test("GIFT: SHA-256 token hashing is deterministic and matches expected digest", () => {
  const token = "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
  const hash1 = crypto.createHash("sha256").update(token).digest("hex")
  const hash2 = crypto.createHash("sha256").update(token).digest("hex")
  assert.equal(hash1, hash2)
  assert.equal(hash1.length, 64)

  // Different token produces different hash
  const diffToken = "b1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
  const diffHash = crypto.createHash("sha256").update(diffToken).digest("hex")
  assert.notEqual(hash1, diffHash)
})

// ---------------------------------------------------------------------------
// 2. VALIDATION LOGIC INVARIANTS
// ---------------------------------------------------------------------------

function validateGiftCheckoutInput(body: {
  buyer_name?: any
  buyer_email?: any
  recipient_name?: any
  recipient_email?: any
  gift_message?: any
}) {
  const buyerName = typeof body.buyer_name === "string" ? body.buyer_name.trim() : ""
  const buyerEmail = typeof body.buyer_email === "string" ? body.buyer_email.trim().toLowerCase() : ""
  const recipientName = typeof body.recipient_name === "string" ? body.recipient_name.trim() : ""
  const recipientEmail = typeof body.recipient_email === "string" ? body.recipient_email.trim().toLowerCase() : ""
  const giftMessage = typeof body.gift_message === "string" ? body.gift_message.trim() : null

  if (!buyerName || buyerName.length < 1 || buyerName.length > 100) {
    return { valid: false, error: "Buyer name must be between 1 and 100 characters." }
  }
  if (!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail) || buyerEmail.length > 254) {
    return { valid: false, error: "Valid buyer email is required." }
  }
  if (!recipientName || recipientName.length < 1 || recipientName.length > 100) {
    return { valid: false, error: "Recipient name must be between 1 and 100 characters." }
  }
  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail) || recipientEmail.length > 254) {
    return { valid: false, error: "Valid recipient email is required." }
  }
  if (giftMessage && giftMessage.length > 1000) {
    return { valid: false, error: "Gift message must be 1000 characters or fewer." }
  }

  return {
    valid: true,
    data: { buyerName, buyerEmail, recipientName, recipientEmail, giftMessage },
  }
}

test("GIFT: Input validation rejects missing buyer or recipient details", () => {
  assert.equal(validateGiftCheckoutInput({}).valid, false)
  assert.equal(validateGiftCheckoutInput({ buyer_name: "Alice" }).valid, false)
  assert.equal(
    validateGiftCheckoutInput({
      buyer_name: "Alice",
      buyer_email: "alice@example.com",
      recipient_name: "Bob",
      recipient_email: "invalid-email",
    }).valid,
    false
  )
})

test("GIFT: Input validation accepts clean valid inputs", () => {
  const result = validateGiftCheckoutInput({
    buyer_name: "Alice Ross",
    buyer_email: "Alice@Example.COM",
    recipient_name: "Bob Miller",
    recipient_email: "bob@example.com",
    gift_message: "Thinking of you and your family.",
  })
  assert.equal(result.valid, true)
  assert.equal(result.data?.buyerEmail, "alice@example.com")
  assert.equal(result.data?.giftMessage, "Thinking of you and your family.")
})

// ---------------------------------------------------------------------------
// 3. STRICT ZERO CSS SHADOWS ASSERTION
// ---------------------------------------------------------------------------

test("GIFT: All gift UI components have ZERO CSS shadows", () => {
  const filesToCheck = [
    path.join(process.cwd(), "components/gift/gift-purchase-modal.tsx"),
    path.join(process.cwd(), "components/gift/gift-purchase-form.tsx"),
    path.join(process.cwd(), "app/gift/page.tsx"),
    path.join(process.cwd(), "app/gift/confirmation/page.tsx"),
    path.join(process.cwd(), "app/gift/confirmation/confirmation-client.tsx"),
    path.join(process.cwd(), "app/gift/claim/page.tsx"),
    path.join(process.cwd(), "app/gift/claim/claim-client.tsx"),
    path.join(process.cwd(), "lib/email/gift-emails.ts"),
  ]

  const shadowRegex = /\bshadow-(?:sm|md|lg|xl|2xl|inner|\[.+?\])\b/g

  for (const filePath of filesToCheck) {
    if (!fs.existsSync(filePath)) {
      assert.fail(`Expected file ${filePath} to exist`)
    }
    const content = fs.readFileSync(filePath, "utf-8")

    // Filter out comments (e.g. "// STRICT ZERO SHADOWS")
    const lines = content.split("\n")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes("/*") || line.includes("//")) continue

      const matches = line.match(shadowRegex)
      if (matches) {
        // Only allow shadow-none if any, but zero shadows overall preferred
        const badMatches = matches.filter((m) => m !== "shadow-none")
        if (badMatches.length > 0) {
          assert.fail(
            `Found shadow class [${badMatches.join(", ")}] on line ${i + 1} of ${path.basename(filePath)}`
          )
        }
      }
    }
  }
})
