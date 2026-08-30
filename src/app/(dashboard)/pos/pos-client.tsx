"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ShoppingCart, Minus, Plus, Trash2, CreditCard, User, Clock, X, Save } from "lucide-react"
import { checkoutAction } from "@/app/actions/pos"
import { holdCartAction, deleteHeldCartAction } from "@/app/actions/held-cart"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  sellingPrice: number
  currency: string
  quantity: number
}

interface Customer {
  id: string
  fullName: string
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

export function POSClient({ products, customers, vatRate, heldCarts = [] }: { products: Product[], customers: Customer[], vatRate: number, heldCarts?: HeldCart[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  
  // Customer states
  const [customerSearch, setCustomerSearch] = useState("")
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const customerDropdownRef = useRef<HTMLDivElement>(null)

  // Held Cart states
  const [showHeldCarts, setShowHeldCarts] = useState(false)
  const [isHolding, setIsHolding] = useState(false)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        if (existing.cartQuantity >= product.quantity) return prev // Can't add more than stock
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, cartQuantity: 1 }]
    })
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
      toast.success("Order placed on hold.")
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
      toast.success("Order resumed successfully.")
    } else {
      toast.error("Could not resume order: products may no longer be available.")
    }
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
      customerName: customerSearch.trim() || undefined
    }

    const result = await checkoutAction(payload)
    if (result.error) {
      toast.error(result.error)
    } else {
      setCart([])
      setCustomerSearch("")
      toast.success(`Sale completed successfully! Receipt generated.`)
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden min-h-[50vh]">
        <div className="p-4 border-b bg-muted/10">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products..." 
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
                onClick={() => addToCart(product)}
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
                No products found.
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
            Current Order
          </h2>
          <div className="flex items-center gap-3">
            {heldCarts.length > 0 && (
              <button 
                onClick={() => setShowHeldCarts(true)}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <Clock className="h-3 w-3" />
                {heldCarts.length} Waiting
              </button>
            )}
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              {cart.reduce((sum, item) => sum + item.cartQuantity, 0)} items
            </span>
          </div>
        </div>

        {/* Customer Selection */}
        <div className="p-4 border-b relative" ref={customerDropdownRef}>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Customer Name (Optional)" 
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
                  Create new customer &quot;{customerSearch}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <ShoppingCart className="h-12 w-12 mb-2" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm leading-tight">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.currency} {item.sellingPrice.toLocaleString()} each</p>
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
              <span>Subtotals</span>
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
                <span>VAT ({vatRate}%)</span>
                <div className="text-right flex flex-col">
                  {Object.entries(totalsByCurrency).map(([currency, total]) => (
                    <span key={currency}>{currency} {(total * (vatRate / 100)).toLocaleString()}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>Total</span>
              <div className="text-right flex flex-col">
                {Object.entries(totalsByCurrency).length === 0 ? <span>0.00</span> : (
                  Object.entries(totalsByCurrency).map(([currency, total]) => (
                    <span key={currency} className="text-primary">{currency} {(total + (total * (vatRate / 100))).toLocaleString()}</span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleHoldCart}
              disabled={cart.length === 0 || isHolding || isCheckingOut}
              className="flex items-center justify-center gap-2 border border-border py-3 rounded-lg font-bold hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5 text-muted-foreground" />
              Hold Order
            </button>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut || isHolding}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <CreditCard className="h-5 w-5" />
              {isCheckingOut ? "Processing..." : "Complete Sale"}
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
                Waiting Orders
              </h2>
              <button onClick={() => setShowHeldCarts(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {heldCarts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No waiting orders found.
                </div>
              ) : (
                <div className="space-y-3">
                  {heldCarts.map(hc => (
                    <div key={hc.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-bold">{hc.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(hc.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => deleteHeldCartAction(hc.id)}
                          className="px-3 py-1.5 text-sm font-medium border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Discard
                        </button>
                        <button 
                          onClick={() => handleResumeCart(hc)}
                          className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                        >
                          Resume
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
    </div>
  )
}
