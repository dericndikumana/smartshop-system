"use client"

import { useState, useMemo } from "react"
import { Printer, Receipt } from "lucide-react"

interface Transaction {
  id: string
  receiptNumber: string
  cashierId: string
  cashierName: string
  customerName: string
  date: string
  itemsSold: string
  totalAmount: number
  currency: string
}

interface ReportsClientProps {
  transactions: Transaction[]
  cashiers: { id: string, name: string }[]
  userRole: string
}

export function ReportsClient({ transactions, cashiers, userRole }: ReportsClientProps) {
  const [selectedCashier, setSelectedCashier] = useState<string>("ALL")
  const [customerSearch, setCustomerSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const printReport = () => {
    window.print()
  }

  // Filter transactions based on selected cashier, customer name, and date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Cashier filter
      if (selectedCashier !== "ALL" && t.cashierId !== selectedCashier) return false
      
      // Customer search filter
      if (customerSearch.trim() && !t.customerName.toLowerCase().includes(customerSearch.toLowerCase())) {
        if (!t.receiptNumber.toLowerCase().includes(customerSearch.toLowerCase())) {
          return false
        }
      }

      // Date range filter
      if (startDate || endDate) {
        const txDate = new Date(t.date)
        txDate.setHours(0, 0, 0, 0)
        
        if (startDate) {
          const start = new Date(startDate)
          start.setHours(0, 0, 0, 0)
          if (txDate < start) return false
        }
        
        if (endDate) {
          const end = new Date(endDate)
          end.setHours(0, 0, 0, 0)
          if (txDate > end) return false
        }
      }

      return true
    })
  }, [transactions, selectedCashier, customerSearch, startDate, endDate])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
          <p className="text-muted-foreground mt-2">
            Detailed transaction records and staff performance.
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
          <h1 className="text-2xl font-bold">Sales Report</h1>
          <p className="text-gray-500">Generated on {new Date().toLocaleString()}</p>
          {selectedCashier !== "ALL" && (
            <p className="text-gray-500 font-medium mt-1">
              Filter: Cashier - {cashiers.find(c => c.id === selectedCashier)?.name}
            </p>
          )}
        </div>

        <div>
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
              <Receipt className="h-5 w-5 text-primary print:text-black" />
              Transaction Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Search Customer/Receipt</label>
                <input 
                  type="text" 
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Name or receipt..."
                  className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
              </div>

              {userRole === "SHOP_ADMIN" && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted-foreground">Filter by Cashier</label>
                  <select 
                    value={selectedCashier}
                    onChange={(e) => {
                      setSelectedCashier(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                  >
                    <option value="ALL">All Cashiers</option>
                    {cashiers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden print:border-gray-300 print:shadow-none">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs print:bg-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Receipt #</th>
                  <th className="px-6 py-4 font-medium">Customer Name</th>
                  {userRole === "SHOP_ADMIN" && selectedCashier === "ALL" && (
                    <th className="px-6 py-4 font-medium">Cashier</th>
                  )}
                  <th className="px-6 py-4 font-medium text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 print:divide-gray-200">
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No transactions found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{tx.receiptNumber}</td>
                      <td className="px-6 py-4 text-foreground">{tx.customerName}</td>
                      {userRole === "SHOP_ADMIN" && selectedCashier === "ALL" && (
                        <td className="px-6 py-4 text-muted-foreground">{tx.cashierName}</td>
                      )}
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        {tx.currency} {tx.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/10 print:hidden">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="font-medium">{filteredTransactions.length}</span> transactions
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-xs rounded-md border bg-background hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-xs rounded-md border bg-background hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}
