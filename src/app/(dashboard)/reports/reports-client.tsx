"use client"

import { BarChart3, TrendingUp, Calendar, User, Printer } from "lucide-react"

interface ReportsClientProps {
  metrics: {
    daily: Record<string, number>
    weekly: Record<string, number>
    monthly: Record<string, number>
    annual: Record<string, number>
  }
  cashierStats: {
    name: string
    totalSales: number
    revenueByCurrency: Record<string, number>
  }[]
}

export function ReportsClient({ metrics, cashierStats }: ReportsClientProps) {
  
  const printReport = () => {
    window.print()
  }

  const formatCurrencyObj = (obj: Record<string, number>) => {
    if (Object.keys(obj).length === 0) return <span className="text-muted-foreground opacity-50">No data</span>
    return (
      <div className="flex flex-col gap-1">
        {Object.entries(obj).map(([currency, amount]) => (
          <span key={currency} className="font-semibold text-lg">{currency} {amount.toLocaleString()}</span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Reports</h1>
          <p className="text-muted-foreground mt-2">
            Overview of revenue metrics and staff performance.
          </p>
        </div>
        <button 
          onClick={printReport}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" />
          Print Report
        </button>
      </div>

      <div id="print-area" className="flex flex-col gap-8 print:bg-white print:text-black print:p-8">
        
        {/* Print Header (Hidden on screen) */}
        <div className="hidden print:block text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">Business Summary Report</h1>
          <p className="text-gray-500">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Revenue Metrics */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <TrendingUp className="h-5 w-5 text-primary print:text-black" />
            Revenue Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 print:border-gray-300 print:shadow-none">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                <h3 className="font-medium">Today&apos;s Revenue</h3>
              </div>
              {formatCurrencyObj(metrics.daily)}
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 print:border-gray-300 print:shadow-none">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                <h3 className="font-medium">This Week</h3>
              </div>
              {formatCurrencyObj(metrics.weekly)}
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 print:border-gray-300 print:shadow-none bg-primary/5 print:bg-transparent border-primary/20">
              <div className="flex items-center gap-2 text-primary print:text-black font-semibold mb-4">
                <BarChart3 className="h-4 w-4" />
                <h3>This Month</h3>
              </div>
              <div className="text-primary print:text-black">
                {formatCurrencyObj(metrics.monthly)}
              </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 print:border-gray-300 print:shadow-none">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                <h3 className="font-medium">This Year</h3>
              </div>
              {formatCurrencyObj(metrics.annual)}
            </div>

          </div>
        </div>

        {/* Cashier Performance */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <User className="h-5 w-5 text-primary print:text-black" />
            Cashier Performance Tracking
          </h2>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden print:border-gray-300 print:shadow-none">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs print:bg-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Cashier Name</th>
                  <th className="px-6 py-4 font-medium">Total Transactions</th>
                  <th className="px-6 py-4 font-medium text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 print:divide-gray-200">
                {cashierStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                      No sales data available.
                    </td>
                  </tr>
                ) : (
                  cashierStats.map((stat, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-base">{stat.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{stat.totalSales} receipts</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col gap-1 items-end">
                          {Object.keys(stat.revenueByCurrency).length === 0 ? (
                            <span className="text-muted-foreground">0.00</span>
                          ) : (
                            Object.entries(stat.revenueByCurrency).map(([currency, amount]) => (
                              <span key={currency} className="font-semibold">{currency} {amount.toLocaleString()}</span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  )
}
