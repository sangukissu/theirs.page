"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gift, ShieldCheck, Volume2, Image as ImageIcon, Users } from "lucide-react"

export function GiftPreviewCard() {
  const [activeTab, setActiveTab] = useState<"invitation" | "features">("invitation")

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-[#f7f7f8] border border-black/[0.06] p-4 sm:p-6 text-left flex flex-col gap-4">
      {/* Top Selector Toggle */}
      <div className="flex items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-black/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("invitation")}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "invitation"
                ? "bg-[#181925] text-white"
                : "text-[#666] hover:text-[#181925]"
            }`}
          >
            Recipient's Invitation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("features")}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "features"
                ? "bg-[#181925] text-white"
                : "text-[#666] hover:text-[#181925]"
            }`}
          >
            Included Entitlements
          </button>
        </div>

        <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium hidden sm:inline-block">
          Complete Plan · $179 Value
        </span>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "invitation" ? (
          <motion.div
            key="invitation"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl bg-white border border-black/[0.08] p-5 sm:p-6 flex flex-col gap-4"
          >
            {/* Stationery Inscription Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-dashed border-black/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Gift className="size-4" />
                </span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-primary font-medium">
                    Prepaid Memorial Entitlement
                  </p>
                  <h3 className="text-base font-medium text-[#181925] leading-snug">
                    For Sarah Mitchell & family
                  </h3>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md shrink-0">
                ✓ Ready to Claim
              </span>
            </div>

            {/* Sympathy Message Quote Card */}
            <div className="rounded-lg bg-[#fafafb] border border-black/[0.05] p-4 flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-wider text-[#888]">
                A note from David Ross:
              </span>
              <p className="font-serif italic text-sm leading-6 text-[#333]">
                “Thinking of you and your family. We wanted you to have a quiet, lasting place to celebrate your dad's life, listen to his voice, and gather memories from everyone who loved him — whenever you feel ready.”
              </p>
            </div>

            {/* Inscription Footer */}
            <div className="flex items-center justify-between text-xs text-[#777] pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>100% private to recipient</span>
              </span>
              <span className="font-mono">Never expires</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl bg-white border border-black/[0.08] p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#fafafb] border border-black/[0.04]">
              <ImageIcon className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-medium text-[#181925] block">Unlimited Media</strong>
                <span className="text-xs leading-5 text-[#666] block">Original-resolution photos & video memories</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#fafafb] border border-black/[0.04]">
              <Volume2 className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-medium text-[#181925] block">Voice Recordings</strong>
                <span className="text-xs leading-5 text-[#666] block">Preserved audio notes & voicemails</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#fafafb] border border-black/[0.04]">
              <Users className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-medium text-[#181925] block">Unlimited Family</strong>
                <span className="text-xs leading-5 text-[#666] block">Friends contribute without creating accounts</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#fafafb] border border-black/[0.04]">
              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-medium text-[#181925] block">No Subscriptions</strong>
                <span className="text-xs leading-5 text-[#666] block">Prepaid forever; no surprise renewals</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs text-[#888]">
        The recipient receives a private invitation link. They can activate a new memorial or apply it to an existing draft.
      </p>
    </div>
  )
}
