"use client"

import { useState } from "react"
import { updatePasswordAction } from "@/app/actions/user"
import { Lock } from "lucide-react"

export function SettingsClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await updatePasswordAction(formData)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(result.message || "Password updated!")
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsLoading(false)
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium text-destructive flex items-center gap-2">
        <Lock className="h-4 w-4" />
        Security
      </h3>
      <p className="text-sm text-muted-foreground mb-4">Update your account password.</p>
      
      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Password</label>
          <input 
            required
            name="currentPassword"
            type="password" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <input 
            required
            name="newPassword"
            type="password" 
            placeholder="Minimum 6 characters"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm New Password</label>
          <input 
            required
            name="confirmPassword"
            type="password" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  )
}
