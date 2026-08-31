"use client"

import { useState } from "react"
import { Receipt, Search, Printer, Calendar, User, Eye, X } from "lucide-react"

interface SaleItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
  currency: string
}

interface Sale {
  id: string
  receiptNumber: string
  createdAt: string
  cashierName: string
  customerName: string | null
  shopName: string
  items: SaleItem[]
  totalsByCurrency: Record<string, number>
  vatRate: number
  primaryCurrency: string
}

export function SalesClient({ sales: initialSales }: { sales: Sale[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredSales = initialSales.filter(s => 
    s.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const printReceipt = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales & Receipts</h1>
          <p className="text-muted-foreground mt-2">
            View transaction history and print receipts.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden print:hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Transaction History
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search receipt, cashier, customer..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Receipt No</th>
                <th className="px-6 py-4 font-medium">Customer Name</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Cashier</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    No sales found.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">
                      {sale.receiptNumber}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {sale.customerName ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {sale.customerName}
                        </div>
                      ) : (
                        <span className="italic opacity-50">Walk-in</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {sale.cashierName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex items-center justify-center"
                        title="View Receipt"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredSales.length)}</span> of <span className="font-medium">{filteredSales.length}</span> sales
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

      {/* Receipt Modal & Print Area */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4 print:p-0 print:bg-white print:static print:inset-auto">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:border-none print:w-full print:max-w-none print:h-auto print:max-h-none">
            <div className="flex items-center justify-between p-4 border-b bg-muted/10 print:hidden">
              <h2 className="font-bold text-lg">Receipt Details</h2>
              <div className="flex items-center gap-2">

                <button 
                  onClick={printReceipt} 
                  className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                  title="Print Receipt"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setSelectedSale(null)} 
                  className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div id="receipt-print-area" className="p-4 overflow-y-auto bg-white text-black font-mono text-sm print:overflow-visible mx-auto" style={{ width: '100%', maxWidth: '350px' }}>
              <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase">{selectedSale.shopName}</h1>
                <p className="mt-1 font-bold">
                  {selectedSale.vatRate > 0 ? "TAX INVOICE" : "INVOICE"}
                </p>
                {selectedSale.vatRate > 0 && (
                  <div className="flex justify-between text-xs mt-1">
                    <span>VAT {selectedSale.vatRate}%</span>
                  </div>
                )}
                {selectedSale.customerName && (
                  <p className="text-left mt-2">Customer Name : {selectedSale.customerName.toUpperCase()}</p>
                )}
              </div>

              <div className="border-t border-b border-black py-2 mb-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-1 font-normal w-1/2">Item</th>
                      <th className="pb-1 text-center font-normal">Qty</th>
                      <th className="pb-1 text-right font-normal">Price</th>
                      <th className="pb-1 text-right font-normal">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map(item => (
                      <tr key={item.id} className="align-top">
                        <td className="py-1 pr-1">{item.name}</td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">{item.unitPrice.toFixed(2)}</td>
                        <td className="py-1 text-right">{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="py-1 space-y-1 text-xs">
                {Object.entries(selectedSale.totalsByCurrency).map(([currency, total]) => {
                  const vatAmount = total * (selectedSale.vatRate / 100)
                  const grandTotal = total + vatAmount
                  
                  return (
                    <div key={currency} className="mb-2">
                      <div className="flex justify-end gap-4">
                        <span className="w-16 text-right">Nett</span>
                        <span className="w-20 text-right">{total.toFixed(2)}</span>
                      </div>
                      {selectedSale.vatRate > 0 && (
                        <div className="flex justify-end gap-4">
                          <span className="w-16 text-right">VAT INC</span>
                          <span className="w-20 text-right">{vatAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-black my-1 border-dashed"></div>
                      <div className="flex justify-between font-bold">
                        <span>{currency}</span>
                        <span>{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-black pt-2 mt-2 text-xs">
                <p>CASH SALE Invoice # : {selectedSale.receiptNumber}</p>
                <p>{selectedSale.items.length} Line Item(s)</p>
                <p>{selectedSale.items.reduce((sum, item) => sum + item.quantity, 0)} Item(s)</p>
                <p>Operator/Cashier : {selectedSale.cashierName.toUpperCase()}</p>
                <div className="flex gap-4">
                  <p>Server Date : {new Date(selectedSale.createdAt).toLocaleDateString('en-GB')}</p>
                  <p>Time : {new Date(selectedSale.createdAt).toLocaleTimeString('en-GB', { hour12: false })}</p>
                </div>
              </div>

              <div className="text-center mt-6 text-xs">
                <p>& O E</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
