import { auth } from "@/lib/auth"
import { SettingsClient } from "./settings-client"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and security.
        </p>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile Information</h3>
          <p className="text-sm text-muted-foreground mb-4">Your current session details.</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Email</p>
              <p>{session?.user?.email}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Role</p>
              <p className="font-medium">{session?.user?.role}</p>
            </div>
          </div>
        </div>
        
        <SettingsClient />
      </div>
    </div>
  )
}
