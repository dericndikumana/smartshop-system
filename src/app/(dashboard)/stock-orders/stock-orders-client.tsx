"use client"

import { useState } from "react"
import { processInternalOrder } from "@/app/actions/internal-orders"
import { Search, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
  currency: string
}

interface Order {
  id: string
  status: string
  createdAt: string
  requesterName: string
  totalAmount: number
  currency: string
  items: OrderItem[]
}

export function StockOrdersClient({ orders, userRole }: { orders: Order[], userRole: string }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredOrders = orders.filter(o => 
    o.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const handleProcessOrder = async (orderId: string, action: "ACCEPT" | "REJECT") => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this order?`)) return
    
    setIsLoading(true)
    const result = await processInternalOrder(orderId, action)
    if (result.success) {
      toast.success(`Order ${action.toLowerCase()}ed successfully`)
    } else {
      toast.error(result.error || "Failed to process order")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Orders</h1>
          <p className="text-muted-foreground mt-2">Manage internal purchases made by shop staff.</p>
        </div>
      </div>

      <div className="relative w-full max-w-sm mb-2">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by staff name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full pl-10 rounded-xl border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
        />
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-[17px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium w-12">#</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Staff Member</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {userRole === "STOCK_CASHIER" && (
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No stock orders found.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr key={order.id} className="border-b hover:bg-muted/20 text-[17px]">
                    <td className="px-4 py-3 text-muted-foreground font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-4 py-3 font-bold">{order.requesterName}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {order.items.map(item => (
                          <div key={item.id} className="text-sm">
                            <span className="font-medium">{item.quantity}x</span> {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {order.totalAmount.toLocaleString()} {order.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        order.status === "ACCEPTED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        order.status === "REJECTED" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                        "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    {userRole === "STOCK_CASHIER" && (
                      <td className="px-4 py-3 text-right">
                        {order.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleProcessOrder(order.id, "ACCEPT")}
                              disabled={isLoading}
                              className="p-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded text-xs font-bold px-2 flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleProcessOrder(order.id, "REJECT")}
                              disabled={isLoading}
                              className="p-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded text-xs font-bold px-2 flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
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
              Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-medium">{filteredOrders.length}</span> orders
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
  )
}
