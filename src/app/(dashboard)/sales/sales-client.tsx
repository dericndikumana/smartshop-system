"use client"

import { useState } from "react"
import { Receipt, Search, Printer, Calendar, User, Eye, X, MessageCircle } from "lucide-react"
import { useTranslation } from "@/components/providers/language-provider"

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
  shopPhone: string | null
  items: SaleItem[]
  totalsByCurrency: Record<string, number>
  vatRate: number
  primaryCurrency: string
}

export function SalesClient({ sales: initialSales }: { sales: Sale[] }) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
          <h1 className="text-3xl font-bold tracking-tight">{t('sales_page.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('sales_page.subtitle')}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden print:hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            {t('sales_page.title')}
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t('sales_page.search_receipt')} 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-3 p-4">
          {paginatedSales.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
              {t('sales_page.no_sales')}
            </div>
          ) : (
            paginatedSales.map((sale) => (
              <div key={sale.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 bg-emerald-600`}>
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{sale.receiptNumber}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      Name: <span className="font-medium underline underline-offset-2">{sale.customerName || t('sales_page.walk_in')}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(sale.createdAt).toLocaleDateString()}
                      <User className="h-3 w-3 ml-2" />
                      {sale.cashierName}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center gap-2">
                  <span className="font-bold text-primary">{sale.primaryCurrency} {(sale.totalsByCurrency[sale.primaryCurrency] || 0).toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `*Receipt: ${sale.receiptNumber}*\n` +
                        `Shop: ${sale.shopName}\n` +
                        (sale.shopPhone ? `Phone: ${sale.shopPhone}\n` : '') +
                        `Date: ${new Date(sale.createdAt).toLocaleString()}\n` +
                        `Cashier: ${sale.cashierName}\n` +
                        `Customer: ${sale.customerName || 'Walk-in'}\n\n` +
                        `*Items:*\n${sale.items.map(i => `- ${i.name} (x${i.quantity}): ${i.currency} ${(i.subtotal + i.subtotal * sale.vatRate / 100).toLocaleString()}`).join('\n')}\n\n` +
                        `*Totals:*\n` +
                        Object.entries(sale.totalsByCurrency).map(([curr, total]) => `${curr} ${total.toLocaleString()}`).join('\n')
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                      title="Send via WhatsApp"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      title="View Receipt"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
              <h2 className="font-bold text-lg">{t('sales_page.receipt_details')}</h2>
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
                {selectedSale.shopPhone && <p>Tel: {selectedSale.shopPhone}</p>}
              </div>

              <div className="border-t border-black border-dashed pt-2 mt-2 mb-2">
                <p>Receipt #: <span className="font-bold">{selectedSale.receiptNumber}</span></p>
                <p>Date: {new Date(selectedSale.createdAt).toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')}</p>
                {selectedSale.customerName && <p>Customer: {selectedSale.customerName.toUpperCase()}</p>}
                <p>Cashier: {selectedSale.cashierName.toUpperCase()}</p>
              </div>

              <div className="border-t border-b border-black border-dashed py-2 mb-2">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-left font-bold">
                      <th className="pb-1 w-1/2">Item</th>
                      <th className="pb-1 text-center">Total Packs</th>
                      <th className="pb-1 text-right">P</th>
                      <th className="pb-1 text-right">Sub</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map(item => (
                      <tr key={item.id} className="align-top">
                        <td className="py-1 pr-1">{item.name.toUpperCase()}</td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">{item.unitPrice.toFixed(0)}/{item.currency}</td>
                        <td className="py-1 text-right">{item.subtotal.toFixed(0)}/{item.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="py-1 space-y-1 text-[10px]">
                {Object.entries(selectedSale.totalsByCurrency).map(([currency, total]) => {
                  const rate = selectedSale.vatRate;
                  let netTotal = total;
                  let vatAmount = 0;
                  
                  if (rate > 0) {
                    netTotal = total / (1 + rate / 100);
                    vatAmount = total - netTotal;
                  }
                  
                  return (
                    <div key={currency} className="mb-2">
                      {rate > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span>Net Total ({currency})</span>
                            <span>{netTotal.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>VAT {rate}% ({currency})</span>
                            <span>{vatAmount.toFixed(0)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between font-bold">
                        <span>TOTAL ({currency})</span>
                        <span>{total.toFixed(0)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-black border-dashed pt-2 mt-2 text-center text-[10px]">
                <p>Thank you for shopping with us!</p>
                <p>{new Date().toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')}</p>
                <p>Powered by {selectedSale.shopName}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
