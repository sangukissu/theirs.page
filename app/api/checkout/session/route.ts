import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { assertMemorialOwner } from "@/lib/memorial-auth"
import {
  getDodoBaseURL,
  getDodoCompleteProductId,
  resolveAllowedPaymentMethods,
  THEIRS_COMPLETE_PRICE_CENTS,
} from "@/lib/payments"

// Basic country detection from edge providers (Vercel/CF)
function getCountryFromHeaders(req: NextRequest) {
  return (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    "US"
  ).toUpperCase()
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

    const appURL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
    if (!appURL) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL is not configured" },
        { status: 500 }
      )
    }

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
    const planId = typeof body?.planId === "string" ? body.planId.trim() : ""

    const country = getCountryFromHeaders(request)
    const baseURL = getDodoBaseURL()

    // 1. PRIMARY PATH: Theirs Complete ($179 One-Time Per-Memorial)
    if (memorialId) {
      const authCheck = await assertMemorialOwner(memorialId, user.id)
      if (!authCheck.authorized || !authCheck.memorial) {
        return NextResponse.json(
          { error: authCheck.error || "Only the primary memorial steward (creator/owner) can upgrade this memorial" },
          { status: 403 }
        )
      }

      if (authCheck.memorial.is_paid) {
        return NextResponse.json(
          { error: "This memorial is already upgraded to Theirs Complete" },
          { status: 400 }
        )
      }

      const productId = getDodoCompleteProductId()
      if (!productId) {
        return NextResponse.json(
          { error: "Dodo Payments product configuration missing for Theirs Complete" },
          { status: 500 }
        )
      }

      const payload: Record<string, any> = {
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
        return_url: `${appURL}/dashboard/memorials/${memorialId}/editor?payment=success`,
        metadata: {
          type: "theirs_complete",
          memorial_id: memorialId,
          user_id: user.id,
          amount_cents: String(THEIRS_COMPLETE_PRICE_CENTS),
          region_country: country,
        },
      }

      const resp = await fetch(`${baseURL}/checkouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        const errorText = await resp.text().catch(() => "")
        console.error("Dodo checkout session create failed", resp.status, errorText)
        return NextResponse.json(
          { error: "Failed to create checkout session" },
          { status: 500 }
        )
      }

      const session = await resp.json().catch(() => ({}))
      const id = session.id || session.session_id || session.sessionId
      const url = session.url || session.checkout_url || session.payment_link

      if (!id || !url) {
        return NextResponse.json(
          { error: "Malformed response from payment provider" },
          { status: 500 }
        )
      }

      return NextResponse.json({ id, url })
    }

    // 2. LEGACY FALLBACK: Photo restoration credit plan
    if (planId) {
      const { data: plan, error: planError } = await supabase
        .from("payment_plans")
        .select("*")
        .eq("id", planId)
        .single()

      if (planError || !plan) {
        return NextResponse.json({ error: "Selected plan not found" }, { status: 404 })
      }

      if (!plan.dodo_product_id) {
        return NextResponse.json(
          { error: "Invalid product configuration for selected plan" },
          { status: 400 }
        )
      }

      const payload: Record<string, any> = {
        product_cart: [
          {
            product_id: plan.dodo_product_id,
            quantity: 1,
          },
        ],
        return_url: `${appURL}/dashboard?payment=success`,
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
          credits: String(plan.credits),
          amount_cents: String(plan.price_cents),
          region_country: country,
        },
      }

      const resp = await fetch(`${baseURL}/checkouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        const errorText = await resp.text().catch(() => "")
        console.error("Dodo checkout session create failed", resp.status, errorText)
        return NextResponse.json(
          { error: "Failed to create checkout session" },
          { status: 500 }
        )
      }

      const session = await resp.json().catch(() => ({}))
      const id = session.id || session.session_id || session.sessionId
      const url = session.url || session.checkout_url || session.payment_link

      if (!id || !url) {
        return NextResponse.json(
          { error: "Malformed response from payment provider" },
          { status: 500 }
        )
      }

      return NextResponse.json({ id, url })
    }

    return NextResponse.json({ error: "memorialId is required" }, { status: 400 })
  } catch (err: any) {
    console.error("Checkout session route error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
