"use client"

import { useState } from "react"
import { updatePasswordAction, updateProfileInfoAction } from "@/app/actions/user"
import { Lock, User } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "@/components/providers/language-provider"
import { useSession } from "next-auth/react"

interface SettingsClientProps {
  userRole: string
  initialName: string
  initialEmail: string
  initialPhone?: string
}

export function SettingsClient({ userRole, initialName, initialEmail, initialPhone }: SettingsClientProps) {
  const { t } = useTranslation()
  const { update } = useSession()
  const [isPwdLoading, setIsPwdLoading] = useState(false)
  const [isProfLoading, setIsProfLoading] = useState(false)

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsProfLoading(true)

    const formData = new FormData(e.currentTarget)
    const newName = formData.get("name") as string
    const newEmail = formData.get("email") as string
    const result = await updateProfileInfoAction(formData)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success(result.message || "Profile updated successfully.")
      await update({ name: newName, email: newEmail }) // Sync session locally
    }
    
    setIsProfLoading(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPwdLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updatePasswordAction(formData)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success(result.message || "Password updated successfully.")
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsPwdLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          {t('settings_page.edit_profile')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t('settings_page.profile_desc')}</p>
        
        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('settings_page.full_name')}</label>
            <input 
              required
              name="name"
              type="text" 
              defaultValue={initialName}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('settings_page.email')}</label>
            <input 
              required
              name="email"
              type="email" 
              defaultValue={initialEmail}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input 
              name="phone"
              type="tel" 
              defaultValue={initialPhone || ""}
              placeholder="e.g. +250781234567"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isProfLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
          >
            {isProfLoading ? "..." : t('settings_page.update_profile')}
          </button>
        </form>
      </div>

      {userRole !== "CASHIER" && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-destructive flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t('settings_page.security')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{t('settings_page.security_desc')}</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings_page.current_pwd')}</label>
              <input 
                required
                name="currentPassword"
                type="password" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings_page.new_pwd')}</label>
              <input 
                required
                name="newPassword"
                type="password" 
                placeholder="Minimum 6 characters"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings_page.confirm_pwd')}</label>
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
              {isPwdLoading ? "..." : t('settings_page.update_pwd')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
