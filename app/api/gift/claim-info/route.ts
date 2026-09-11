import { NextResponse, type NextRequest } from "next/server"
import crypto from "crypto"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")?.trim()

    if (!token || token.length < 32 || token.length > 128) {
      return NextResponse.json({ error: "Invalid or missing gift token" }, { status: 400 })
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    const db = getSupabaseAdminSafe() || (await createClient())

    const { data: gift, error } = await db
      .from("memorial_gifts")
      .select("id, buyer_name, recipient_name, gift_message, status, created_at, amount, currency")
      .eq("claim_token_hash", tokenHash)
      .maybeSingle()

    if (error || !gift) {
      return NextResponse.json({ error: "Gift not found or token has expired" }, { status: 404 })
    }

    return NextResponse.json({
      id: gift.id,
      buyerName: gift.buyer_name,
      recipientName: gift.recipient_name,
      giftMessage: gift.gift_message,
      status: gift.status,
      createdAt: gift.created_at,
      amount: gift.amount,
      currency: gift.currency,
    })
  } catch (err: any) {
    console.error("[gift claim-info error]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
