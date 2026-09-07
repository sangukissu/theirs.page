import type { UploadPurpose } from "./capabilities"

export function uploadManagerKey(userId: string, memorialId: string, purpose: UploadPurpose) {
  return `${userId}:${memorialId}:${purpose}`
}

export function uploadIndexedDbName(userId: string, memorialId: string, purpose: UploadPurpose) {
  return `theirs-uploads-${userId}-${memorialId}-${purpose}`
}

export function dedupeUploadItems<T extends { id: string; sessionId: string }>(items: T[]): T[] {
  const ids = new Set<string>()
  const sessionIds = new Set<string>()
  return items.filter((item) => {
    if (ids.has(item.id) || (item.sessionId && sessionIds.has(item.sessionId))) return false
    ids.add(item.id)
    if (item.sessionId) sessionIds.add(item.sessionId)
    return true
  })
}

export class UploadPreparationRegistry {
  private readonly controllers = new Map<string, AbortController>()

  begin(id: string) {
    this.cancel(id)
    const controller = new AbortController()
    this.controllers.set(id, controller)
    return controller
  }

  cancel(id: string) {
    const controller = this.controllers.get(id)
    if (!controller) return false
    controller.abort()
    this.controllers.delete(id)
    return true
  }

  cancelAll() {
    for (const controller of this.controllers.values()) controller.abort()
    this.controllers.clear()
  }

  finish(id: string, controller: AbortController) {
    if (this.controllers.get(id) === controller) this.controllers.delete(id)
  }
}
