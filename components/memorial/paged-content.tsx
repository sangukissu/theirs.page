"use client"

import { useEffect, useState } from "react"
import { Loader2, RotateCcw } from "lucide-react"
import { LifeStories, type StoryItem } from "./life-stories"
import { MemoriesStream, type MemoryItem } from "./memories-stream"
import { LifeTimeline, type TimelineMilestone } from "./life-timeline"
import { useMemorialActions } from "./memorial-shell"
import type { BrowseCollection, PagedCollection } from "@/types/memorial-view"

async function getNextPage<T>(slug: string, collection: BrowseCollection, cursor: string) {
  const params = new URLSearchParams({ collection, cursor })
  const response = await fetch(`/api/memorials/${slug}/browse?${params.toString()}`, { cache: "no-store" })
  if (!response.ok) throw new Error("We couldn't load more right now.")
  return response.json() as Promise<PagedCollection<T>>
}

function LoadMore({ label, loading, error, onClick }: { label: string; loading: boolean; error: string | null; onClick: () => void }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-12">
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      <button type="button" onClick={onClick} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-60">
        {loading ? <Loader2 className="size-4 animate-spin" /> : error ? <RotateCcw className="size-4" /> : null}
        {loading ? "Loading…" : error ? "Try again" : label}
      </button>
    </div>
  )
}

function EndOfList({ children }: { children: string }) {
  return <p className="px-4 pb-12 text-center text-sm text-[#777]">{children}</p>
}

function usePagedItems<T>(initial: PagedCollection<T>) {
  const [items, setItems] = useState(initial.items)
  const [nextCursor, setNextCursor] = useState(initial.nextCursor)
  const [hasMore, setHasMore] = useState(initial.hasMore)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [didLoadMore, setDidLoadMore] = useState(false)

  useEffect(() => {
    setItems(initial.items)
    setNextCursor(initial.nextCursor)
    setHasMore(initial.hasMore)
    setError(null)
    setDidLoadMore(false)
  }, [initial])

  const append = async (loader: (cursor: string) => Promise<PagedCollection<T>>) => {
    if (!nextCursor || loading) return
    setLoading(true); setError(null)
    try {
      const next = await loader(nextCursor)
      setItems((current) => {
        const seen = new Set(current.map((item: any) => item.id || `${item.year}-${item.title}`))
        return [...current, ...next.items.filter((item: any) => !seen.has(item.id || `${item.year}-${item.title}`))]
      })
      setNextCursor(next.nextCursor)
      setHasMore(next.hasMore)
      setDidLoadMore(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn't load more right now.")
    } finally { setLoading(false) }
  }

  return { items, hasMore, loading, error, didLoadMore, append }
}

export function PagedMemories({ slug, fullName, memorialId, isDemo, initial }: { slug: string; fullName: string; memorialId?: string; isDemo: boolean; initial: PagedCollection<StoryItem> }) {
  const state = usePagedItems(initial)
  const { openContribute } = useMemorialActions()
  return <><LifeStories stories={state.items} fullName={fullName} memorialId={memorialId} slug={slug} isDemo={isDemo} onOpenContribute={openContribute} />{state.hasMore && <LoadMore label="Show more memories" loading={state.loading} error={state.error} onClick={() => state.append((cursor) => getNextPage(slug, "memories", cursor))} />}{state.didLoadMore && !state.hasMore && <EndOfList>All memories are shown.</EndOfList>}</>
}

export function PagedTributes({ slug, fullName, memorialId, isDemo, initial }: { slug: string; fullName: string; memorialId?: string; isDemo: boolean; initial: PagedCollection<MemoryItem> }) {
  const state = usePagedItems(initial)
  const { openContribute } = useMemorialActions()
  return <><MemoriesStream memories={state.items} fullName={fullName} memorialId={memorialId} slug={slug} isDemo={isDemo} onOpenContribute={openContribute} />{state.hasMore && <LoadMore label="Show more tributes" loading={state.loading} error={state.error} onClick={() => state.append((cursor) => getNextPage(slug, "tributes", cursor))} />}{state.didLoadMore && !state.hasMore && <EndOfList>All tributes are shown.</EndOfList>}</>
}

export function PagedTimeline({ slug, initial, isDemo }: { slug: string; initial: PagedCollection<TimelineMilestone>; isDemo: boolean }) {
  const state = usePagedItems(initial)
  return <section><LifeTimeline milestones={state.items} isDemo={isDemo} />{state.hasMore && <LoadMore label="Show more milestones" loading={state.loading} error={state.error} onClick={() => state.append((cursor) => getNextPage(slug, "timeline", cursor))} />}{state.didLoadMore && !state.hasMore && <EndOfList>All milestones are shown.</EndOfList>}</section>
}
