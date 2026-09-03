"use client"

import { useState } from "react"
import { Search, HandCoins } from "lucide-react"

interface CustomerLoan {
  id: string
  fullName: string
  phone: string | null
  balance: number
}

export function LoansClient({ initialCustomers }: { initialCustomers: CustomerLoan[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = initialCustomers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  )

  return (
    <div className="flex flex-col gap-4 animate-in fade-in pb-32">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 rounded-xl border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
        />
      </div>

      <div className="grid gap-4 mt-2">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
            No customers with loans found.
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-card border shadow-sm gap-4 hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-lg">{customer.fullName}</h3>
                <p className="text-sm text-muted-foreground">{customer.phone || "No phone number"}</p>
              </div>
              <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                <div className="text-right">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Credit (You Owe)
                  </p>
                  <p className="font-bold text-xl text-emerald-500">
                    {Math.abs(customer.balance).toLocaleString()} RWF
                  </p>
                </div>
                <button 
                  className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                  title="Refund functionality coming soon"
                >
                  <HandCoins className="h-5 w-5" />
                  Refund
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
