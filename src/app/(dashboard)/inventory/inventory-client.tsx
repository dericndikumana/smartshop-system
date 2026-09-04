"use client"

import { useState } from "react"
import { Search, Plus, Package, Save, Send, Trash2 } from "lucide-react"
import { createProductAction, deleteProductAction, addStockAction, editProductAction } from "@/app/actions/inventory"
import { toast } from "sonner"
import { useTranslation } from "@/components/providers/language-provider"

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
  sku?: string | null
  buyingPrice?: number | null
  sellingPrice: number
  currency: string
  quantity: number
  minStock: number
  piecesPerBundle?: number | null
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
  const { t } = useTranslation()
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
  const itemsPerPage = 6

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  async function handleCreateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    // Remove piecesPerBundle, default to 1 on backend or handle it properly there
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
          <h1 className="text-3xl font-bold tracking-tight">{t("inventory_page.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("inventory_page.subtitle")}
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
            {t("inventory_page.add_stock")}
          </button>
        )}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {t("inventory_page.catalog")}
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t("inventory_page.search")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex flex-col md:hidden gap-3 p-4">
          {paginatedProducts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              {t("inventory_page.no_products")}
            </div>
          ) : (
            paginatedProducts.map((product) => (
              <div key={product.id} className="bg-card border-b py-4 px-2 flex items-start justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`h-10 w-10 mt-1 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 ${getInitialsColor(product.name)}`}>
                    {product.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-blue-800 dark:text-blue-300 truncate uppercase">
                      {product.name}(<span className="text-blue-600 dark:text-blue-400 underline">{product.piecesPerBundle || 1}</span> Pcs)1X <span className="text-blue-600 dark:text-blue-400 underline">{product.sellingPrice}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mt-1 font-medium">
                      Qty:{product.quantity} X {product.sellingPrice}={(product.quantity * product.sellingPrice).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-1 font-medium">
                      Name:<span className="underline uppercase">{product.sku || product.name}</span>
                    </p>
                  </div>
                </div>
                {userRole !== "CASHIER" && (
                  <div className="flex flex-col items-end justify-start gap-4 h-full pt-1 pr-2">
                    <button
                      onClick={() => {
                        setActiveTab("existing")
                        setSelectedProductId(product.id)
                        setIsModalOpen(true)
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                      title="Add Stock / Send"
                    >
                      <Send className="h-6 w-6" />
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete Product"
                      >
                        <Trash2 className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("edit")
                          setEditingProduct(product)
                          setIsModalOpen(true)
                        }}
                        className="text-orange-500 hover:opacity-80 transition-opacity"
                        title="Edit Product / Save"
                      >
                        <Save className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b text-[17px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium w-12">#</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Details</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium text-right">Value</th>
                {userRole !== "CASHIER" && (
                  <th className="px-4 py-3 font-medium text-right w-32">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={userRole !== "CASHIER" ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground border-b">
                    {t("inventory_page.no_products")}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product, index) => (
                  <tr key={product.id} className="border-b hover:bg-muted/20 text-[17px]">
                    <td className="px-4 py-2 text-muted-foreground font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold uppercase text-blue-800 dark:text-blue-300">{product.name}</span>
                        <span className="text-muted-foreground uppercase">{product.sku || product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-0.5 font-medium text-muted-foreground">
                        <span>Pack: <span className="text-blue-600 dark:text-blue-400 underline">{product.piecesPerBundle || 1}</span> Pcs</span>
                        <span>Price: <span className="text-blue-600 dark:text-blue-400 underline">{product.sellingPrice} {product.currency}</span></span>
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {product.quantity}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-muted-foreground">
                      {(product.quantity * product.sellingPrice).toLocaleString()} {product.currency}
                    </td>
                    {userRole !== "CASHIER" && (
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveTab("existing")
                              setSelectedProductId(product.id)
                              setIsModalOpen(true)
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Add Stock"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("edit")
                              setEditingProduct(product)
                              setIsModalOpen(true)
                            }}
                            className="p-1.5 text-orange-500 hover:bg-orange-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={isLoading}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
                  {t("inventory_page.edit_product")}
                </button>
              ) : (
                <>
                  <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === "new" ? "bg-muted/50 border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/30"}`}
                    onClick={() => setActiveTab("new")}
                  >
                    {t("inventory_page.create_new")}
                  </button>
                  <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === "existing" ? "bg-muted/50 border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/30"}`}
                    onClick={() => setActiveTab("existing")}
                  >
                    {t("inventory_page.add_stock_modal")}
                  </button>
                </>
              )}
            </div>
            
            <div className="p-6">
              {activeTab === "new" ? (
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.product_name")}</label>
                      <input required name="name" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Premium Coffee Beans" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.sku")}</label>
                      <input name="sku" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="SKU" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.items_number")}</label>
                      <input required name="quantity" type="number" min="0" defaultValue="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">PCS (Pieces)</label>
                      <input required name="piecesPerBundle" type="number" min="1" defaultValue="1" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.col_buying_price")}</label>
                      <input name="buyingPrice" type="number" step="0.01" min="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.col_selling_price")}</label>
                      <input name="sellingPrice" type="number" step="0.01" min="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.currency")}</label>
                      <select required name="currency" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        {CURRENCIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-8">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                    >
                      {t("inventory_page.cancel")}
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : t("inventory_page.save")}
                    </button>
                  </div>
                </form>
              ) : activeTab === "edit" && editingProduct ? (
                <form onSubmit={handleEditProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.product_name")}</label>
                      <input required name="name" type="text" defaultValue={editingProduct.name} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.sku")}</label>
                      <input name="sku" type="text" defaultValue={editingProduct.sku || ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="SKU" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.items_number")}</label>
                      <input required name="quantity" type="number" min="0" defaultValue={editingProduct.quantity} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">PCS (Pieces)</label>
                      <input required name="piecesPerBundle" type="number" min="1" defaultValue={editingProduct.piecesPerBundle || 1} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.col_buying_price")}</label>
                      <input name="buyingPrice" type="number" step="0.01" min="0" defaultValue={editingProduct.buyingPrice || ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.col_selling_price")}</label>
                      <input name="sellingPrice" type="number" step="0.01" min="0" defaultValue={editingProduct.sellingPrice} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("inventory_page.currency")}</label>
                      <select required name="currency" defaultValue={editingProduct.currency} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        {CURRENCIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-8">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                    >
                      {t("inventory_page.cancel")}
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : t("inventory_page.save")}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddStock} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("inventory_page.select_product")}</label>
                    <select 
                      required 
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>Select an existing product...</option>
                      {initialProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.piecesPerBundle && p.piecesPerBundle > 1 ? `(${p.piecesPerBundle}pcs)` : ""} ({p.quantity} in stock)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("inventory_page.items_number")}</label>
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
                      {t("inventory_page.cancel")}
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading || !selectedProductId}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : t("inventory_page.add_stock")}
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
