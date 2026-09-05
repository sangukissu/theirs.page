"use client"

import { useState } from "react"
import { Archive, Check, Mail, Reply, Trash2, X } from "lucide-react"
import { ConfirmDeleteModal } from "../confirm-delete-modal"
import type { SectionSettings } from "@/types/theirs"

export interface EditorMemory {
  id: string
  author_name: string
  author_relationship?: string | null
  story: string
  approx_year?: number | null
  status: "pending_approval" | "approved" | "rejected"
  created_at: string
}

export interface EditorCaretakerMessage {
  id: string
  sender_name: string
  sender_email: string
  message: string
  status: "unread" | "read" | "archived"
  created_at: string
  read_at?: string | null
}

interface ModerationTabProps {
  memorialId: string
  initialSubTab?: "memories" | "messages"
  memories: EditorMemory[]
  caretakerMessages: EditorCaretakerMessage[]
  onUpdateMemoryStatus: (id: string, status: "approved" | "rejected") => void
  onUpdateCaretakerMessage: (id: string, status: "read" | "archived") => void
  onDeleteMemory: (id: string) => void
  onDeleteCaretakerMessage: (id: string) => void
  sectionSettings?: SectionSettings | null
  onToggleSection?: (key: keyof SectionSettings, enabled: boolean) => void
}

export function ModerationTab({
  memorialId,
  initialSubTab = "memories",
  memories,
  caretakerMessages,
  onUpdateMemoryStatus,
  onUpdateCaretakerMessage,
  onDeleteMemory,
  onDeleteCaretakerMessage,
  sectionSettings,
  onToggleSection,
}: ModerationTabProps) {
  const [subTab, setSubTab] = useState<"memories" | "messages">(initialSubTab)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "memory" | "caretaker_message"
    id: string
    title: string
    preview: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleModerate = async (
    target: "memory",
    targetId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const res = await fetch(`/api/memorials/${memorialId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, targetId, action }),
      })

      if (res.ok) {
        onUpdateMemoryStatus(targetId, action === "approve" ? "approved" : "rejected")
      }
    } catch (err) {
      console.error("Moderation action failed:", err)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: deleteTarget.type,
          targetId: deleteTarget.id,
          action: "delete",
        }),
      })

      if (res.ok) {
        if (deleteTarget.type === "memory") onDeleteMemory(deleteTarget.id)
        else onDeleteCaretakerMessage(deleteTarget.id)
        setDeleteTarget(null)
      } else {
        const data = await res.json().catch(() => ({}))
        console.error("Failed to delete contribution:", data.error)
      }
    } catch (err) {
      console.error("Moderation action failed:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const updateMessage = async (messageId: string, action: "read" | "archive") => {
    try {
      const response = await fetch(`/api/memorials/${memorialId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "caretaker_message", targetId: messageId, action }),
      })
      if (response.ok) onUpdateCaretakerMessage(messageId, action === "archive" ? "archived" : "read")
    } catch (error) {
      console.error("Message update failed:", error)
    }
  }

  const pendingMemoriesCount = memories.filter((m) => m.status === "pending_approval").length
  const unreadMessagesCount = caretakerMessages.filter((message) => message.status === "unread").length

  const isStoriesEnabled = sectionSettings?.stories !== false

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          Contributions & Moderation
        </h2>
        <p className="text-xs sm:text-sm text-[#71717a]">
          Review public contributions and respond to private messages sent to the memorial caretaker.
        </p>
      </div>

      {/* Sub-Tabs & Small Active Section Toggle */}
      <div className="flex items-center justify-between gap-4">
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
            <span>Stories & Memories ({memories.length})</span>
            {pendingMemoriesCount > 0 && (
              <span className="size-4 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
                {pendingMemoriesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab("messages")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === "messages"
                ? "bg-[#181925] text-white"
                : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
            }`}
          >
            <Mail className="size-3.5" />
            <span>Private messages ({caretakerMessages.length})</span>
            {unreadMessagesCount > 0 && (
              <span className="size-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>

        {/* Small toggle for the currently selected subtab */}
        {subTab === "memories" && <div className="flex items-center gap-2 select-none shrink-0">
          <span className={`text-xs ${isStoriesEnabled ? "text-[#71717a]" : "text-amber-700 font-medium"}`}>
            {isStoriesEnabled ? "Active" : "Off"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isStoriesEnabled}
            onClick={() => onToggleSection?.("stories", !isStoriesEnabled)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${isStoriesEnabled ? "bg-primary" : "bg-neutral-300"}`}
            title={isStoriesEnabled ? "Disable this section on memorial" : "Enable this section on memorial"}
          >
            <div className={`size-4 rounded-full bg-white transition-transform shadow-xs ${isStoriesEnabled ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>}
      </div>

      {/* MEMORIES TAB */}
      {subTab === "memories" && (
        <div className="flex flex-col gap-6">
          <div
            className={`flex flex-col gap-3 ${
              !isStoriesEnabled
                ? "opacity-35 pointer-events-none select-none grayscale-[40%] transition-all duration-200"
                : "transition-all duration-200"
            }`}
          >
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
                      onClick={() =>
                        setDeleteTarget({
                          type: "memory",
                          id: mem.id,
                          title: "Delete memory permanently?",
                          preview: `By ${mem.author_name}: “${mem.story.slice(0, 70)}${mem.story.length > 70 ? "..." : ""}”`,
                        })
                      }
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
        </div>
      )}

      {/* PRIVATE CARETAKER MESSAGES */}
      {subTab === "messages" && (
        <div className="flex flex-col gap-6">
          <p className="text-xs leading-5 text-[#71717a]">Messages sent through the memorial are private. Replying opens your email app with the visitor&apos;s address filled in.</p>
          <div className="flex flex-col gap-3">
            {caretakerMessages.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
                No private messages yet.
              </div>
            ) : (
              caretakerMessages.map((item) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden p-5 rounded-2xl bg-white border flex flex-col gap-3 shadow-2xs ${item.status === "unread" ? "border-primary/25" : "border-black/[0.07]"} ${item.status === "archived" ? "opacity-60" : ""}`}
                >
                  {item.status === "unread" && <span className="absolute right-0 top-0 rounded-bl-xl bg-primary px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white">New</span>}
                  <div className="flex items-start justify-between gap-4 pr-10">
                    <div>
                      <p className="text-sm font-semibold text-[#181925]">{item.sender_name}</p>
                      <a href={`mailto:${item.sender_email}`} className="mt-0.5 block text-xs text-primary hover:underline">{item.sender_email}</a>
                    </div>
                    <time className="shrink-0 text-[10px] font-mono text-[#929399]">{new Date(item.created_at).toLocaleDateString()}</time>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#404146]">{item.message}</p>
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-black/[0.05] pt-3">
                    <a
                      href={`mailto:${item.sender_email}?subject=${encodeURIComponent("Re: your message about this memorial")}`}
                      onClick={() => item.status === "unread" && updateMessage(item.id, "read")}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-white hover:bg-primary/90"
                    >
                      <Reply className="size-3.5" /> Reply
                    </a>
                    {item.status === "unread" && (
                      <button type="button" onClick={() => updateMessage(item.id, "read")} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#f2f3f5] px-3.5 text-xs font-medium text-[#55585c] hover:bg-[#e8e9ec]">
                        <Check className="size-3.5" /> Mark read
                      </button>
                    )}
                    {item.status !== "archived" && (
                      <button type="button" onClick={() => updateMessage(item.id, "archive")} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#f2f3f5] px-3.5 text-xs font-medium text-[#55585c] hover:bg-[#e8e9ec]">
                        <Archive className="size-3.5" /> Archive
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: "caretaker_message",
                          id: item.id,
                          title: "Delete this private message?",
                          preview: `From ${item.sender_name}: “${item.message.slice(0, 70)}${item.message.length > 70 ? "..." : ""}”`,
                        })
                      }
                      className="flex size-8 items-center justify-center rounded-full text-[#aaa] hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title || "Delete item?"}
        description="This item will be permanently removed and cannot be recovered."
        itemPreview={deleteTarget?.preview}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => !isDeleting && setDeleteTarget(null)}
      />
    </div>
  )
}
