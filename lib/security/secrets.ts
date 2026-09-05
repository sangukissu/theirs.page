import "server-only"

function readSecret(names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return null
}

export function getRequiredSecret(names: string[], purpose: string): string {
  const value = readSecret(names)
  if (value) return value

  throw new Error(
    `${purpose} is not configured. Set one of: ${names.join(", ")}.`
  )
}

export function getOptionalSecret(names: string[]): string | null {
  return readSecret(names)
}
