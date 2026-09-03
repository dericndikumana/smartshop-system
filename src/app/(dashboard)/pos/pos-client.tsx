"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ShoppingCart, Minus, Plus, Trash2, CreditCard, User, Clock, X, Save } from "lucide-react"
import { checkoutAction } from "@/app/actions/pos"
import { holdCartAction, deleteHeldCartAction } from "@/app/actions/held-cart"
import { toast } from "sonner"
import { useTranslation } from "@/components/providers/language-provider"

interface Product {
  id: string
  name: string
  sellingPrice: number
  currency: string
  quantity: number
  sku?: string
}

interface Customer {
  id: string
  fullName: string
  balance?: number
}

interface CartItem extends Product {
  cartQuantity: number
}

interface HeldCart {
  id: string
  name: string
  createdAt: string
  items: {
    id: string
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    currency: string
  }[]
}

export function POSClient({ products, customers, vatRate, heldCarts = [], cashierName, shopName }: { products: Product[], customers: Customer[], vatRate: number, heldCarts?: HeldCart[], cashierName?: string, shopName?: string }) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [amountReceived, setAmountReceived] = useState("")
  
  // Customer states
  const [customerSearch, setCustomerSearch] = useState("")
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const customerDropdownRef = useRef<HTMLDivElement>(null)

  // Held Cart states
  const [showHeldCarts, setShowHeldCarts] = useState(false)
  const [isHolding, setIsHolding] = useState(false)

  // Quantity Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [manualQuantity, setManualQuantity] = useState("1")

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase()
    return p.name.toLowerCase().includes(term) || (p.sku && p.sku.toLowerCase().includes(term))
  })

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setManualQuantity("1")
  }

  const handleConfirmQuantity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    
    const qty = parseInt(manualQuantity, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error(t('pos_page.invalid_quantity'))
      return
    }
    
    if (qty > selectedProduct.quantity) {
      toast.error(t('pos_page.only_available').replace('{0}', selectedProduct.quantity.toString()))
      return
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === selectedProduct.id)
      if (existing) {
        const newTotal = existing.cartQuantity + qty
        if (newTotal > selectedProduct.quantity) {
          toast.error(t('pos_page.cannot_add').replace('{0}', qty.toString()).replace('{1}', (selectedProduct.quantity - existing.cartQuantity).toString()))
          return prev
        }
        return prev.map(item => 
          item.id === selectedProduct.id 
            ? { ...item, cartQuantity: newTotal }
            : item
        )
      }
      return [...prev, { ...selectedProduct, cartQuantity: qty }]
    })
    
    setSelectedProduct(null)
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.cartQuantity + delta
        if (newQ > item.quantity) return item // Can't exceed stock
        return { ...item, cartQuantity: newQ }
      }
      return item
    }).filter(item => item.cartQuantity > 0))
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  // Calculate totals grouped by currency
  const totalsByCurrency = cart.reduce((acc, item) => {
    const subtotal = item.sellingPrice * item.cartQuantity
    acc[item.currency] = (acc[item.currency] || 0) + subtotal
    return acc
  }, {} as Record<string, number>)

  const handleHoldCart = async () => {
    if (cart.length === 0) return
    setIsHolding(true)

    const payload = {
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.cartQuantity,
        unitPrice: item.sellingPrice,
        currency: item.currency
      })),
      customerName: customerSearch.trim() || undefined
    }

    const result = await holdCartAction(payload)
    if (result.error) {
      toast.error(result.error)
    } else {
      setCart([])
      setCustomerSearch("")
      toast.success(t('pos_page.order_held'))
    }
    
    setIsHolding(false)
  }

  const handleResumeCart = async (heldCart: HeldCart) => {
    // Attempt to map held items back into standard products
    const restoredCart: CartItem[] = []
    
    for (const hItem of heldCart.items) {
      const p = products.find(prod => prod.id === hItem.productId)
      if (p) {
        restoredCart.push({
          ...p,
          cartQuantity: hItem.quantity
        })
      }
    }

    if (restoredCart.length > 0) {
      setCart(restoredCart)
      
      // Try to extract customer name if exists in name string
      const match = heldCart.name.match(/^(.*?)\s*\(\d+ item/)
      if (match && match[1] && match[1] !== "Walk-in") {
        setCustomerSearch(match[1])
      }

      await deleteHeldCartAction(heldCart.id)
      setShowHeldCarts(false)
      toast.success(t('pos_page.order_resumed'))
    } else {
      toast.error(t('pos_page.resume_error'))
    }
  }

  const handleDirectCheckout = async (heldCart: HeldCart) => {
    setIsCheckingOut(true)

    // Attempt to extract customer name
    let custName = undefined
    const match = heldCart.name.match(/^(.*?)\s*\(\d+ item/)
    if (match && match[1] && match[1] !== "Walk-in") {
      custName = match[1]
    }

    const primaryCurr = heldCart.items.length > 0 ? heldCart.items[0].currency : "RWF"

    const payload = {
      items: heldCart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currency: item.currency
      })),
      vatRate,
      primaryCurrency: primaryCurr,
      customerName: custName
    }

    const result = await checkoutAction(payload)
    if (result.error) {
      toast.error(result.error)
    } else {
      await deleteHeldCartAction(heldCart.id)
      toast.success(t('pos_page.sale_completed'))
      if (heldCarts.length <= 1) setShowHeldCarts(false)
    }
    
    setIsCheckingOut(false)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setIsCheckingOut(true)

    const payload = {
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.cartQuantity,
        unitPrice: item.sellingPrice,
        currency: item.currency
      })),
      vatRate,
      primaryCurrency: Object.keys(totalsByCurrency)[0] || "RWF", // Use first currency as primary for the sale record
      customerName: customerSearch.trim() || undefined,
      amountReceived: amountReceived ? parseFloat(amountReceived) : undefined
    }

    const result = await checkoutAction(payload)
    if (result.error) {
      toast.error(result.error)
    } else {
      setCart([])
      setCustomerSearch("")
      setAmountReceived("")
      toast.success(t('pos_page.sale_completed'))
    }
    
    setIsCheckingOut(false)
  }

  // Colors for product blocks
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

  const selectedCustomerObj = customers.find(c => c.fullName.toLowerCase() === customerSearch.toLowerCase())
  const customerDebt = selectedCustomerObj?.balance || 0

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden min-h-[50vh]">
        
        {/* Mobile-style Header (Matches Design) */}
        <div className="flex flex-col items-center py-3 border-b bg-background/50">
          <h1 className="text-red-500 font-bold tracking-widest text-lg uppercase">{cashierName || "CASHIER"}</h1>
          <div className="flex items-center gap-1 text-sm font-bold mt-1">
            <span className="uppercase">{shopName || "SHOP"}</span>
            <span className="text-xs">▼</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            <span className="text-yellow-400 text-lg">★</span> Pick Default Account
          </div>
        </div>

        <div className="p-4 border-b bg-muted/10">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t('pos_page.search_products')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 rounded-md border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="flex flex-col items-start p-3 border rounded-xl hover:border-primary/50 hover:bg-muted/30 transition-all text-left group"
              >
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-white font-bold text-3xl shadow-sm mb-3 group-hover:scale-105 transition-transform ${getInitialsColor(product.name)}`}>
                  {product.name.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="font-medium leading-tight line-clamp-2">{product.name}</h3>
                <div className="mt-2 w-full flex items-center justify-between">
                  <p className="font-bold text-primary">{product.currency} {product.sellingPrice.toLocaleString()}</p>
                  <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-sm">
                    {product.quantity} left
                  </span>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                {t('pos_page.no_products')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden h-[500px] lg:h-auto shrink-0">
        <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {t('pos_page.current_order')}
          </h2>
          <div className="flex items-center gap-3">
            {heldCarts.length > 0 && (
              <button 
                onClick={() => setShowHeldCarts(true)}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <Clock className="h-3 w-3" />
                {heldCarts.length} {t('pos_page.waiting')}
              </button>
            )}
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              {cart.reduce((sum, item) => sum + item.cartQuantity, 0)} {t('pos_page.items')}
            </span>
          </div>
        </div>

        {/* Customer Selection */}
        <div className="p-4 border-b relative" ref={customerDropdownRef}>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t('pos_page.customer_optional')}
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value)
                setShowCustomerDropdown(true)
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              className="w-full pl-9 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>
          {showCustomerDropdown && customerSearch.length > 0 && (
            <div className="absolute z-10 w-[calc(100%-2rem)] mt-1 bg-card border rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCustomerSearch(c.fullName)
                      setShowCustomerDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    {c.fullName}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground italic">
                  {t('pos_page.create_customer')} &quot;{customerSearch}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <ShoppingCart className="h-12 w-12 mb-2" />
              <p>{t('pos_page.cart_empty')}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[10px] leading-tight">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.currency} {item.sellingPrice.toLocaleString()} {t('pos_page.each')}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-background border rounded-md px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-primary"><Minus className="h-3 w-3" /></button>
                    <span className="text-sm font-semibold w-6 text-center">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-primary"><Plus className="h-3 w-3" /></button>
                  </div>
                  <p className="font-bold">
                    {item.currency} {(item.sellingPrice * item.cartQuantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-muted/10">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('pos_page.subtotals')}</span>
              <div className="text-right flex flex-col">
                {Object.entries(totalsByCurrency).length === 0 ? <span>0.00</span> : (
                  Object.entries(totalsByCurrency).map(([currency, total]) => (
                    <span key={currency}>{currency} {total.toLocaleString()}</span>
                  ))
                )}
              </div>
            </div>
            
            {vatRate > 0 && Object.entries(totalsByCurrency).length > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground border-t border-border/50 pt-2">
                <span>{t('pos_page.vat_included').replace('{0}', vatRate.toString())}</span>
                <div className="text-right flex flex-col">
                  {Object.entries(totalsByCurrency).map(([currency, total]) => (
                    <span key={currency}>{currency} {(total - (total / (1 + vatRate / 100))).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>{t('pos_page.total')}</span>
              <div className="text-right flex flex-col">
                {Object.entries(totalsByCurrency).length === 0 ? <span>0.00</span> : (
                  Object.entries(totalsByCurrency).map(([currency, total]) => (
                    <span key={currency} className="text-primary">{currency} {total.toLocaleString()}</span>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4 p-2 border rounded-lg bg-background shadow-sm">
                <span className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-bold flex-shrink-0">
                  dettes {customerDebt.toLocaleString()}
                </span>
                <div className="flex-1 flex items-center justify-end relative">
                  <input
                    type="number"
                    placeholder="Ayo Yishyuye..."
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full text-right rounded-md border-none bg-transparent px-3 py-1.5 text-sm font-medium focus:outline-none placeholder:text-muted-foreground/60"
                  />
                  {!amountReceived && <span className="absolute right-3 text-orange-400/80 pointer-events-none">⚠️</span>}
                </div>
              </div>
              {amountReceived && Object.keys(totalsByCurrency).length > 0 && (
                <div className="text-right text-xs font-medium">
                  {(() => {
                    const diff = parseFloat(amountReceived) - Object.values(totalsByCurrency)[0]
                    if (diff > 0) return <span className="text-emerald-500">Change / Credit: {diff.toLocaleString()}</span>
                    if (diff < 0) return <span className="text-red-500">Remaining Debt: {Math.abs(diff).toLocaleString()}</span>
                    return <span className="text-muted-foreground">Exact Amount</span>
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleHoldCart}
              disabled={cart.length === 0 || isHolding || isCheckingOut}
              className="flex items-center justify-center gap-2 border border-border py-3 rounded-lg font-bold hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5 text-muted-foreground" />
              {t('pos_page.hold_order')}
            </button>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut || isHolding}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <CreditCard className="h-5 w-5" />
              {isCheckingOut ? t('pos_page.processing') : t('pos_page.complete_sale')}
            </button>
          </div>
        </div>
      </div>

      {/* Held Carts Modal */}
      {showHeldCarts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-xl rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t('pos_page.waiting_orders')}
              </h2>
              <button onClick={() => setShowHeldCarts(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {heldCarts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {t('pos_page.no_products')}
                </div>
              ) : (
                <div className="space-y-3">
                  {heldCarts.map(hc => (
                    <div key={hc.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-bold text-[10px]">{hc.name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(hc.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => deleteHeldCartAction(hc.id)}
                          disabled={isCheckingOut}
                          className="px-3 py-1.5 text-sm font-medium border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {t('pos_page.discard')}
                        </button>
                        <button 
                          onClick={() => handleResumeCart(hc)}
                          disabled={isCheckingOut}
                          className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                          {t('pos_page.resume')}
                        </button>
                        <button 
                          onClick={() => handleDirectCheckout(hc)}
                          disabled={isCheckingOut}
                          className="px-3 py-1.5 text-sm font-medium bg-emerald-500/10 text-emerald-600 rounded-md hover:bg-emerald-500/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          {t('pos_page.checkout')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quantity Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <h2 className="text-xl font-bold line-clamp-1">{selectedProduct.name}</h2>
              <button onClick={() => setSelectedProduct(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleConfirmQuantity} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  {t('pos_page.quantity_max').replace('{0}', selectedProduct.quantity.toString())}
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setManualQuantity(Math.max(1, parseInt(manualQuantity || "1") - 1).toString())} className="p-3 rounded-lg border hover:bg-muted transition-colors">
                    <Minus className="h-5 w-5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.quantity}
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(e.target.value)}
                    className="flex-1 rounded-lg border bg-background px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    autoFocus
                  />
                  <button type="button" onClick={() => setManualQuantity(Math.min(selectedProduct.quantity, parseInt(manualQuantity || "0") + 1).toString())} className="p-3 rounded-lg border hover:bg-muted transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm"
              >
                {t('pos_page.add_to_order')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
