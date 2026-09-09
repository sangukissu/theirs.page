"use client"

import { useEffect, useState } from 'react'
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { useNetworkStatus } from '@/hooks/use-network-status'

export default function NetworkStatus() {
  const { isOnline, isOffline } = useNetworkStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">You're offline - showing cached content</span>
      </div>
    </div>
  )
}

// Offline banner component for pages
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="bg-[#f7f7f8] border border-black/[0.08] rounded-xl p-3.5 mb-6 text-sm flex items-center gap-3">
      <AlertTriangle className="w-4 h-4 text-[#888] shrink-0" />
      <div>
        <p className="font-medium text-[#181925]">You are currently offline</p>
        <p className="text-xs text-[#777]">Showing cached content. Please reconnect to see new updates.</p>
      </div>
    </div>
  )
}