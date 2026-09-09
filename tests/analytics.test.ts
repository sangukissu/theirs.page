import assert from "node:assert/strict"
import test from "node:test"
import { track, conversion, identify, consent } from "../lib/analytics"

test("ANALYTICS: SSR safe when window is undefined", () => {
  // Should not throw or fail when running in server-side Node environment
  assert.doesNotThrow(() => {
    track("memorial_intent", { source: "hero" })
    conversion("purchase", { order_id: "pi_123", plan: "complete" })
    identify("user_uuid_123")
    consent("granted")
  })
})

test("ANALYTICS: sanitizes properties, strips sensitive keys and disallows invalid names", () => {
  const trackedEvents: Array<{ name: string; props?: Record<string, any> }> = []
  const identifiedUsers: string[] = []

  // Mock global window object
  const mockWindow: any = {
    oa: {
      track: (name: string, props?: Record<string, any>) => {
        trackedEvents.push({ name, props })
      },
      conversion: (name: string, props?: Record<string, any>) => {
        trackedEvents.push({ name, props })
      },
      identify: (userId: string) => {
        identifiedUsers.push(userId)
      },
      consent: (_state: string) => {},
    },
  }

  // @ts-ignore
  globalThis.window = mockWindow

  try {
    // 1. Valid event with various properties
    track("memorial_created", {
      relationship: "Parent",
      is_paid: false,
      count: 42,
      // Sensitive fields that must be dropped
      email: "secret@example.com",
      token: "secret_token_abc",
      password: "my_password",
      // Reserved prefix that must be dropped
      oa_custom: "forbidden",
      // Nullish values that must be omitted
      null_val: null,
      undefined_val: undefined,
    })

    assert.equal(trackedEvents.length, 1)
    const event = trackedEvents[0]
    assert.equal(event.name, "memorial_created")
    assert.deepEqual(event.props, {
      relationship: "Parent",
      is_paid: false,
      count: 42,
    })

    // 2. Disallow invalid event names
    track("invalid name with spaces", { foo: "bar" })
    track("", { foo: "bar" })
    track("!invalid_prefix", { foo: "bar" })
    assert.equal(trackedEvents.length, 1) // count unchanged

    // 3. Conversion tracking
    conversion("purchase", { order_id: "ord_999", plan: "complete" })
    assert.equal(trackedEvents.length, 2)
    assert.equal(trackedEvents[1].name, "purchase")
    assert.deepEqual(trackedEvents[1].props, {
      order_id: "ord_999",
      plan: "complete",
    })

    // 4. Identify: accepts valid pseudonymous ID
    identify("user_8f21c4-uuid")
    assert.equal(identifiedUsers.length, 1)
    assert.equal(identifiedUsers[0], "user_8f21c4-uuid")

    // 5. Identify: rejects email format to prevent PII leak
    identify("john@example.com")
    assert.equal(identifiedUsers.length, 1) // count unchanged
  } finally {
    // Clean up
    // @ts-ignore
    delete globalThis.window
  }
})
