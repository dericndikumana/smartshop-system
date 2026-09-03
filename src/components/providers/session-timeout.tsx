"use client"

import { useEffect, useRef, useCallback } from "react"
import { signOut, useSession } from "next-auth/react"

export function SessionTimeout() {
  const { status } = useSession()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // 2 minutes = 120,000 ms
  const TIMEOUT_MS = 120000

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (status === "authenticated") {
      timeoutRef.current = setTimeout(() => {
        // Sign out automatically when idle
        signOut({ callbackUrl: "/login" })
      }, TIMEOUT_MS)
    }
  }, [status])

  useEffect(() => {
    resetTimer()

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"]

    const handleActivity = () => {
      resetTimer()
    }

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [resetTimer])

  return null
}
