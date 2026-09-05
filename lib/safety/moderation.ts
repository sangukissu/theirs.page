import { GoogleGenAI } from "@google/genai"

export interface SafetyScreeningResult {
  decision: "safe" | "review" | "blocked"
  sexual: boolean
  threat: boolean
  hate: boolean
  harassment: boolean
  spam: boolean
  scam: boolean
  personal_data: boolean
  garbage: boolean
  reason: string
  confidence?: number
}

const DEFAULT_SAFE_RESULT: SafetyScreeningResult = {
  decision: "safe",
  sexual: false,
  threat: false,
  hate: false,
  harassment: false,
  spam: false,
  scam: false,
  personal_data: false,
  garbage: false,
  reason: "No safety violations detected.",
}

// ------------------------------------------------------------------------------
// 1. Text Screening with Gemini Flash Lite
// ------------------------------------------------------------------------------

const TEXT_SAFETY_SYSTEM_PROMPT = `You are the automated safety screening engine for Theirs (theirs.page), a respectful digital memorial dedicated to human lives.
Your job is to analyze visitor-submitted tributes, memories, condolences, or stories about a deceased person.

Analyze the submission for platform safety risks:
1. "sexual": explicit pornography, erotic content, nudity, sexualized text.
2. "threat": threats of violence, encouragement of suicide/self-harm, terroristic threats.
3. "hate": slurs, hate speech, racist/homophobic/sectarian abuse, dehumanizing language.
4. "harassment": targeted bullying, hostile character attacks on the deceased or family, vindictive stalking.
5. "spam": commercial advertising, repeated robotic spam, unrelated promotional text.
6. "scam": phishing links, cryptocurrency schemes, financial fraud, impersonation scam.
7. "personal_data": doxxing (social security numbers, private phone numbers, home addresses, bank account numbers).
8. "garbage": repeated meaningless keysmashing, bot test strings, gibberish (e.g. "asdfasdfasdf").

DECISION RULES:
- Return "blocked" if: sexual, threat, hate, harassment, scam, or clear spam is TRUE.
- Return "review" if: the content is emotionally contentious, contains ambiguous family conflict, borderline language, strange links, or mentions a dispute that might require caretaker review.
- Return "safe" if: genuine condolences, heartfelt memories, nostalgic anecdotes, bittersweet stories, or respectful remembrance.
NOTE: Expressions of natural sadness, mild family quirks, or imperfect life recollections are SAFE, not harmful. Do not block someone merely for recalling a sad or human moment.

Return ONLY a JSON object with this exact structure:
{
  "decision": "safe" | "review" | "blocked",
  "sexual": boolean,
  "threat": boolean,
  "hate": boolean,
  "harassment": boolean,
  "spam": boolean,
  "scam": boolean,
  "personal_data": boolean,
  "garbage": boolean,
  "reason": "Brief 1-sentence explanation"
}`

export async function screenTextWithGemini(
  text: string,
  context?: { authorName?: string; memorialName?: string }
): Promise<SafetyScreeningResult> {
  const trimmed = (text || "").trim()
  if (!trimmed) {
    return DEFAULT_SAFE_RESULT
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === "AIzaSy_placeholder_for_build") {
    return fallbackRuleBasedTextScreen(trimmed)
  }

  try {
    const genAI = new GoogleGenAI({ apiKey })
    const userPrompt = `Context: Memorial for ${context?.memorialName || "a loved one"}${
      context?.authorName ? ` by contributor "${context.authorName}"` : ""
    }
Submission Text:
"""
${trimmed.slice(0, 4000)}
"""`

    // Attempt with gemini-2.5-flash-lite, fallback to gemini-2.5-flash
    const candidateModels = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-2.5-flash"]
    let rawText = ""

    for (const modelName of candidateModels) {
      try {
        const response = await genAI.models.generateContent({
          model: modelName,
          contents: [
            { text: TEXT_SAFETY_SYSTEM_PROMPT },
            { text: userPrompt },
          ],
        })

        const extracted =
          (response as { text?: string }).text ||
          response.candidates?.[0]?.content?.parts?.find((p) => "text" in p)?.text

        if (extracted) {
          rawText = extracted
          break
        }
      } catch (modelErr) {
        // try next model
        continue
      }
    }

    if (!rawText) {
      return fallbackRuleBasedTextScreen(trimmed)
    }

    const cleanedJson = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()

    const parsed = JSON.parse(cleanedJson) as SafetyScreeningResult
    return {
      decision: ["safe", "review", "blocked"].includes(parsed.decision)
        ? parsed.decision
        : "review",
      sexual: Boolean(parsed.sexual),
      threat: Boolean(parsed.threat),
      hate: Boolean(parsed.hate),
      harassment: Boolean(parsed.harassment),
      spam: Boolean(parsed.spam),
      scam: Boolean(parsed.scam),
      personal_data: Boolean(parsed.personal_data),
      garbage: Boolean(parsed.garbage),
      reason: parsed.reason || "Automated classification completed.",
    }
  } catch (err) {
    console.warn("Gemini safety screening error, falling back to heuristic checks:", err)
    return fallbackRuleBasedTextScreen(trimmed)
  }
}

function fallbackRuleBasedTextScreen(text: string): SafetyScreeningResult {
  const lower = text.toLowerCase()

  // High-confidence spam / scam URL indicators
  const hasSpamUrl =
    /https?:\/\/(?!theirs\.page\b)[^\s]+/i.test(text) ||
    /\b(t\.me|telegram\.me|wa\.me|whatsapp\.com|bit\.ly|tinyurl\.com|cutt\.ly)\b/i.test(lower) ||
    /\b(crypto|bitcoin|usdt|forex|casino|slot|poker|viagra|cialis|loan|escort|hookup)\b/i.test(lower)

  // Explicit harassment / threat patterns
  const hasThreat =
    /\b(kill yourself|die in a fire|burn in hell|shoot|murder|i will kill)\b/i.test(lower)

  // Keysmashing / garbage
  const isGarbage =
    /^[bcdfghjklmnpqrstvwxyz]{12,}$/i.test(text.replace(/\s/g, "")) ||
    /^(.)\1{10,}$/.test(text.trim())

  if (hasThreat) {
    return {
      decision: "blocked",
      sexual: false,
      threat: true,
      hate: false,
      harassment: true,
      spam: false,
      scam: false,
      personal_data: false,
      garbage: false,
      reason: "Content flagged for aggressive threat or harassment.",
    }
  }

  if (hasSpamUrl) {
    return {
      decision: "blocked",
      sexual: false,
      threat: false,
      hate: false,
      harassment: false,
      spam: true,
      scam: true,
      personal_data: false,
      garbage: false,
      reason: "Automated filter detected external promotional link or spam pattern.",
    }
  }

  if (isGarbage) {
    return {
      decision: "blocked",
      sexual: false,
      threat: false,
      hate: false,
      harassment: false,
      spam: false,
      scam: false,
      personal_data: false,
      garbage: true,
      reason: "Automated filter detected meaningless keysmashing or bot test text.",
    }
  }

  return DEFAULT_SAFE_RESULT
}

// ------------------------------------------------------------------------------
// 2. Magic Bytes & File Validation
// ------------------------------------------------------------------------------

export interface MediaValidationResult {
  valid: boolean
  detectedMime: string
  mediaType: "image" | "audio" | "video"
  error?: string
}

export function validateMagicBytes(
  buffer: Buffer,
  filename: string,
  claimedMime: string
): MediaValidationResult {
  if (!buffer || buffer.length < 12) {
    return {
      valid: false,
      detectedMime: "application/octet-stream",
      mediaType: "image",
      error: "Uploaded file is empty or corrupted.",
    }
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: "image/jpeg", mediaType: "image" }
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: "image/png", mediaType: "image" }
  }

  // 3. WebP: RIFF .... WEBP
  const isRiff = buffer.toString("ascii", 0, 4) === "RIFF"
  const isWebp = buffer.toString("ascii", 8, 12) === "WEBP"
  if (isRiff && isWebp) {
    return { valid: true, detectedMime: "image/webp", mediaType: "image" }
  }

  // 4. GIF: GIF87a or GIF89a
  const gifHeader = buffer.toString("ascii", 0, 6)
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
    return { valid: true, detectedMime: "image/gif", mediaType: "image" }
  }

  // 5. Audio: WAV (RIFF .... WAVE)
  const isWave = buffer.toString("ascii", 8, 12) === "WAVE"
  if (isRiff && isWave) {
    return { valid: true, detectedMime: "audio/wav", mediaType: "audio" }
  }

  // 6. Audio: MP3 (ID3 or frame sync FF FB / FF F3 / FF F2)
  const isId3 = buffer.toString("ascii", 0, 3) === "ID3"
  const isMp3Sync = buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0
  if (isId3 || isMp3Sync) {
    return { valid: true, detectedMime: "audio/mpeg", mediaType: "audio" }
  }

  // 7. Audio: OGG (OggS)
  if (buffer.toString("ascii", 0, 4) === "OggS") {
    return { valid: true, detectedMime: "audio/ogg", mediaType: "audio" }
  }

  // 8. MP4 / M4A / MOV (ISO Base Media file: ftyp box at offset 4)
  const ftypTag = buffer.toString("ascii", 4, 8)
  if (ftypTag === "ftyp") {
    const majorBrand = buffer.toString("ascii", 8, 12)
    if (majorBrand.startsWith("M4A") || majorBrand.startsWith("M4B")) {
      return { valid: true, detectedMime: "audio/m4a", mediaType: "audio" }
    }
    if (majorBrand.startsWith("qt  ")) {
      return { valid: true, detectedMime: "video/quicktime", mediaType: "video" }
    }
    return { valid: true, detectedMime: "video/mp4", mediaType: "video" }
  }

  // 9. WebM (EBML header: 1A 45 DF A3)
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    const headerStr = buffer.toString("ascii", 0, 64)
    if (headerStr.includes("webm")) {
      return { valid: true, detectedMime: "video/webm", mediaType: "video" }
    }
  }

  return {
    valid: false,
    detectedMime: "application/octet-stream",
    mediaType: "image",
    error: "File format is not supported or does not match valid image/audio headers.",
  }
}

// ------------------------------------------------------------------------------
// 3. Pure JavaScript EXIF & GPS Metadata Stripping
// ------------------------------------------------------------------------------

/**
 * Strips EXIF APP1 (GPS, camera serials, timestamps) and metadata chunks from images
 * in pure JavaScript without any native C/C++ dependencies (safe for Cloudflare/Vercel).
 */
export function stripExifAndGps(buffer: Buffer, mime: string): Buffer {
  if (!buffer || buffer.length < 16) return buffer

  try {
    // 1. JPEG: Strip APP1 (0xFFE1: EXIF / GPS / XMP), APP13 (0xFFED: Photoshop), and COM (0xFFFE)
    if (mime === "image/jpeg" && buffer[0] === 0xff && buffer[1] === 0xd8) {
      const chunks: Buffer[] = [buffer.subarray(0, 2)] // include SOI (FF D8)
      let offset = 2

      while (offset < buffer.length - 4) {
        if (buffer[offset] !== 0xff) {
          // Reached raw image data or unaligned marker
          chunks.push(buffer.subarray(offset))
          break
        }

        const marker = buffer[offset + 1]

        // End of image
        if (marker === 0xd9) {
          chunks.push(buffer.subarray(offset, offset + 2))
          break
        }

        // Start of scan (image stream follows immediately until EOI)
        if (marker === 0xda) {
          chunks.push(buffer.subarray(offset))
          break
        }

        // Variable-length marker segments have 2-byte length (big-endian)
        const length = (buffer[offset + 2] << 8) | buffer[offset + 3]
        const nextOffset = offset + 2 + length

        if (nextOffset > buffer.length) {
          chunks.push(buffer.subarray(offset))
          break
        }

        // APP1 (EXIF / GPS / XMP: 0xE1) -> STRIP!
        // APP13 (Photoshop metadata: 0xED) -> STRIP!
        // COM (Comment: 0xFE) -> STRIP!
        const shouldStrip = marker === 0xe1 || marker === 0xed || marker === 0xfe

        if (!shouldStrip) {
          chunks.push(buffer.subarray(offset, nextOffset))
        }

        offset = nextOffset
      }

      return Buffer.concat(chunks)
    }

    // 2. PNG: Strip eXIf, tEXt, zTXt, iTXt metadata chunks
    if (
      mime === "image/png" &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      const chunks: Buffer[] = [buffer.subarray(0, 8)] // PNG header
      let offset = 8

      while (offset < buffer.length - 12) {
        const length =
          (buffer[offset] << 24) |
          (buffer[offset + 1] << 16) |
          (buffer[offset + 2] << 8) |
          buffer[offset + 3]

        const type = buffer.toString("ascii", offset + 4, offset + 8)
        const totalChunkLength = 4 + 4 + length + 4 // length (4) + type (4) + data (len) + crc (4)

        if (offset + totalChunkLength > buffer.length) {
          chunks.push(buffer.subarray(offset))
          break
        }

        // Strip metadata chunks
        const isMetadata = ["eXIf", "tEXt", "zTXt", "iTXt"].includes(type)
        if (!isMetadata) {
          chunks.push(buffer.subarray(offset, offset + totalChunkLength))
        }

        offset += totalChunkLength
        if (type === "IEND") break
      }

      return Buffer.concat(chunks)
    }

    // WebP, GIF, or others return untouched
    return buffer
  } catch (err) {
    console.warn("EXIF stripping non-fatal warning, keeping original buffer:", err)
    return buffer
  }
}

// ------------------------------------------------------------------------------
// 4. Multimodal Image Safety Screening with Gemini
// ------------------------------------------------------------------------------

const IMAGE_SAFETY_SYSTEM_PROMPT = `You are an automated visual safety screener for Theirs (theirs.page), a digital memorial platform.
Analyze this submitted photograph or graphic for platform safety risks:

RISKS TO FLAG:
- "sexual": nudity, pornographic material, explicit genitalia or sexual acts.
- "threat": extreme gore, decapitation, real violence, self-harm, weapons held threateningly.
- "hate": hate symbols (swastikas, KKK insignia), racist imagery, dehumanizing graphics.
- "scam": scam flyers, crypto ads, fraudulent solicitation flyers, commercial spam banners.

DECISION RULES:
- Return "blocked" if: sexual, threat, hate, or scam is TRUE.
- Return "review" if: ambiguous, graphic medical photo, suggestive or potentially offensive.
- Return "safe" if: typical family photograph, portrait, group photo, pet, landscape, memorial ceremony, flower, or celebration.

Return ONLY a JSON object:
{
  "decision": "safe" | "review" | "blocked",
  "sexual": boolean,
  "threat": boolean,
  "hate": boolean,
  "scam": boolean,
  "reason": "1-sentence explanation"
}`

export async function screenImageWithGemini(
  imageBuffer: Buffer,
  mime: string
): Promise<SafetyScreeningResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === "AIzaSy_placeholder_for_build") {
    return DEFAULT_SAFE_RESULT
  }

  try {
    const genAI = new GoogleGenAI({ apiKey })
    const base64Data = imageBuffer.toString("base64")

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: IMAGE_SAFETY_SYSTEM_PROMPT },
        {
          inlineData: {
            mimeType: mime,
            data: base64Data,
          },
        },
      ],
    })

    const extracted =
      (response as { text?: string }).text ||
      response.candidates?.[0]?.content?.parts?.find((p) => "text" in p)?.text

    if (!extracted) {
      return DEFAULT_SAFE_RESULT
    }

    const cleanedJson = extracted
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()

    const parsed = JSON.parse(cleanedJson)
    return {
      decision: ["safe", "review", "blocked"].includes(parsed.decision)
        ? parsed.decision
        : "review",
      sexual: Boolean(parsed.sexual),
      threat: Boolean(parsed.threat),
      hate: Boolean(parsed.hate),
      harassment: false,
      spam: Boolean(parsed.scam),
      scam: Boolean(parsed.scam),
      personal_data: false,
      garbage: false,
      reason: parsed.reason || "Image visual screening completed.",
    }
  } catch (err) {
    console.warn("Gemini image safety check non-fatal error:", err)
    return DEFAULT_SAFE_RESULT
  }
}
