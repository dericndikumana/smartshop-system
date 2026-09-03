import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsClient } from "../settings-client"

export const dynamic = 'force-dynamic'

export default async function AccountSettingsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full pt-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Details</h1>
        <p className="text-muted-foreground mt-2">
          Update your personal information.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border mt-4">
            <div>
              <p className="font-medium text-muted-foreground">Email</p>
              <p className="font-semibold break-all">{session?.user?.email}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Role</p>
              <p className="font-semibold text-primary">{session?.user?.role}</p>
            </div>
          </div>
        </div>
        
        <SettingsClient 
          userRole={session.user.role || ""} 
          initialName={session.user.name || ""} 
          initialEmail={session.user.email || ""} 
        />
      </div>
    </div>
  )
}
