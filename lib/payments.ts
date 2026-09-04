/**
 * lib/payments.ts — Pro Plan  ($179) Payment Configuration & Helpers
 */

export const THEIRS_COMPLETE_PRICE_USD = 179
export const THEIRS_COMPLETE_PRICE_CENTS = 17900
export const THEIRS_COMPLETE_PRODUCT_NAME = "Theirs Complete — Family Archive"

/**
 * Infer Dodo Payments base URL based on environment
 */
export function getDodoBaseURL(): string {
  const mode = (process.env.DODO_ENV || "").toLowerCase()
  if (mode === "test" || mode === "testing" || mode === "sandbox") {
    return "https://test.dodopayments.com"
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  if (appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
    return "https://test.dodopayments.com"
  }

  return "https://live.dodopayments.com"
}

/**
 * Retrieve configured Dodo Payments product ID for Pro Plan ($179)
 */
export function getDodoCompleteProductId(): string {
  return (
    process.env.DODO_PRODUCT_ID_COMPLETE ||
    process.env.DODO_PRODUCT_ID ||
    ""
  )
}

/**
 * Resolve localized payment methods by country code
 */
export function resolveAllowedPaymentMethods(countryCode: string): string[] {
  const defaults = ["credit", "debit", "apple_pay", "google_pay"]

  if (countryCode === "IN") {
    return [...defaults, "upi_collect", "upi_intent"]
  }

  if (["NL", "BE", "PL", "AT"].includes(countryCode)) {
    const euMap: Record<string, string[]> = {
      NL: ["ideal"],
      BE: ["bancontact"],
      PL: ["p24"],
      AT: ["eps"],
    }
    return [...defaults, ...(euMap[countryCode] || [])]
  }

  return defaults
}
