"use client"

import { Receipt, DollarSign, Package } from "lucide-react"

interface CashierDashboardProps {
  salesCount: number
  totalItemsSold: number
  revenueByCurrency: Record<string, number>
}

export function CashierDashboard({ salesCount, totalItemsSold, revenueByCurrency }: CashierDashboardProps) {
  const hasSales = salesCount > 0
  const currencies = Object.entries(revenueByCurrency)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cashier Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your overall performance.
        </p>
      </div>
      
      {hasSales ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Receipt className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-sm">Total Transactions</h3>
            </div>
            <p className="text-2xl font-bold">{salesCount}</p>
          </div>
          
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-sm">Items Sold</h3>
            </div>
            <p className="text-2xl font-bold">{totalItemsSold}</p>
          </div>

          {currencies.map(([currency, total]) => (
            <div key={currency} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-sm">Revenue ({currency})</h3>
              </div>
              <p className="text-2xl font-bold text-primary">{total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-12 text-center text-muted-foreground">
          No sales registered yet. Head over to the POS to start selling!
        </div>
      )}
    </div>
  )
}
