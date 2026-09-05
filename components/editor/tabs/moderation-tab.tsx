"use client"

import { useState } from "react"
import {
  Archive,
  Check,
  Mail,
  Trash2,
  X,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Camera,
  Heart,
  BookOpen,
} from "lucide-react"
import { ConfirmDeleteModal } from "../confirm-delete-modal"
import type { SectionSettings } from "@/types/theirs"

export interface EditorMemory {
  id: string
  author_name: string
  author_relationship?: string | null
  story: string
  approx_year?: number | null
  photo_url?: string | null
  photo_urls?: string[] | null
  tribute_type?: string | null
  contribution_type?: string | null
  status: "pending_approval" | "approved" | "rejected" | "blocked"
  safety_decision?: "safe" | "review" | "blocked"
  safety_details?: Record<string, any> | null
  contributor_role?: string | null
  is_quarantined?: boolean
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
  onUpdateMemoryStatus: (id: string, status: "approved" | "rejected" | "pending_approval") => void
  onUpdateCaretakerMessage: (id: string, status: "read" | "archived") => void
  onDeleteMemory: (id: string) => void
  onDeleteCaretakerMessage: (id: string) => void
}

function mediaPreviewUrl(value: string): string {
  if (/^(?:https?:|blob:|data:|\/)/.test(value)) return value
  return `/api/media?key=${encodeURIComponent(value)}`
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
}: ModerationTabProps) {
  const [subTab, setSubTab] = useState<"memories" | "messages">(initialSubTab)
  const [activeBucket, setActiveBucket] = useState<"pending" | "published" | "blocked">("pending")
  const [isBlockedExpanded, setIsBlockedExpanded] = useState(false)
  const [revealedBlockedIds, setRevealedBlockedIds] = useState<Record<string, boolean>>({})

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
    action: "approve" | "reject" | "unpublish"
  ) => {
    try {
      const res = await fetch(`/api/memorials/${memorialId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, targetId, action }),
      })

      if (res.ok) {
        const nextStatus =
          action === "approve"
            ? "approved"
            : action === "unpublish"
            ? "pending_approval"
            : "rejected"
        onUpdateMemoryStatus(targetId, nextStatus)
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

  const toggleRevealBlocked = (id: string) => {
    setRevealedBlockedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Separate memories into the 3 discrete queues
  const pendingMemories = memories.filter(
    (m) => m.status === "pending_approval" && m.safety_decision !== "blocked"
  )
  const publishedMemories = memories.filter((m) => m.status === "approved")
  const blockedMemories = memories.filter(
    (m) => m.status === "blocked" || m.safety_decision === "blocked"
  )

  const unreadMessagesCount = caretakerMessages.filter((message) => message.status === "unread").length

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          Contributions & Moderation
        </h2>
        <p className="text-xs sm:text-sm text-[#71717a]">
          Review incoming family remembrances and manage private messages sent to the memorial.
        </p>
      </div>

      {/* Main Subtabs: Memories vs Private Messages */}
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
            <span>Contributions ({memories.length})</span>
            {pendingMemories.length > 0 && (
              <span className="size-4 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
                {pendingMemories.length}
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
      </div>

      {/* CONTRIBUTIONS TAB */}
      {subTab === "memories" && (
        <div className="flex flex-col gap-5">
          {/* Three-Tier Queue Filter Navigation */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-neutral-100 border border-black/[0.04]">
            <button
              type="button"
              onClick={() => setActiveBucket("pending")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeBucket === "pending"
                  ? "bg-white text-[#181925] shadow-xs"
                  : "text-[#71717a] hover:text-[#181925]"
              }`}
            >
              <span>Waiting for approval</span>
              {pendingMemories.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  {pendingMemories.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveBucket("published")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeBucket === "published"
                  ? "bg-white text-[#181925] shadow-xs"
                  : "text-[#71717a] hover:text-[#181925]"
              }`}
            >
              <span>Published</span>
              <span className="text-[11px] text-[#aaa]">({publishedMemories.length})</span>
            </button>

            {blockedMemories.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveBucket("blocked")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeBucket === "blocked"
                    ? "bg-rose-50 text-rose-900 shadow-xs"
                    : "text-rose-600 hover:text-rose-800"
                }`}
              >
                <ShieldAlert className="size-3" />
                <span>Blocked</span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-200/70 text-rose-950 text-[10px] font-bold">
                  {blockedMemories.length}
                </span>
              </button>
            )}
          </div>

          {/* QUEUE 1: WAITING FOR APPROVAL */}
          {activeBucket === "pending" && (
            <div className="flex flex-col gap-3">
              {pendingMemories.length === 0 ? (
                <div className="p-10 rounded-2xl bg-white border border-black/[0.05] text-center flex flex-col items-center gap-2">
                  <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Check className="size-5" />
                  </div>
                  <h4 className="text-sm font-medium text-[#181925]">All caught up</h4>
                  <p className="text-xs text-[#888] max-w-sm">
                    No contributions waiting for review. When visitors share memories, they will appear here for your approval.
                  </p>
                </div>
              ) : (
                pendingMemories.map((mem) => {
                  const isReview = mem.safety_decision === "review"
                  const safetyReason = mem.safety_details?.reason

                  return (
                    <div
                      key={mem.id}
                      className={`p-5 rounded-2xl bg-white border flex flex-col gap-3.5 shadow-2xs transition-all ${
                        isReview ? "border-amber-300 bg-amber-50/20" : "border-black/[0.07]"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-[#181925]">
                              {mem.author_name}
                            </span>
                            {mem.author_relationship && (
                              <span className="text-xs text-[#71717a]">
                                · {mem.author_relationship}
                              </span>
                            )}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                              {mem.contributor_role || "anonymous"}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#aaa] font-mono">
                            {new Date(mem.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Safety tag */}
                        {isReview ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-medium border border-amber-200">
                            <AlertTriangle className="size-3 text-amber-700" />
                            <span>Review recommended</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-[#71717a] text-[10px] font-medium">
                            <ShieldCheck className="size-3 text-emerald-600" />
                            <span>Safety passed</span>
                          </div>
                        )}
                      </div>

                      {/* Flag reason note if review is recommended */}
                      {isReview && safetyReason && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                          <strong>Note:</strong> {safetyReason}
                        </div>
                      )}

                      {/* Content narrative */}
                      <p className="text-xs sm:text-sm text-[#333] leading-relaxed whitespace-pre-line">
                        “{mem.story}”
                      </p>

                      {/* Attached Photo Preview */}
                      {mem.photo_url && (
                        <div className="pt-1">
                          <img
                            src={mediaPreviewUrl(mem.photo_url)}
                            alt="Contributed photo"
                            className="h-28 w-auto rounded-xl object-cover border border-black/[0.08]"
                          />
                        </div>
                      )}

                      {/* Actions Toolbar */}
                      <div className="flex items-center justify-between pt-3 border-t border-black/[0.05]">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: "memory",
                              id: mem.id,
                              title: "Delete contribution permanently?",
                              preview: `By ${mem.author_name}: “${mem.story.slice(0, 70)}...”`,
                            })
                          }
                          className="p-1 rounded-full text-[#aaa] hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 className="size-3.5" />
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleModerate("memory", mem.id, "reject")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#555] text-xs font-medium transition-colors cursor-pointer"
                          >
                            <X className="size-3" />
                            <span>Decline</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleModerate("memory", mem.id, "approve")}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#181925] hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer"
                          >
                            <Check className="size-3 text-emerald-400" />
                            <span>Approve & Publish</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* QUEUE 2: PUBLISHED LIVE CONTRIBUTIONS */}
          {activeBucket === "published" && (
            <div className="flex flex-col gap-3">
              {publishedMemories.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
                  No published contributions yet.
                </div>
              ) : (
                publishedMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-5 rounded-2xl bg-white border border-black/[0.07] flex flex-col gap-3 shadow-2xs"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-[#181925]">{mem.author_name}</span>
                        {mem.author_relationship && (
                          <span className="text-[11px] text-[#71717a]">({mem.author_relationship})</span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Live
                        </span>
                      </div>

                      <span className="text-[10px] text-[#aaa] font-mono">
                        {new Date(mem.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-[#444] leading-relaxed whitespace-pre-line">“{mem.story}”</p>

                    {mem.photo_url && (
                      <img
                        src={mediaPreviewUrl(mem.photo_url)}
                        alt="Photo"
                        className="h-24 w-auto rounded-xl object-cover border border-black/[0.08]"
                      />
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: "memory",
                            id: mem.id,
                            title: "Delete contribution permanently?",
                            preview: `By ${mem.author_name}: “${mem.story.slice(0, 70)}...”`,
                          })
                        }
                        className="p-1 rounded-full text-[#aaa] hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleModerate("memory", mem.id, "unpublish")}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#555] text-xs font-medium transition-colors cursor-pointer"
                        title="Move back to pending queue"
                      >
                        <RotateCcw className="size-3" />
                        <span>Unpublish</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* QUEUE 3: BLOCKED BY SAFETY CHECKS */}
          {(activeBucket === "blocked" || blockedMemories.length > 0) && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-rose-600" />
                    <span className="text-xs font-semibold">
                      Blocked by safety checks ({blockedMemories.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBlockedExpanded(!isBlockedExpanded)}
                    className="text-xs text-rose-700 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isBlockedExpanded ? "Collapse" : "View quarantined"}</span>
                    {isBlockedExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                </div>
                <p className="text-[11px] text-rose-800/90 leading-relaxed">
                  These submissions were automatically blocked by platform screening (harmful content, spam links, explicit imagery, or scam bots). They are quarantined and never shown to the public.
                </p>
              </div>

              {isBlockedExpanded && (
                <div className="flex flex-col gap-3">
                  {blockedMemories.map((mem) => {
                    const isRevealed = Boolean(revealedBlockedIds[mem.id])
                    const safetyDetails = mem.safety_details || {}

                    return (
                      <div
                        key={mem.id}
                        className="p-5 rounded-2xl bg-white border border-rose-200/80 flex flex-col gap-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-[#181925]">
                              {mem.author_name}
                            </span>
                            <span className="text-[10px] text-[#aaa] font-mono">
                              Quarantined {new Date(mem.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Safety Violations Tags */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {safetyDetails.spam && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-bold">
                                Spam / URL
                              </span>
                            )}
                            {safetyDetails.sexual && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-bold">
                                Explicit
                              </span>
                            )}
                            {safetyDetails.threat && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-bold">
                                Threat
                              </span>
                            )}
                            {safetyDetails.harassment && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-bold">
                                Harassment
                              </span>
                            )}
                            {safetyDetails.scam && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-bold">
                                Scam
                              </span>
                            )}
                            {safetyDetails.garbage && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-bold">
                                Bot text
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Safety Reason explanation */}
                        {safetyDetails.reason && (
                          <div className="p-2.5 rounded-xl bg-neutral-50 text-[11px] text-[#555]">
                            <strong>Filter reason:</strong> {safetyDetails.reason}
                          </div>
                        )}

                        {/* Blurred text/media with explicit reveal toggle */}
                        <div className="relative p-3 rounded-xl bg-neutral-100 border border-black/[0.05]">
                          <p
                            className="text-xs text-[#444]"
                          >
                            {isRevealed ? mem.story : "Content is hidden to protect the family."}
                          </p>

                          {isRevealed && mem.photo_url && (
                            <div className="mt-2">
                              <img
                                src={mediaPreviewUrl(mem.photo_url)}
                                alt="Quarantined attachment"
                                className="h-24 w-auto rounded-lg object-cover"
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleRevealBlocked(mem.id)}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-black cursor-pointer"
                          >
                            {isRevealed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                            <span>{isRevealed ? "Hide content" : "Reveal quarantined content"}</span>
                          </button>
                        </div>

                        {/* Action: Permanently Delete */}
                        <div className="flex justify-end pt-2 border-t border-black/[0.05]">
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: "memory",
                                id: mem.id,
                                title: "Permanently purge quarantined submission?",
                                preview: `Quarantined item from ${mem.author_name}`,
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                            <span>Purge permanently</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PRIVATE CARETAKER MESSAGES */}
      {subTab === "messages" && (
        <div className="flex flex-col gap-6">
          <p className="text-xs leading-5 text-[#71717a]">
            Messages sent through the memorial are private. Replying opens your email app with the visitor&apos;s address filled in.
          </p>
          <div className="flex flex-col gap-3">
            {caretakerMessages.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
                No private messages yet.
              </div>
            ) : (
              caretakerMessages.map((item) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden p-5 rounded-2xl bg-white border flex flex-col gap-3 shadow-2xs ${
                    item.status === "unread" ? "border-primary/25" : "border-black/[0.07]"
                  } ${item.status === "archived" ? "opacity-60" : ""}`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-[#181925]">{item.sender_name}</span>
                      <span className="text-[11px] text-[#71717a] font-mono">{item.sender_email}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                        item.status === "unread"
                          ? "bg-primary/10 text-primary"
                          : item.status === "read"
                          ? "bg-neutral-100 text-[#666]"
                          : "bg-neutral-100 text-[#aaa]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#444] leading-relaxed whitespace-pre-line">“{item.message}”</p>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.04]">
                    <a
                      href={`mailto:${item.sender_email}?subject=Regarding your message on Theirs`}
                      onClick={() => {
                        if (item.status === "unread") updateMessage(item.id, "read")
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#181925] text-white hover:bg-black text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Mail className="size-3" />
                      <span>Reply via Email</span>
                    </a>

                    <div className="flex items-center gap-2">
                      {item.status !== "archived" && (
                        <button
                          type="button"
                          onClick={() => updateMessage(item.id, "archive")}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#555] text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Archive className="size-3" />
                          <span>Archive</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: "caretaker_message",
                            id: item.id,
                            title: "Delete message permanently?",
                            preview: `From ${item.sender_name} (${item.sender_email}): “${item.message.slice(0, 60)}...”`,
                          })
                        }
                        className="p-1 rounded-full text-[#aaa] hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Reusable Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.title || "Confirm deletion"}
        description="This action cannot be undone."
        itemPreview={deleteTarget?.preview}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
