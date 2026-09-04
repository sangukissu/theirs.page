import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, personName } = await req.json()

    if (!text || typeof text !== "string" || text.trim().length < 15) {
      return NextResponse.json(
        { error: "Please write at least a sentence or two of rough notes to polish." },
        { status: 400 }
      )
    }

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      // Fallback: gentle formatting without AI
      return NextResponse.json({
        polishedText: text.trim(),
      })
    }

    const genAI = new GoogleGenAI({ apiKey: geminiKey })
    const prompt = `You are an empathetic, discreet editor for a family memorial on Theirs (theirs.page).
A grieving family member has written rough notes or a story about ${personName || "their loved one"}:

"""
${text}
"""

Rules:
1. Preserve their authentic voice, genuine anecdotes, names, and memories.
2. NEVER invent facts, dates, awards, or fake relationships.
3. Clean up grammar, fix typos, and structure into warm, flowing editorial paragraphs.
4. You may use <h2> for chapter headings if there are distinct life phases (e.g. Early Life, Career, Later Years).
5. You may use <blockquote> for direct memorable sayings or quotes.
6. Return clean semantic HTML (using <p>, <h2>, <h3>, <strong>, <em>, <blockquote>).
7. Do not wrap in markdown code blocks (\`\`\`html). Output only the HTML content.`

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
    })

    const responseText =
      (response as { text?: string }).text ||
      response.candidates?.[0]?.content?.parts?.find((part) => "text" in part)?.text

    if (!responseText) {
      return NextResponse.json({ polishedText: text })
    }

    const cleanedHtml = responseText
      .replace(/```html/gi, "")
      .replace(/```/g, "")
      .trim()

    return NextResponse.json({
      polishedText: cleanedHtml,
    })
  } catch (err: any) {
    console.error("Story polish error:", err)
    return NextResponse.json(
      { error: "Unable to polish story right now. Please try again." },
      { status: 500 }
    )
  }
}
