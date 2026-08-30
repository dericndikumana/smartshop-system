"use client"

import { useState } from "react"
import { updatePasswordAction, updateProfileInfoAction } from "@/app/actions/user"
import { Lock, User } from "lucide-react"

interface SettingsClientProps {
  userRole: string
  initialName: string
  initialEmail: string
}

export function SettingsClient({ userRole, initialName, initialEmail }: SettingsClientProps) {
  const [isPwdLoading, setIsPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null)

  const [isProfLoading, setIsProfLoading] = useState(false)
  const [profError, setProfError] = useState<string | null>(null)
  const [profSuccess, setProfSuccess] = useState<string | null>(null)

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsProfLoading(true)
    setProfError(null)
    setProfSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfileInfoAction(formData)

    if (result.error) {
      setProfError(result.error)
    } else if (result.success) {
      setProfSuccess(result.message || "Profile updated!")
    }
    
    setIsProfLoading(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPwdLoading(true)
    setPwdError(null)
    setPwdSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await updatePasswordAction(formData)

    if (result.error) {
      setPwdError(result.error)
    } else if (result.success) {
      setPwdSuccess(result.message || "Password updated!")
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsPwdLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Edit Profile
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Update your name and email address.</p>
        
        {profError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{profError}</div>}
        {profSuccess && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm">{profSuccess}</div>}
        
        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              required
              name="name"
              type="text" 
              defaultValue={initialName}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input 
              required
              name="email"
              type="email" 
              defaultValue={initialEmail}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isProfLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
          >
            {isProfLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      {userRole !== "CASHIER" && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-destructive flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Update your account password.</p>
          
          {pwdError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{pwdError}</div>}
          {pwdSuccess && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm">{pwdSuccess}</div>}
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
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
              disabled={isPwdLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
            >
              {isPwdLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
