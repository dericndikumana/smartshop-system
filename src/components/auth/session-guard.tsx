"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"

export function SessionGuard() {
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/auth/status")
        if (res.ok) {
          const data = await res.json()
          if (data.suspended) {
            signOut({ callbackUrl: "/login?error=suspended" })
          }
        }
      } catch {
        // ignore fetch errors
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 3000)

    return () => clearInterval(interval)
  }, [])

  return null
}
