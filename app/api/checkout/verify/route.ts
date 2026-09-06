import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { assertMemorialOwner } from "@/lib/memorial-auth"
import { getDodoBaseURL } from "@/lib/payments"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({} as any))
    const memorialId = typeof body?.memorialId === "string" ? body.memorialId.trim() : ""
    const paymentId = typeof body?.paymentId === "string" ? body.paymentId.trim() : ""

    if (!memorialId) {
      return NextResponse.json({ error: "memorialId is required" }, { status: 400 })
    }

    // Assert memorial ownership
    const authCheck = await assertMemorialOwner(memorialId, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return NextResponse.json(
        { error: authCheck.error || "Forbidden" },
        { status: 403 }
      )
    }

    // 1. If already marked paid in the database, return immediately
    if (authCheck.memorial.is_paid) {
      return NextResponse.json({ success: true, is_paid: true, alreadyPaid: true })
    }

    // 2. If paymentId is present, verify directly with Dodo Payments API
    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    if (paymentId && apiKey) {
      const baseURL = getDodoBaseURL()
      const dodoResp = await fetch(`${baseURL}/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (dodoResp.ok) {
        const paymentData = await dodoResp.json()
        const status = (paymentData.status || "").toLowerCase()

        if (status === "succeeded" || status === "success") {
          const rawAmount = paymentData.total_amount ?? paymentData.amount
          const amount = rawAmount ? Number(rawAmount) / 100 : 179.0
          const currency = (paymentData.currency || "USD").toUpperCase()
          const customerEmail =
            paymentData.customer?.email ||
            paymentData.customer_email ||
            user.email ||
            null
          const paymentMethod =
            paymentData.payment_method_type ||
            paymentData.payment_method ||
            null

          // Run complete_memorial_purchase atomic RPC
          const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
            "complete_memorial_purchase",
            {
              p_event_id: `verify_${paymentId}`,
              p_payment_id: paymentId,
              p_memorial_id: memorialId,
              p_user_id: user.id,
              p_amount: amount,
              p_currency: currency,
              p_customer_email: customerEmail,
              p_payment_method: paymentMethod,
              p_metadata: paymentData.metadata || {},
            }
          )

          if (rpcError) {
            console.error("Payment verify RPC error:", rpcError)
          } else {
            console.log("Memorial verified and upgraded successfully:", rpcResult)
            return NextResponse.json({ success: true, is_paid: true, verified: true })
          }
        }
      } else {
        console.warn("Dodo payment verify lookup failed:", dodoResp.status)
      }
    }

    // Fallback query to re-check if webhook just completed
    const { data: refreshed } = await supabaseAdmin
      .from("memorials")
      .select("is_paid")
      .eq("id", memorialId)
      .maybeSingle()

    const isPaid = Boolean(refreshed?.is_paid)
    return NextResponse.json({ success: isPaid, is_paid: isPaid })
  } catch (error: any) {
    console.error("Checkout verify error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
