import { auth } from "@/lib/auth"

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
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-destructive">Security</h3>
          <p className="text-sm text-muted-foreground mb-4">Change your password.</p>
          
          <form className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input 
                type="password" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input 
                type="password" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              />
            </div>
            <button type="button" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  )
}
