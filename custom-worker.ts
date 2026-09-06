// OpenNext creates this module during `npm run build`.
// @ts-ignore Generated worker is absent until the OpenNext build step.
import nextWorker from "./.open-next/worker.js"

// @ts-ignore Generated worker is absent until the OpenNext build step.
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js"

interface TheirsWorkerEnv {
  CRON_SECRET?: string
  [key: string]: unknown
}

interface TheirsExecutionContext {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException?(): void
}

interface TheirsScheduledController {
  cron: string
}

const schedules: Record<string, string> = {
  "17 * * * *": "/api/cron/cleanup-temp",
  "30 3 * * 1": "/api/cron/blocked-digest",
}

async function runScheduledRoute(
  path: string,
  env: TheirsWorkerEnv,
  ctx: TheirsExecutionContext
): Promise<void> {
  if (!env.CRON_SECRET) throw new Error("CRON_SECRET is not configured")

  const response = await nextWorker.fetch(new Request(`https://theirs.page${path}`, {
    method: "GET",
    headers: { authorization: `Bearer ${env.CRON_SECRET}` },
  }), env, ctx)
  if (!response.ok) {
    throw new Error(`Scheduled route ${path} returned ${response.status}`)
  }
}

export default {
  fetch: nextWorker.fetch,
  scheduled(controller: TheirsScheduledController, env: TheirsWorkerEnv, ctx: TheirsExecutionContext) {
    const route = schedules[controller.cron]
    if (!route) throw new Error(`No handler is configured for cron ${controller.cron}`)
    ctx.waitUntil(runScheduledRoute(route, env, ctx))
  },
}
