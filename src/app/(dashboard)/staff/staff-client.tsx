"use client"

import { useState } from "react"
import { toggleCashierStatusAction, deleteCashierAction } from "@/app/actions/staff"
import { CheckCircle, ShieldAlert, Trash2 } from "lucide-react"

interface Cashier {
  id: string
  name: string
  email: string
  status: string
}

export function StaffClient({ cashiers }: { cashiers: Cashier[] }) {
  const [isLoading, setIsLoading] = useState(false)

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
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
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
  )
}
