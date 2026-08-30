"use client"

import { useState } from "react"
import { Store, Trash2, ShieldAlert, CheckCircle, Search } from "lucide-react"
import { deleteShopAction, toggleShopStatusAction } from "@/app/actions/superadmin"

interface Shop {
  id: string
  name: string
  status: string
  adminName: string
  adminEmail: string
  productsCount: number
  salesCount: number
  createdAt: string
}

export function ShopsClient({ shops: initialShops }: { shops: Shop[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  async function handleDelete(shopId: string, shopName: string) {
    if (!confirm(`Are you absolutely sure you want to delete "${shopName}"? This will delete all products, sales, and users associated with this shop. THIS CANNOT BE UNDONE.`)) return
    
    await deleteShopAction(shopId)
  }

  async function handleToggleStatus(shopId: string, currentStatus: string) {
    if (!confirm(`Are you sure you want to ${currentStatus === "ACTIVE" ? "suspend" : "activate"} this shop?`)) return
    
    await toggleShopStatusAction(shopId, currentStatus)
  }

  const filteredShops = initialShops.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Shops</h1>
          <p className="text-muted-foreground mt-2">
            View, edit, or delete registered tenant shops.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Registered Shops
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search shops..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Shop Details</th>
                <th className="px-6 py-4 font-medium">Primary Admin</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No shops found matching your search.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-base">{shop.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">ID: {shop.id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{shop.adminName}</p>
                      <p className="text-muted-foreground text-xs">{shop.adminEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs"><span className="font-medium">{shop.productsCount}</span> Products</p>
                      <p className="text-xs text-muted-foreground mt-1"><span className="font-medium text-foreground">{shop.salesCount}</span> Sales</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        shop.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400" 
                          : "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400"
                      }`}>
                        {shop.status === "ACTIVE" ? <CheckCircle className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {shop.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(shop.id, shop.status)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                            shop.status === "ACTIVE" 
                              ? "text-orange-600 hover:bg-orange-500/10" 
                              : "text-emerald-600 hover:bg-emerald-500/10"
                          }`}
                        >
                          {shop.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(shop.id, shop.name)}
                          className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete Shop"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
  )
}
