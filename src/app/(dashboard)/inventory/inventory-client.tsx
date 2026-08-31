"use client"

import { useState } from "react"
import { Package, Plus, Trash2, Search, AlertCircle, ArrowUp, Edit } from "lucide-react"
import { createProductAction, deleteProductAction, addStockAction, editProductAction } from "@/app/actions/inventory"
import { toast } from "sonner"

const CURRENCIES = [
  "RWF", "KES", "UGX", "TZS", "BIF", "CDF", "NGN", "GHS", "ZAR", "EGP", 
  "MAD", "DZD", "XOF", "XAF", "ZMW", "ZIG", "MWK", "MZN", "AOA", "BWP",
  "NAD", "SZL", "LSL", "SDG", "SSP", "ETB", "SOS", "DJF", "ERN", "MUR",
  "MGA", "SCR", "KMF", "CVE", "STN", "SLL", "LRD", "GNF", "GMD", "MRU",
  "USD", "EUR", "GBP"
]

interface Product {
  id: string
  name: string
  buyingPrice?: number | null
  sellingPrice: number
  currency: string
  quantity: number
  piecesPerBundle?: number
  minStock: number
}

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

export function InventoryClient({ products: initialProducts, userRole }: { products: Product[], userRole?: string }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"new" | "existing" | "edit">("new")
  const [isLoading, setIsLoading] = useState(false)

  // For existing stock add
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantityToAdd, setQuantityToAdd] = useState(1)
  
  // For editing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  async function handleCreateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await createProductAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Product created successfully!")
      setIsModalOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsLoading(false)
  }

  async function handleEditProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingProduct) return
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await editProductAction(editingProduct.id, formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Product updated successfully!")
      setIsModalOpen(false)
    }
    
    setIsLoading(false)
  }

  async function handleAddStock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedProductId) {
      toast.error("Please select a product")
      return
    }
    if (quantityToAdd <= 0) {
      toast.error("Quantity must be greater than zero")
      return
    }

    setIsLoading(true)
    
    const result = await addStockAction(selectedProductId, quantityToAdd)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Stock added successfully!")
      setIsModalOpen(false)
      setSelectedProductId("")
      setQuantityToAdd(1)
    }
    
    setIsLoading(false)
  }

  async function handleDelete(id: string) {
    setIsLoading(true)
    const result = await deleteProductAction(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Product deleted successfully")
    }
    setIsLoading(false)
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
        {userRole !== "CASHIER" && (
          <button 
            onClick={() => {
              setActiveTab("new")
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add / Update Stock
          </button>
        )}
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
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Pieces / Bundle</th>
                <th className="px-6 py-4 font-medium">Bundles & Amount</th>
                <th className="px-6 py-4 font-medium">Total Pieces</th>
                {userRole !== "CASHIER" && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={userRole !== "CASHIER" ? 4 : 3} className="px-6 py-12 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
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
                      <div className="flex flex-col gap-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Price/Bundle:</span> {product.buyingPrice ? `${product.currency} ${product.buyingPrice.toLocaleString()}` : "-"}
                        </p>
                        <p className="font-semibold text-foreground">
                          <span className="text-muted-foreground font-normal">Sell:</span> {product.currency} {product.sellingPrice > 0 ? product.sellingPrice.toLocaleString() : "Not Set"}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {product.piecesPerBundle || 1} pieces / bundle
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-semibold border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400`}>
                          {product.quantity} Bundles
                        </span>
                        {product.buyingPrice && product.quantity > 0 && (
                          <p className="text-xs font-medium text-muted-foreground mt-1">
                            Amount: {product.currency} {(product.buyingPrice * product.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">
                        {(product.quantity * (product.piecesPerBundle || 1)).toLocaleString()} pieces
                      </p>
                    </td>
                    {userRole !== "CASHIER" && (
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveTab("edit")
                            setEditingProduct(product)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex items-center justify-center"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("existing")
                            setSelectedProductId(product.id)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex items-center justify-center"
                          title="Add Stock"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:bg-red-500/10 rounded-md transition-colors inline-flex items-center justify-center"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
              Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> products
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

      {isModalOpen && userRole !== "CASHIER" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex border-b">
              {activeTab === "edit" ? (
                <button className="flex-1 py-3 text-sm font-medium bg-muted/50 border-b-2 border-primary text-primary">
                  Edit Product
                </button>
              ) : (
                <>
                  <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === "new" ? "bg-muted/50 border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/30"}`}
                    onClick={() => setActiveTab("new")}
                  >
                    Create New Product
                  </button>
                  <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === "existing" ? "bg-muted/50 border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/30"}`}
                    onClick={() => setActiveTab("existing")}
                  >
                    Add Stock to Existing
                  </button>
                </>
              )}
            </div>
            
            <div className="p-6">
              {activeTab === "new" ? (
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <input required name="name" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Premium Coffee Beans" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SKU (Optional)</label>
                    <input name="sku" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Put SKU or leave empty (no matter)" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price Per Bundle</label>
                      <input name="buyingPrice" type="number" step="0.01" min="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Selling Price</label>
                      <input name="sellingPrice" type="number" step="0.01" min="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
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
                      <label className="text-sm font-medium">Nbr of Bundles</label>
                      <input required name="quantity" type="number" min="0" defaultValue="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pieces Per Bundle</label>
                      <input required name="piecesPerBundle" type="number" min="1" defaultValue="1" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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
                      {isLoading ? "Saving..." : "Create Product"}
                    </button>
                  </div>
                </form>
              ) : activeTab === "edit" && editingProduct ? (
                <form onSubmit={handleEditProduct} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <input required name="name" type="text" defaultValue={editingProduct.name} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SKU (Optional)</label>
                    <input name="sku" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Put SKU or leave empty (no matter)" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price Per Bundle</label>
                      <input name="buyingPrice" type="number" step="0.01" min="0" defaultValue={editingProduct.buyingPrice || ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Selling Price</label>
                      <input name="sellingPrice" type="number" step="0.01" min="0" defaultValue={editingProduct.sellingPrice} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Currency</label>
                      <select required name="currency" defaultValue={editingProduct.currency} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        {CURRENCIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nbr of Bundles</label>
                      <input required name="quantity" type="number" min="0" defaultValue={editingProduct.quantity} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pieces Per Bundle</label>
                      <input required name="piecesPerBundle" type="number" min="1" defaultValue={editingProduct.piecesPerBundle || 1} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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
                      {isLoading ? "Saving..." : "Update Product"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddStock} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Product</label>
                    <select 
                      required 
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>Select an existing product...</option>
                      {initialProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.quantity} in stock)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity to Add</label>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 0)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
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
                      disabled={isLoading || !selectedProductId}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : "Add Stock"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

