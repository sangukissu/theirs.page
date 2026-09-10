import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))

    // Optional 1-5 rating
    let rating: number | null = null
    if (body.rating !== undefined && body.rating !== null && body.rating !== "") {
      const parsedRating = Number(body.rating)
      if (Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        rating = parsedRating
      } else {
        return NextResponse.json(
          { error: "Experience rating must be a whole number between 1 and 5." },
          { status: 400 }
        )
      }
    }

    const workingWell = typeof body.working_well === "string" ? body.working_well.trim().slice(0, 3000) : null
    const couldBeBetter = typeof body.could_be_better === "string" ? body.could_be_better.trim().slice(0, 3000) : null
    const rawFeedback = typeof body.feedback_text === "string" ? body.feedback_text.trim().slice(0, 3000) : null

    const combinedFeedback = [
      workingWell ? `Working well: ${workingWell}` : null,
      couldBeBetter ? `Could be better: ${couldBeBetter}` : null,
      rawFeedback && rawFeedback !== workingWell && rawFeedback !== couldBeBetter ? rawFeedback : null,
    ].filter(Boolean).join("\n\n") || null

    if (!workingWell && !couldBeBetter && !rawFeedback && rating === null) {
      return NextResponse.json(
        { error: "Please provide either feedback notes or an experience rating." },
        { status: 400 }
      )
    }

    // Optional memorial context
    const rawMemorialId = typeof body.memorial_id === "string" ? body.memorial_id.trim() : null
    const memorialId = rawMemorialId && UUID_REGEX.test(rawMemorialId) ? rawMemorialId : null

    // Page path
    const pagePath = typeof body.page_path === "string" ? body.page_path.trim().slice(0, 500) : null

    const db = getSupabaseAdminSafe() || supabase
    const { error: insertError } = await db.from("user_feedback").insert({
      user_id: user.id,
      memorial_id: memorialId,
      rating,
      working_well: workingWell,
      could_be_better: couldBeBetter,
      feedback_text: combinedFeedback,
      page_path: pagePath,
    })

    if (insertError) {
      console.error("[feedback POST error]", insertError)
      return NextResponse.json({ error: "Failed to save feedback." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[feedback POST fatal]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  // Graceful no-op endpoint for any legacy components checking feedback status
  return NextResponse.json({ shouldShow: false, tracking: null })
}