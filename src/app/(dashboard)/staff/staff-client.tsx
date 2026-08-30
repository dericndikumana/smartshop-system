"use client"

import { useState } from "react"
import { toggleCashierStatusAction, deleteCashierAction, createCashierAction } from "@/app/actions/staff"
import { CheckCircle, ShieldAlert, Trash2, Plus } from "lucide-react"

interface Cashier {
  id: string
  name: string
  email: string
  status: string
}

export function StaffClient({ cashiers }: { cashiers: Cashier[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateCashier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createCashierAction(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setIsModalOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsLoading(false)
  }

  async function handleToggleStatus(userId: string, currentStatus: string) {
    if (!confirm(`Are you sure you want to ${currentStatus === "ACTIVE" ? "suspend" : "activate"} this cashier?`)) return
    
    setIsLoading(true)
    await toggleCashierStatusAction(userId, currentStatus)
    setIsLoading(false)
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this cashier? This action cannot be undone.")) return
    
    setIsLoading(true)
    await deleteCashierAction(userId)
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Cashier
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cashiers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No cashiers found.
                  </td>
                </tr>
              ) : (
                cashiers.map((cashier) => (
                  <tr key={cashier.id} className="border-b hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{cashier.name}</td>
                    <td className="px-4 py-3">{cashier.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        cashier.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}>
                        {cashier.status === "ACTIVE" ? <CheckCircle className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {cashier.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleToggleStatus(cashier.id, cashier.status)}
                        disabled={isLoading}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors mr-2 ${
                          cashier.status === "ACTIVE" 
                            ? "text-orange-600 hover:bg-orange-500/10" 
                            : "text-emerald-600 hover:bg-emerald-500/10"
                        } disabled:opacity-50`}
                      >
                        {cashier.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                      <button 
                        onClick={() => handleDelete(cashier.id)}
                        disabled={isLoading}
                        className="text-xs font-medium px-3 py-1.5 rounded-md text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
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
            <h2 className="text-xl font-bold mb-4">Add New Cashier</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateCashier} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cashier Name</label>
                <input required name="name" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Jane Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input required name="email" type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. jane@shop.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input required name="password" type="password" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Minimum 6 characters" />
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
                  {isLoading ? "Saving..." : "Add Cashier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
