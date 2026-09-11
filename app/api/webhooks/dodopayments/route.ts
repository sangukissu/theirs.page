import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/utils/supabase/admin"
import { headers } from "next/headers"
import crypto from "crypto"
import { getDodoCompleteProductId } from "@/lib/payments"
import {
  sendGiftRecipientEmail,
  sendGiftBuyerReceiptEmail,
} from "@/lib/email/gift-emails"

function getWebhookSecret(): string {
  return (
    process.env.DODO_WEBHOOK_SECRET ||
    process.env.DODO_PAYMENTS_WEBHOOK_KEY ||
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET ||
    ""
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()

    // 1. Extract webhook headers as per Standard Webhooks specification
    const webhookId = headersList.get("webhook-id")
    const webhookSignature = headersList.get("webhook-signature")
    const webhookTimestamp = headersList.get("webhook-timestamp")

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      console.warn("Dodo webhook received with missing headers:", {
        webhookId,
        hasSignature: Boolean(webhookSignature),
        webhookTimestamp,
      })
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 })
    }

    // 2. Validate webhook signature
    const secret = getWebhookSecret()
    if (!secret) {
      console.error(
        "Dodo webhook secret is not configured (checked DODO_WEBHOOK_SECRET, DODO_PAYMENTS_WEBHOOK_KEY, DODO_PAYMENTS_WEBHOOK_SECRET)"
      )
      return NextResponse.json({ error: "Webhook secret not configured on server" }, { status: 500 })
    }

    const isValid = verifyWebhookSignature(webhookId, webhookTimestamp, body, webhookSignature, secret)
    if (!isValid) {
      console.warn("Dodo webhook signature verification failed for webhookId:", webhookId)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // 3. Idempotency: skip if this webhook-id was already processed
    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("event_id", webhookId)
      .maybeSingle()

    if (existingEvent) {
      console.log("Dodo webhook already processed (idempotent skip):", webhookId)
      return NextResponse.json({ received: true, duplicate: true })
    }

    // 4. Parse the webhook payload
    const webhookData = JSON.parse(body)

    // Normalize event type (support both dot and underscore styles: payment.succeeded -> payment_succeeded)
    const rawType = webhookData?.type || webhookData?.event || webhookData?.event_type
    const eventType = typeof rawType === "string" ? rawType.replace(/\./g, "_") : ""

    console.log(`Dodo webhook received: type=${rawType} (normalized=${eventType}), id=${webhookId}`)

    // 5. Route by normalized event type
    if (eventType === "payment_succeeded") {
      await handlePaymentSucceeded(webhookData, webhookId)
    } else if (eventType === "payment_failed") {
      await handlePaymentFailed(webhookData, webhookId)
    } else if (eventType === "payment_cancelled") {
      await handlePaymentCancelled(webhookData, webhookId)
    } else {
      console.log("Unhandled Dodo webhook type:", rawType)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Dodo webhook processing error:", error)
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(
  webhookId: string,
  webhookTimestamp: string,
  payload: string,
  webhookSignature: string,
  secret: string
): boolean {
  try {
    // Remove whsec_ prefix if present
    const cleanSecret = secret.startsWith("whsec_") ? secret.substring(6) : secret

    // Decode the base64 secret
    const key = Buffer.from(cleanSecret, "base64")

    // Create the signed payload: msgId.timestamp.payload
    const signedPayload = `${webhookId}.${webhookTimestamp}.${payload}`

    // Create HMAC SHA256 signature and encode as base64
    const expectedSignature = crypto.createHmac("sha256", key).update(signedPayload, "utf8").digest("base64")

    // Parse received signatures (can be multiple: "v1,sig1 v1,sig2")
    const receivedSignatures = webhookSignature.split(" ")

    for (const versionedSignature of receivedSignatures) {
      const [version, signature] = versionedSignature.split(",")
      if (version !== "v1") continue

      if (signature && timingSafeEqual(signature, expectedSignature)) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Webhook signature calculation error:", error)
    return false
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const bufferA = Buffer.from(a, "utf8")
  const bufferB = Buffer.from(b, "utf8")
  return crypto.timingSafeEqual(bufferA, bufferB)
}

async function handlePaymentSucceeded(webhookData: any, webhookId: string) {
  const paymentData = webhookData.data || {}
  const paymentId = paymentData.payment_id || paymentData.id || webhookData.payment_id || webhookId

  const metadata = paymentData.metadata || webhookData.metadata || {}
  const memorialId = metadata.memorial_id || metadata.memorialId
  const userId = metadata.user_id || metadata.userId || null
  const customerEmail =
    paymentData.customer?.email ||
    paymentData.customer_email ||
    metadata.customer_email ||
    null
  const paymentMethod =
    paymentData.payment_method_type ||
    paymentData.payment_method ||
    null

  // Calculate amount and normalize currency (supports USD, INR, EUR, GBP, CAD, etc.)
  const rawAmount = paymentData.total_amount ?? paymentData.amount
  const amount = rawAmount ? Number(rawAmount) / 100 : 179.0
  const currency = (paymentData.currency || "USD").toUpperCase()

  console.log("Processing payment.succeeded:", {
    paymentId,
    memorialId,
    userId,
    amount,
    currency,
    customerEmail,
  })

  // Validate configured product ID if present for logging/monitoring
  const configuredProductId = getDodoCompleteProductId()
  if (configuredProductId) {
    const receivedProductId = paymentData.product_id || paymentData.product_cart?.[0]?.product_id
    if (receivedProductId && receivedProductId !== configuredProductId) {
      console.warn(`Product ID mismatch: configured=${configuredProductId}, received=${receivedProductId}`)
    }
  }

  // 1. Gift path: Theirs Complete memorial gift purchase
  const giftId = metadata.gift_id || metadata.giftId
  const isGift = metadata.type === "theirs_gift" || Boolean(giftId)

  if (isGift && giftId) {
    const { data: gift, error: giftError } = await supabase
      .from("memorial_gifts")
      .select("*")
      .eq("id", giftId)
      .maybeSingle()

    if (giftError || !gift) {
      console.warn(`Gift ${giftId} not found for payment ${paymentId}`)
      await supabase.from("webhook_events").insert({
        event_id: webhookId,
        event_type: "gift_payment_orphaned",
        payment_id: paymentId,
        processed: true,
        payload: { error: "Gift not found", metadata, paymentData },
      })
      return
    }

    // Upsert payment record
    await supabase.from("payments").upsert({
      payment_id: paymentId,
      user_id: gift.buyer_user_id || userId || null,
      memorial_id: null,
      amount,
      currency,
      status: "completed",
      customer_email: customerEmail || gift.buyer_email,
      payment_method: paymentMethod,
      metadata: { ...metadata, type: "theirs_gift", gift_id: giftId },
    }, { onConflict: "payment_id" })

    // Mark gift as available
    await supabase
      .from("memorial_gifts")
      .update({
        status: "available",
        payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", giftId)

    // Log webhook event
    await supabase.from("webhook_events").insert({
      event_id: webhookId,
      event_type: "payment_succeeded_gift",
      payment_id: paymentId,
      processed: true,
      payload: { gift_id: giftId, paymentData },
    })

    // Send emails to recipient and buyer
    const claimToken = metadata.claim_token
    if (claimToken) {
      try {
        await Promise.allSettled([
          sendGiftRecipientEmail({
            giftId: gift.id,
            buyerName: gift.buyer_name,
            recipientName: gift.recipient_name,
            recipientEmail: gift.recipient_email,
            giftMessage: gift.gift_message,
            claimToken,
          }),
          sendGiftBuyerReceiptEmail({
            giftId: gift.id,
            buyerName: gift.buyer_name,
            buyerEmail: gift.buyer_email,
            recipientName: gift.recipient_name,
            recipientEmail: gift.recipient_email,
            giftMessage: gift.gift_message,
            claimToken,
            amount,
            currency,
          }),
        ])
      } catch (emailErr) {
        console.error("Failed to send gift notification emails:", emailErr)
      }
    }

    console.log("Gift successfully activated and notification emails dispatched:", giftId)
    return
  }

  // 2. Primary path: Theirs Complete memorial activation
  if (memorialId) {
    // Check if memorial exists
    const { data: memorial, error: memorialError } = await supabase
      .from("memorials")
      .select("id, is_paid")
      .eq("id", memorialId)
      .maybeSingle()

    if (memorialError || !memorial) {
      console.warn(`Memorial ${memorialId} not found for payment ${paymentId}`)
      await supabase.from("webhook_events").insert({
        event_id: webhookId,
        event_type: "payment_succeeded_orphaned",
        payment_id: paymentId,
        processed: true,
        payload: { error: "Memorial not found", metadata, paymentData },
      })
      return
    }

    // Atomic Postgres transaction: idempotency check -> payment record -> memorial activation -> webhook logging
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "complete_memorial_purchase",
      {
        p_event_id: webhookId,
        p_payment_id: paymentId,
        p_memorial_id: memorialId,
        p_user_id: userId,
        p_amount: amount,
        p_currency: currency,
        p_customer_email: customerEmail,
        p_payment_method: paymentMethod,
        p_metadata: metadata,
      }
    )

    if (rpcError) {
      console.error("complete_memorial_purchase RPC error:", rpcError)
      throw new Error(`Failed to activate memorial: ${rpcError.message}`)
    }

    console.log("Memorial successfully activated via complete_memorial_purchase:", rpcResult)
    return
  }

  // 2. Secondary path: Sample/Test event from Dodo Dashboard (or generic payment without memorial_id)
  console.log("payment.succeeded received without memorial_id (likely Dodo dashboard test event):", paymentId)
  await supabase.from("webhook_events").insert({
    event_id: webhookId,
    event_type: "payment_succeeded_sample",
    payment_id: paymentId,
    processed: true,
    payload: { note: "Received without memorial_id", data: paymentData },
  })
}

async function handlePaymentFailed(webhookData: any, webhookId: string) {
  try {
    const paymentData = webhookData.data || {}
    const paymentId = paymentData.payment_id || paymentData.id

    if (!paymentId) return

    // Update payment status to failed if record exists
    await supabase
      .from("payments")
      .update({ status: "failed" })
      .eq("payment_id", paymentId)

    await supabase.from("webhook_events").insert({
      event_id: webhookId,
      event_type: "payment_failed",
      payment_id: paymentId,
      processed: true,
      payload: paymentData,
    })
  } catch (err) {
    console.error("handlePaymentFailed error:", err)
  }
}

async function handlePaymentCancelled(webhookData: any, webhookId: string) {
  try {
    const paymentData = webhookData.data || {}
    const paymentId = paymentData.payment_id || paymentData.id

    if (!paymentId) return

    // Update payment status to cancelled if record exists
    await supabase
      .from("payments")
      .update({ status: "cancelled" })
      .eq("payment_id", paymentId)

    await supabase.from("webhook_events").insert({
      event_id: webhookId,
      event_type: "payment_cancelled",
      payment_id: paymentId,
      processed: true,
      payload: paymentData,
    })
  } catch (err) {
    console.error("handlePaymentCancelled error:", err)
  }
}
