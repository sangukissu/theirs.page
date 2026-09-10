"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { SparklesCore } from "@/components/ui/sparkles"
import { AnimatePresence, motion } from "framer-motion"
import { IconDotsVertical } from "@tabler/icons-react"
import { DownloadIcon, ImageOffIcon, ImageUpIcon } from "lucide-react"

interface ImageComparisonProps {
  originalUrl: string
  restoredUrl: string
  onStartOver?: () => void
  onDownload?: (restoredUrl: string) => void
  showStartOver?: boolean
  beforeLabel?: string
  afterLabel?: string
  compareHint?: string
  startOverLabel?: string
  hideControls?: boolean
  hideCard?: boolean
}

export default function ImageComparison({
  originalUrl,
  restoredUrl,
  onStartOver,
  onDownload,
  showStartOver = true,
  beforeLabel = "Original",
  afterLabel = "Restored",
  compareHint = "Drag the slider to compare before and after",
  startOverLabel = "Restore Another",
  hideControls = false,
  hideCard = false,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Performance optimization refs
  const rafRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)

  // Throttle slider updates to improve performance
  const updateSliderPosition = useCallback((percentage: number) => {
    const now = Date.now()
    if (now - lastUpdateRef.current < 16) return // ~60fps max
    
    lastUpdateRef.current = now
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    rafRef.current = requestAnimationFrame(() => {
      setSliderPosition(Math.max(0, Math.min(100, percentage)))
    })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    updateSliderPosition(percentage)
  }, [isDragging, updateSliderPosition])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const percentage = (x / rect.width) * 100
    updateSliderPosition(percentage)
  }, [isDragging, updateSliderPosition])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const handleDownload = async () => {
    if (onDownload) {
      // Use the parent's download handler (with feedback tracking)
      onDownload(restoredUrl)
    } else {
      // Fallback to default download behavior
      try {
        const response = await fetch(restoredUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `restored-image-${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Error downloading image:", error)
        alert("Failed to download image")
      }
    }
  }

  // Memoize the clip path to prevent unnecessary recalculations
  const clipPathStyle = useMemo(() => ({
    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
  }), [sliderPosition])

  const comparisonSlider = (
    <div className="flex justify-center w-full">
      <div
        ref={containerRef}
        className="relative w-full h-[260px] xs:h-[300px] sm:h-[400px] lg:h-[480px] rounded-xl overflow-hidden cursor-col-resize select-none border border-black/[0.08] bg-[#f7f7f8]"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ touchAction: "none" }} // Prevent default touch behaviors
      >
        {/* Restored Image (Background) */}
        <img
          src={restoredUrl || "/placeholder.svg"}
          alt={`${afterLabel} image`}
          className="w-full h-full object-contain"
          draggable={false}
          loading="lazy"
        />

        {/* Original Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={clipPathStyle}
        >
          <img
            src={originalUrl || "/placeholder.svg"}
            alt={`${beforeLabel} image`}
            className="w-full h-full object-contain"
            draggable={false}
            loading="lazy"
          />
        </div>

        {/* Divider Slider Line and Handle */}
        <div
          className="h-full w-0.5 absolute top-0 m-auto z-30 bg-white shadow-[0_0_8px_rgba(0,0,0,0.35)]"
          style={{
            left: `${sliderPosition}%`,
            top: "0",
            zIndex: 40,
          }}
        >
          <div className="size-7 sm:size-8 rounded-full top-1/2 -translate-y-1/2 bg-white z-30 -left-[13px] sm:-left-[15px] absolute flex items-center justify-center shadow-md border border-black/10 cursor-col-resize select-none">
            <IconDotsVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#181925]" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide select-none shadow-xs">
          {beforeLabel}
        </div>
        <div className="absolute top-3 right-3 bg-black/65 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide select-none shadow-xs">
          {afterLabel}
        </div>
      </div>
    </div>
  )

  if (hideCard) {
    return (
      <div className="w-full">
        {comparisonSlider}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white border border-black/[0.08] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="space-y-4 sm:space-y-5">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{compareHint}</p>
          </div>

          {/* Image Comparison Container */}
          {comparisonSlider}

          {/* Buttons */}
          {!hideControls && (
            <div className="flex flex-wrap gap-3 justify-center items-center pt-2">
              <Button
                onClick={handleDownload}
                className="h-10 px-5 rounded-full bg-[#181925] text-sm font-medium text-white hover:bg-black transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <DownloadIcon className="w-4 h-4 mr-1" />
                Download
              </Button>

              {showStartOver && (
                <Button
                  onClick={onStartOver}
                  variant="outline"
                  className="h-10 px-5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm font-medium transition-all flex items-center gap-2 cursor-pointer shadow-xs bg-white"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {startOverLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
