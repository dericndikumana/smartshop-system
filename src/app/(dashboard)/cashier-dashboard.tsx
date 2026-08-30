"use client"

import { Receipt, DollarSign, Clock } from "lucide-react"

interface CashierDashboardProps {
  salesTotal: number
  salesCount: number
  recentSales: {
    id: string
    receiptNumber: string
    totalAmount: number
    currency: string
    createdAt: Date
    items: number
  }[]
}

export function CashierDashboard({ salesTotal, salesCount, recentSales }: CashierDashboardProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cashier Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your performance and recent transactions for today.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Your Sales Today</h3>
          </div>
          <p className="text-2xl font-bold">{salesTotal.toLocaleString()}</p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Transactions</h3>
          </div>
          <p className="text-2xl font-bold">{salesCount}</p>
        </div>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/10">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Your Recent Transactions
          </h2>
        </div>
        <div className="p-0 overflow-x-auto">
          {recentSales.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No transactions yet today. Head over to the POS to make a sale!
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Receipt</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{sale.receiptNumber}</td>
                    <td className="px-6 py-4">{new Date(sale.createdAt).toLocaleTimeString()}</td>
                    <td className="px-6 py-4">{sale.items}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      {sale.currency} {sale.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
