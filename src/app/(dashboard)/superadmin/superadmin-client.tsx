"use client"

import { useState } from "react"
import { Plus, Store, ShieldAlert, CheckCircle } from "lucide-react"
import { createShopAction, toggleUserStatusAction } from "@/app/actions/superadmin"

interface SuperAdminClientProps {
  stats: { label: string; value: string }[]
  admins: {
    id: string
    name: string
    email: string
    shopName: string
    status: string
  }[]
  currentUserId: string
}

export function SuperAdminClient({ stats, admins, currentUserId }: SuperAdminClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateShop(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createShopAction(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setIsModalOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsLoading(false)
  }

  async function handleToggleStatus(userId: string, currentStatus: string) {
    if (userId === currentUserId) return
    if (!confirm(`Are you sure you want to ${currentStatus === "ACTIVE" ? "suspend" : "activate"} this user?`)) return
    
    await toggleUserStatusAction(userId, currentStatus)
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Global system overview and tenant management.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create New Shop
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-muted/10">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Registered Shop Admins
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Shop Assigned</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No shops created yet. Click &quot;Create New Shop&quot; to onboard your first tenant.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{admin.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {admin.shopName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        admin.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}>
                        {admin.status === "ACTIVE" ? <CheckCircle className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {admin.id !== currentUserId && (
                        <button
                          onClick={() => handleToggleStatus(admin.id, admin.status)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                            admin.status === "ACTIVE" 
                              ? "text-red-600 hover:bg-red-500/10" 
                              : "text-emerald-600 hover:bg-emerald-500/10"
                          }`}
                        >
                          {admin.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Create New Shop & Admin</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateShop} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shop Name</label>
                <input required name="shopName" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Downtown Coffee Co." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Full Name</label>
                <input required name="adminName" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <input required name="adminEmail" type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. john@downtowncoffee.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Password</label>
                <input required name="adminPassword" type="password" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Minimum 6 characters" />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
