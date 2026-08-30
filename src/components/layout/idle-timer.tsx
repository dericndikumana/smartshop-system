"use client"

import { useEffect, useRef } from "react"
import { signOut } from "next-auth/react"

// 3 minutes in milliseconds
const IDLE_TIMEOUT = 3 * 60 * 1000 

export function IdleTimer() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      // Trigger logout on idle timeout
      signOut({ callbackUrl: "/login" })
    }, IDLE_TIMEOUT)
  }

  useEffect(() => {
    // Initial setup
    resetTimer()

    const events = ["mousemove", "keydown", "wheel", "touchstart", "click"]
    
    const handleUserActivity = () => resetTimer()

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true })
    })

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity)
      })
    }
  }, [])

  return null
}
