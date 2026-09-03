"use client"

import { useState } from "react"
import { Search, CreditCard } from "lucide-react"

interface CustomerDebt {
  id: string
  fullName: string
  phone: string | null
  balance: number
}

export function DettesClient({ initialCustomers }: { initialCustomers: CustomerDebt[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = initialCustomers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 rounded-md border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" 
        />
      </div>

      <div className="grid gap-4 mt-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
            No customers with debts/credits found.
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-card border shadow-sm gap-4">
              <div>
                <h3 className="font-bold text-lg">{customer.fullName}</h3>
                <p className="text-sm text-muted-foreground">{customer.phone || "No phone number"}</p>
              </div>
              <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                <div className="text-right">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {customer.balance > 0 ? "Owes You (Debt)" : "Credit (You Owe)"}
                  </p>
                  <p className={`font-bold text-xl ${customer.balance > 0 ? "text-red-500" : "text-emerald-500"}`}>
                    {Math.abs(customer.balance).toLocaleString()} RWF
                  </p>
                </div>
                {/* Note: Payment action will be implemented in a future update. For now, it just displays. */}
                <button className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-lg transition-colors">
                  <CreditCard className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
