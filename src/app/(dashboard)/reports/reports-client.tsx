"use client"

import { useState, useMemo } from "react"
import { Printer, Receipt } from "lucide-react"
import { useTranslation } from "@/components/providers/language-provider"

interface Transaction {
  id: string
  receiptNumber: string
  cashierId: string
  cashierName: string
  customerName: string
  date: string
  itemsSold: string
  totalsByCurrency: Record<string, number>
}

interface ReportsClientProps {
  transactions: Transaction[]
  cashiers: { id: string, name: string }[]
  userRole: string
}

export function ReportsClient({ transactions, cashiers, userRole }: ReportsClientProps) {
  const { t } = useTranslation()
  const [selectedCashier, setSelectedCashier] = useState<string>("ALL")
  const [customerSearch, setCustomerSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const printReport = () => {
    window.print()
  }

  // Filter transactions based on selected cashier, customer name, and date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Cashier filter
      if (selectedCashier !== "ALL" && t.cashierId !== selectedCashier) return false
      
      // Customer, Receipt, or Product search filter
      const searchLower = customerSearch.trim().toLowerCase()
      if (searchLower) {
        if (
          !t.customerName.toLowerCase().includes(searchLower) &&
          !t.receiptNumber.toLowerCase().includes(searchLower) &&
          !(t.itemsSold && t.itemsSold.toLowerCase().includes(searchLower))
        ) {
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

  const totalsByCurrency = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      Object.entries(tx.totalsByCurrency).forEach(([curr, total]) => {
        acc[curr] = (acc[curr] || 0) + total
      })
      return acc
    }, {} as Record<string, number>)
  }, [filteredTransactions])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports_page.sales_reports')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('reports_page.subtitle')}
          </p>
        </div>
        <button 
          onClick={printReport}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" />
          {t('sales_page.print')}
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
              {t('reports_page.transaction_details')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">{t('reports_page.search_customer')}</label>
                <input 
                  type="text" 
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder={t("reports_page.search_customer")}
                  className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">{t('reports_page.start_date')}</label>
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
                <label className="text-sm font-medium text-muted-foreground">{t('reports_page.end_date')}</label>
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
                  <label className="text-sm font-medium text-muted-foreground">{t('reports_page.filter_cashier')}</label>
                  <select 
                    value={selectedCashier}
                    onChange={(e) => {
                      setSelectedCashier(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                  >
                    <option value="ALL">{t('reports_page.all_cashiers')}</option>
                    {cashiers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden print:border-gray-300 print:shadow-none">
            
            {/* Desktop Table */}
            <table className="hidden md:table w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[17px] print:bg-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium w-12">#</th>
                  <th className="px-6 py-4 font-medium">{t('reports_page.receipt_no')}</th>
                  <th className="px-6 py-4 font-medium">{t('reports_page.customer_name')}</th>
                  <th className="px-6 py-4 font-medium">{t('reports_page.products_sold')}</th>
                  {userRole === "SHOP_ADMIN" && selectedCashier === "ALL" && (
                    <th className="px-6 py-4 font-medium">{t('sales_page.cashier')}</th>
                  )}
                  <th className="px-6 py-4 font-medium text-right">{t('reports_page.total_amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 print:divide-gray-200">
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      {t('reports_page.no_transactions')}
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx, index) => (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors text-[17px]">
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{tx.receiptNumber}</td>
                      <td className="px-6 py-4 text-foreground">{tx.customerName}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{tx.itemsSold}</td>
                      {userRole === "SHOP_ADMIN" && selectedCashier === "ALL" && (
                        <td className="px-6 py-4 text-muted-foreground">{tx.cashierName}</td>
                      )}
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        <div className="flex flex-col gap-1 items-end">
                          {Object.entries(tx.totalsByCurrency).map(([curr, total]) => (
                            <span key={curr}>{curr} {total.toLocaleString()}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-muted/10 font-bold border-t border-border/50">
                <tr>
                  <td colSpan={userRole === "SHOP_ADMIN" && selectedCashier === "ALL" ? 5 : 4} className="px-6 py-4 text-right">
                    {t('reports_page.total')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col gap-1 justify-end items-end">
                      {Object.entries(totalsByCurrency).length === 0 ? (
                        <span>0.00</span>
                      ) : (
                        Object.entries(totalsByCurrency).map(([currency, total]) => (
                          <span key={currency} className="text-primary">{currency} {total.toLocaleString()}</span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-border/50">
              {paginatedTransactions.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground">
                  {t('reports_page.no_transactions')}
                </div>
              ) : (
                paginatedTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex flex-col gap-2 bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-foreground text-sm">{tx.customerName}</p>
                        <p className="text-xs text-muted-foreground">{tx.receiptNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-sm">
                          {Object.entries(tx.totalsByCurrency).map(([curr, total]) => (
                            <span key={curr} className="block">{curr} {total.toLocaleString()}</span>
                          ))}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                      {tx.itemsSold}
                    </div>
                    {userRole === "SHOP_ADMIN" && selectedCashier === "ALL" && (
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>{t('sales_page.cashier')}:</span>
                        <span className="font-medium text-foreground">{tx.cashierName}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
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
