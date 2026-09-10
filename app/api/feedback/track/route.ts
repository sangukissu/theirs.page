import { NextResponse } from "next/server"

export async function POST() {
  // Deprecated legacy BringBack restoration counter endpoint.
  // Kept as safe no-op for backward compatibility.
  return NextResponse.json({ success: true, deprecated: true })
}