"use client"
import { signOut } from "next-auth/react"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function ForceLogout() {
  useEffect(() => {
    signOut({ callbackUrl: "/login?error=suspended" })
  }, [])
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">Account suspended. Logging out...</p>
    </div>
  )
}
