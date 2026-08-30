"use client"

import { useState } from "react"
import { Package, Plus, Trash2, Search, AlertCircle } from "lucide-react"
import { createProductAction, deleteProductAction } from "@/app/actions/inventory"

const CURRENCIES = [
  "RWF", "USD", "EUR", "GBP", "ZAR", "KES", "UGX", "TZS", "NGN", "GHS", "ZIG"
]

interface Product {
  id: string
  name: string
  sellingPrice: number
  currency: string
  quantity: number
  minStock: number
}

// Helper to generate a consistent color block for initials based on string
const getInitialsColor = (name: string) => {
  const colors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", 
    "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", 
    "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", 
    "bg-pink-500", "bg-rose-500"
  ]
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export function InventoryClient({ products: initialProducts }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleCreateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createProductAction(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setIsModalOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsLoading(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    await deleteProductAction(id)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your shop&apos;s products, stock levels, and pricing.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Product Catalog
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock Level</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-sm ${getInitialsColor(product.name)}`}>
                          {product.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-base text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">ID: {product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">
                        {product.currency} {product.sellingPrice.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          product.quantity <= product.minStock
                            ? "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                        }`}>
                          {product.quantity} in stock
                        </span>
                        {product.quantity <= product.minStock && (
                          <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 text-red-600 hover:bg-red-500/10 rounded-md transition-colors inline-flex items-center justify-center"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <input required name="name" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Premium Coffee Beans" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <input required name="sellingPrice" type="number" step="0.01" min="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <select required name="currency" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Stock</label>
                  <input required name="quantity" type="number" min="0" defaultValue="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Low Stock Alert At</label>
                  <input required name="minStock" type="number" min="0" defaultValue="5" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
