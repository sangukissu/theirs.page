import { NextResponse, type NextRequest } from "next/server"
import crypto from "crypto"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import {
  getDodoBaseURL,
  getDodoCompleteProductId,
  THEIRS_COMPLETE_PRICE_CENTS,
} from "@/lib/payments"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Payment gateway is not configured on the server" },
        { status: 500 }
      )
    }

    const appURL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://theirs.page"
    const productId = getDodoCompleteProductId()
    if (!productId) {
      return NextResponse.json(
        { error: "Dodo Payments product configuration missing for Complete plan" },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => ({} as any))
    const buyerName = typeof body?.buyerName === "string" ? body.buyerName.trim() : ""
    const buyerEmail = typeof body?.buyerEmail === "string" ? body.buyerEmail.trim().toLowerCase() : ""
    const recipientName = typeof body?.recipientName === "string" ? body.recipientName.trim() : ""
    const recipientEmail = typeof body?.recipientEmail === "string" ? body.recipientEmail.trim().toLowerCase() : ""
    const giftMessage = typeof body?.giftMessage === "string" ? body.giftMessage.trim().slice(0, 1000) : null

    if (!buyerName || buyerName.length < 1 || buyerName.length > 100) {
      return NextResponse.json({ error: "Please provide your name (1-100 characters)." }, { status: 400 })
    }
    if (!buyerEmail || !isValidEmail(buyerEmail)) {
      return NextResponse.json({ error: "Please provide a valid email address for your receipt." }, { status: 400 })
    }
    if (!recipientName || recipientName.length < 1 || recipientName.length > 100) {
      return NextResponse.json({ error: "Please provide the recipient's name (1-100 characters)." }, { status: 400 })
    }
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      return NextResponse.json({ error: "Please provide a valid email address for the recipient." }, { status: 400 })
    }

    // Optional: detect if buyer is currently logged in
    let buyerUserId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        buyerUserId = user.id
      }
    } catch {
      // Guest buyer is 100% valid
    }

    // Generate high-entropy 256-bit token & SHA-256 hash
    const claimToken = crypto.randomBytes(32).toString("hex")
    const claimTokenHash = crypto.createHash("sha256").update(claimToken).digest("hex")

    const db = getSupabaseAdminSafe() || (await createClient())
    const { data: giftRecord, error: insertError } = await db
      .from("memorial_gifts")
      .insert({
        claim_token_hash: claimTokenHash,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_user_id: buyerUserId,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        gift_message: giftMessage,
        amount: 179.0,
        currency: "USD",
        status: "pending_payment",
      })
      .select("id")
      .single()

    if (insertError || !giftRecord) {
      console.error("[gift checkout insert error]:", insertError)
      return NextResponse.json(
        { error: "Could not create gift record. Please try again." },
        { status: 500 }
      )
    }

    const baseURL = getDodoBaseURL()
    const cleanAppUrl = appURL.replace(/\/$/, "")
    const returnUrl = `${cleanAppUrl}/gift/confirmation?gift_id=${giftRecord.id}&token=${claimToken}`

    const dodoPayload = {
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        name: buyerName,
        email: buyerEmail,
      },
      return_url: returnUrl,
      metadata: {
        type: "theirs_gift",
        gift_id: giftRecord.id,
        claim_token: claimToken,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        amount_cents: String(THEIRS_COMPLETE_PRICE_CENTS),
      },
    }

    const dodoRes = await fetch(`${baseURL}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dodoPayload),
    })

    const dodoData = await dodoRes.json().catch(() => ({} as any))

    if (!dodoRes.ok || !dodoData.checkout_url) {
      console.error("[dodo gift checkout error]:", dodoData)
      return NextResponse.json(
        { error: dodoData.message || "Failed to initialize secure checkout" },
        { status: dodoRes.status || 500 }
      )
    }

    return NextResponse.json({
      checkoutUrl: dodoData.checkout_url,
      giftId: giftRecord.id,
    })
  } catch (err: any) {
    console.error("[gift checkout fatal]:", err)
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
