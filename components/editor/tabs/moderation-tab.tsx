"use client"

import { useState } from "react"
import { Check, X, Trash2, Clock, MessageSquare, Heart } from "lucide-react"

export interface EditorMemory {
  id: string
  author_name: string
  author_relationship?: string | null
  story: string
  approx_year?: number | null
  status: "pending_approval" | "approved" | "rejected"
  created_at: string
}

export interface EditorGuestbookEntry {
  id: string
  author_name: string
  message: string
  status: "pending_approval" | "approved" | "rejected"
  created_at: string
}

interface ModerationTabProps {
  memorialId: string
  memories: EditorMemory[]
  guestbookEntries: EditorGuestbookEntry[]
  onUpdateMemoryStatus: (id: string, status: "approved" | "rejected") => void
  onUpdateGuestbookStatus: (id: string, status: "approved" | "rejected") => void
  onDeleteMemory: (id: string) => void
  onDeleteGuestbook: (id: string) => void
}

export function ModerationTab({
  memorialId,
  memories,
  guestbookEntries,
  onUpdateMemoryStatus,
  onUpdateGuestbookStatus,
  onDeleteMemory,
  onDeleteGuestbook,
}: ModerationTabProps) {
  const [subTab, setSubTab] = useState<"memories" | "guestbook">("memories")

  const handleModerate = async (
    target: "memory" | "guestbook",
    targetId: string,
    action: "approve" | "reject" | "delete"
  ) => {
    try {
      const res = await fetch(`/api/memorials/${memorialId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, targetId, action }),
      })

      if (res.ok) {
        if (target === "memory") {
          if (action === "delete") onDeleteMemory(targetId)
          else onUpdateMemoryStatus(targetId, action === "approve" ? "approved" : "rejected")
        } else {
          if (action === "delete") onDeleteGuestbook(targetId)
          else onUpdateGuestbookStatus(targetId, action === "approve" ? "approved" : "rejected")
        }
      }
    } catch (err) {
      console.error("Moderation action failed:", err)
    }
  }

  const pendingMemoriesCount = memories.filter((m) => m.status === "pending_approval").length
  const pendingGuestbookCount = guestbookEntries.filter((g) => g.status === "pending_approval").length

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          Contributions & Moderation
        </h2>
        <p className="text-xs sm:text-sm text-[#71717a]">
          Family and friends can contribute memories and condolences. You control what appears on the memorial.
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSubTab("memories")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === "memories"
              ? "bg-[#181925] text-white"
              : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
          }`}
        >
          <span>Memories ({memories.length})</span>
          {pendingMemoriesCount > 0 && (
            <span className="size-4 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
              {pendingMemoriesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab("guestbook")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === "guestbook"
              ? "bg-[#181925] text-white"
              : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
          }`}
        >
          <span>Guestbook ({guestbookEntries.length})</span>
          {pendingGuestbookCount > 0 && (
            <span className="size-4 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
              {pendingGuestbookCount}
            </span>
          )}
        </button>
      </div>

      {/* MEMORIES LIST */}
      {subTab === "memories" && (
        <div className="flex flex-col gap-3">
          {memories.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
              No memories submitted yet. Share the memorial link with family to gather stories.
            </div>
          ) : (
            memories.map((mem) => (
              <div
                key={mem.id}
                className="p-5 rounded-2xl bg-white border border-black/[0.07] flex flex-col gap-3 shadow-2xs"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-[#181925]">{mem.author_name}</span>
                    {mem.author_relationship && (
                      <span className="text-[11px] text-[#71717a]">({mem.author_relationship})</span>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                      mem.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : mem.status === "pending_approval"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {mem.status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-[#444] leading-relaxed">“{mem.story}”</p>

                {/* Moderation Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.04]">
                  {mem.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleModerate("memory", mem.id, "approve")}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Check className="size-3" />
                      <span>Approve</span>
                    </button>
                  )}

                  {mem.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => handleModerate("memory", mem.id, "reject")}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#555] text-xs font-medium transition-colors cursor-pointer"
                    >
                      <X className="size-3" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleModerate("memory", mem.id, "delete")}
                    className="p-1 rounded-full text-[#aaa] hover:text-rose-600 transition-colors cursor-pointer ml-1"
                    title="Delete permanently"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* GUESTBOOK LIST */}
      {subTab === "guestbook" && (
        <div className="flex flex-col gap-3">
          {guestbookEntries.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
              No guestbook messages yet.
            </div>
          ) : (
            guestbookEntries.map((gb) => (
              <div
                key={gb.id}
                className="p-4 rounded-2xl bg-white border border-black/[0.07] flex flex-col gap-2 shadow-2xs"
              >
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-[#181925]">{gb.author_name}</span>
                  <button
                    type="button"
                    onClick={() => handleModerate("guestbook", gb.id, "delete")}
                    className="text-[#aaa] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <p className="text-xs text-[#555] leading-relaxed">{gb.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
