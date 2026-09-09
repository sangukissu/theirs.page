/**
 * Open Analytics client-side tracking helper for Theirs (theirs.page).
 * 
 * Documentation: https://getopen.so/docs/custom-events
 * Revenue Documentation: https://getopen.so/docs/revenue
 * Identity Documentation: https://getopen.so/docs/identify
 *
 * CRITICAL RULE:
 * Do NOT call track() on an element that already has a data-oa-event attribute.
 * Open Analytics will count and bill each invocation separately.
 */

export type AnalyticsValue = string | number | boolean | null | undefined

export interface AnalyticsProperties {
  [key: string]: AnalyticsValue
}

export interface ConversionProperties extends AnalyticsProperties {
  order_id?: string
}

interface OpenAnalyticsGlobal {
  track: (name: string, props?: Record<string, string | number | boolean>) => void
  conversion: (name: string, props?: Record<string, string | number | boolean>) => void
  identify: (userId: string) => void
  consent: (state: "granted" | "denied") => void
}

declare global {
  interface Window {
    oa?: OpenAnalyticsGlobal
  }
}

const RESERVED_PREFIX = "oa_"
const SENSITIVE_KEY_REGEX = /^(token|session|email|password|secret|key|authorization|cookie)$/i

/**
 * Validates and sanitizes property keys and values according to Open Analytics requirements:
 * - Up to 32 properties per event
 * - Key length up to 40 characters
 * - String value length up to 256 characters
 * - Omits reserved keys (starting with 'oa_') and sensitive fields (email, token, etc.)
 */
function sanitizeProperties(props?: AnalyticsProperties): Record<string, string | number | boolean> | undefined {
  if (!props) return undefined

  const sanitized: Record<string, string | number | boolean> = {}
  let count = 0

  for (const [key, value] of Object.entries(props)) {
    if (count >= 32) break
    if (!key || typeof key !== "string") continue

    const trimmedKey = key.trim()
    if (trimmedKey.length === 0 || trimmedKey.length > 40) continue
    if (trimmedKey.toLowerCase().startsWith(RESERVED_PREFIX)) continue
    if (SENSITIVE_KEY_REGEX.test(trimmedKey)) continue

    if (value === null || value === undefined) continue

    if (typeof value === "string") {
      const trimmedVal = value.trim()
      sanitized[trimmedKey] = trimmedVal.slice(0, 256)
      count++
    } else if (typeof value === "number") {
      if (Number.isFinite(value)) {
        sanitized[trimmedKey] = value
        count++
      }
    } else if (typeof value === "boolean") {
      sanitized[trimmedKey] = value
      count++
    }
  }

  return count > 0 ? sanitized : undefined
}

/**
 * Validates an event name:
 * Letters or digits first, then letters, digits, _, ., :, -, up to 64 characters.
 */
function isValidEventName(name: string): boolean {
  if (!name || typeof name !== "string") return false
  return /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,63}$/.test(name)
}

/**
 * Programmatically tracks a custom event with Open Analytics.
 *
 * @example
 * track("memorial_created", { relationship: "parent" })
 */
export function track(eventName: string, properties?: AnalyticsProperties): void {
  if (typeof window === "undefined") return
  if (!isValidEventName(eventName)) return

  try {
    const sanitized = sanitizeProperties(properties)
    if (window.oa && typeof window.oa.track === "function") {
      window.oa.track(eventName, sanitized)
    }
  } catch (err) {
    // Fail silently in production
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] Error sending event:", eventName, err)
    }
  }
}

/**
 * Programmatically records a conversion outcome, optionally attributing revenue
 * using an order_id (e.g. checkout session or transaction id).
 *
 * @example
 * conversion("purchase", { order_id: "pi_12345", plan: "complete" })
 */
export function conversion(conversionName: string, properties?: ConversionProperties): void {
  if (typeof window === "undefined") return
  if (!isValidEventName(conversionName)) return

  try {
    const sanitized = sanitizeProperties(properties)
    if (window.oa && typeof window.oa.conversion === "function") {
      window.oa.conversion(conversionName, sanitized)
    } else if (window.oa && typeof window.oa.track === "function") {
      // Fallback if conversion method is pending
      window.oa.track(conversionName, sanitized)
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] Error recording conversion:", conversionName, err)
    }
  }
}

/**
 * Attaches a pseudonymous user identifier to events so returning signed-in users
 * are recognised across sessions and tied to attribution journeys.
 *
 * NOTE: The ID must be pseudonymous (e.g. database UUID or internal user ID).
 * Never pass email addresses or personal names.
 *
 * @example
 * identify(user.id)
 */
export function identify(userId: string): void {
  if (typeof window === "undefined") return
  if (!userId || typeof userId !== "string") return

  const trimmed = userId.trim()
  if (trimmed.length === 0 || trimmed.length > 128) return
  // Sanity check to avoid accidental email passing
  if (trimmed.includes("@")) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] Rejected identify call containing email format")
    }
    return
  }

  try {
    if (window.oa && typeof window.oa.identify === "function") {
      window.oa.identify(trimmed)
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] Error identifying user:", err)
    }
  }
}

/**
 * Explicitly grants or denies analytics consent for identification & attribution.
 */
export function consent(status: "granted" | "denied"): void {
  if (typeof window === "undefined") return
  try {
    if (window.oa && typeof window.oa.consent === "function") {
      window.oa.consent(status)
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] Error setting consent:", err)
    }
  }
}
