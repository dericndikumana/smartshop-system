"use client"

import { Receipt, DollarSign, Package, Users, Activity, TrendingUp } from "lucide-react"

interface ShopAdminDashboardProps {
  stats: {
    totalProducts: number
    totalCustomers: number
    todaySalesTotal: number
    todaySalesCount: number
  }
  recentSales: {
    id: string
    receiptNumber: string
    totalAmount: number
    currency: string
    createdAt: Date
    cashierName: string
    items: number
  }[]
  cashierSales: {
    cashierName: string
    salesTotal: number
    salesCount: number
    currency: string
  }[]
}

export function ShopAdminDashboard({ stats, recentSales, cashierSales }: ShopAdminDashboardProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shop Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your shop&apos;s performance, inventory, and staff activity.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Today&apos;s Revenue</h3>
          </div>
          <p className="text-2xl font-bold">{stats.todaySalesTotal.toLocaleString()}</p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Today&apos;s Sales</h3>
          </div>
          <p className="text-2xl font-bold">{stats.todaySalesCount}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Total Products</h3>
          </div>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Registered Customers</h3>
          </div>
          <p className="text-2xl font-bold">{stats.totalCustomers}</p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cashier Performance */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/10">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Cashier Performance (Today)
            </h2>
          </div>
          <div className="p-0 overflow-x-auto">
            {cashierSales.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No sales recorded today.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Cashier Name</th>
                    <th className="px-6 py-4 font-medium">Sales Count</th>
                    <th className="px-6 py-4 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {cashierSales.map((cashier, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                          {cashier.cashierName.charAt(0)}
                        </div>
                        {cashier.cashierName}
                      </td>
                      <td className="px-6 py-4">{cashier.salesCount}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">
                        {cashier.currency} {cashier.salesTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/10">
            <h2 className="font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Transactions
            </h2>
          </div>
          <div className="p-0 overflow-x-auto">
            {recentSales.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No recent transactions.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Receipt</th>
                    <th className="px-6 py-4 font-medium">Time / Cashier</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{sale.receiptNumber}</td>
                      <td className="px-6 py-4">
                        <div>{new Date(sale.createdAt).toLocaleTimeString()}</div>
                        <div className="text-xs text-muted-foreground">{sale.cashierName}</div>
                      </td>
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
    </div>
  )
}
