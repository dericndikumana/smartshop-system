"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ShoppingCart, Minus, Plus, Trash2, CreditCard, User, Clock, X, Save } from "lucide-react"
import { checkoutAction } from "@/app/actions/pos"
import { holdCartAction, deleteHeldCartAction } from "@/app/actions/held-cart"
import { toast } from "sonner"
import { useTranslation } from "@/components/providers/language-provider"
import { useLoader } from "@/components/providers/loader-provider"

interface Product {
  id: string
  name: string
  sellingPrice: number
  currency: string
  quantity: number
  sku?: string
  piecesPerBundle?: number
}

interface Customer {
  id: string
  fullName: string
  balance?: number
  phone?: string | null
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
  const { showLoader } = useLoader()
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [amountReceived, setAmountReceived] = useState("")
  
  // Customer states
  const [customerSearch, setCustomerSearch] = useState("")
  const [customerSearchText, setCustomerSearchText] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerCountryCode, setCustomerCountryCode] = useState("+250")
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const desktopDropdownRef = useRef<HTMLDivElement>(null)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)

  // Held Cart states
  const [showHeldCarts, setShowHeldCarts] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const [showDebtConfirm, setShowDebtConfirm] = useState(false)
  const [hasAutoFilled, setHasAutoFilled] = useState(false)

  // Quantity Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [manualQuantity, setManualQuantity] = useState("1")

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase()
    return p.name.toLowerCase().includes(term) || (p.sku && p.sku.toLowerCase().includes(term))
  })



  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const isOutsideDesktop = !desktopDropdownRef.current || !desktopDropdownRef.current.contains(target)
      const isOutsideMobile = !mobileDropdownRef.current || !mobileDropdownRef.current.contains(target)
      
      if (isOutsideDesktop && isOutsideMobile) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (cashierName && !hasAutoFilled) {
      setCustomerSearch(cashierName)
      setHasAutoFilled(true)
    }
  }, [cashierName, hasAutoFilled])

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

  const proceedCheckout = async () => {
    setIsCheckingOut(true)
    setShowDebtConfirm(false)

    showLoader(5000)
    await new Promise(resolve => setTimeout(resolve, 5000))

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
      customerPhone: customerPhone.trim() ? `${customerCountryCode}${customerPhone.trim()}` : undefined,
      amountReceived: amountReceived ? parseFloat(amountReceived) : undefined
    }

    const result = await checkoutAction(payload)
    if (result.error) {
      toast.error(result.error)
    } else {
      setCart([])
      // Don't reset customer search since it's prefilled with cashier name
      setCustomerPhone("")
      setAmountReceived("")
      toast.success(t('pos_page.sale_completed'))
    }
    
    setIsCheckingOut(false)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    
    if (amountReceived === "" || amountReceived === undefined) {
      toast.error("Please enter the amount paid (Ayo Yishyuye). If they paid nothing, enter 0.")
      return
    }

    const rawTotal = Object.values(totalsByCurrency).reduce((a, b) => a + b, 0)
    const amt = parseFloat(amountReceived)
    const diff = rawTotal - amt

    if (diff !== 0) {
      if (!customerSearch.trim()) {
        toast.error("Please enter a customer name for debt/loan tracking.")
        return
      }
      setShowDebtConfirm(true)
      return
    }

    proceedCheckout()
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

  const selectedCustomerObj = customers.find(c => c.fullName.toLowerCase() === customerSearch.trim().toLowerCase())
  const customerDebt = selectedCustomerObj?.balance || 0
  
  const rawTotal = Object.values(totalsByCurrency).reduce((a, b) => a + b, 0)
  const amt = amountReceived ? parseFloat(amountReceived) : rawTotal
  const newBalance = customerDebt + (rawTotal - amt)

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* ==================================================== */}
      {/* DESKTOP VIEW (Hidden on Mobile)                      */}
      {/* ==================================================== */}
      <div className="hidden lg:flex flex-1 flex-col bg-card rounded-xl border shadow-sm overflow-hidden min-h-[50vh]">
        <div className="flex flex-col items-center py-3 border-b bg-background/50">
          <h1 className="text-red-500 font-bold tracking-widest text-lg uppercase">{cashierName || "CASHIER"}</h1>
          <div className="flex items-center gap-1 text-sm font-bold mt-1">
            <span className="uppercase">{shopName || "SHOP"}</span>
            <span className="text-xs">▼</span>
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
        
        <div className="flex-1 overflow-y-auto p-4 block">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-card border rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all text-left w-full hover:border-primary/50"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 ${getInitialsColor(product.name)}`}>
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

      <div className="hidden lg:flex w-96 flex-col bg-card rounded-xl border shadow-sm h-[500px] shrink-0">
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

        {/* Customer Selection Desktop */}
        <div className="p-4 border-b relative flex flex-col items-center" ref={desktopDropdownRef}>
          <button
            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
            className="flex items-center justify-center gap-2 text-primary font-bold w-full hover:bg-muted/30 py-2 rounded-md transition-colors"
          >
            <User className="h-5 w-5 text-orange-500" />
            <span className="text-blue-600 dark:text-blue-400">{customerSearch || cashierName || "Walk-in"}</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500 rounded-sm px-1 py-0.5">NEW</span>
          </button>
          
          <div className="w-full max-w-[150px] border-b border-dashed border-muted-foreground/30 mt-1"></div>

          {showCustomerDropdown && (
            <div className="absolute top-full z-10 w-[calc(100%-2rem)] mt-1 bg-card border rounded-md shadow-lg p-2">
              <input 
                type="text" 
                placeholder="Search by name or phone..."
                value={customerSearchText}
                onChange={(e) => setCustomerSearchText(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2" 
              />
              
              <div className="overflow-y-auto max-h-48 flex flex-col gap-1">
                {customers.filter(c => c.fullName.toLowerCase().includes(customerSearchText.toLowerCase()) || (c.phone && c.phone.includes(customerSearchText))).length > 0 ? (
                  customers.filter(c => c.fullName.toLowerCase().includes(customerSearchText.toLowerCase()) || (c.phone && c.phone.includes(customerSearchText))).map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCustomerSearch(c.fullName)
                        if (c.phone) setCustomerPhone("") 
                        setShowCustomerDropdown(false)
                        setCustomerSearchText("")
                      }}
                      className="w-full bg-card border rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:bg-muted/50 transition-all text-left mt-2 first:mt-0"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0 ${getInitialsColor(c.fullName)}`}>
                          {c.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-bold text-foreground text-sm truncate">{c.fullName}</h3>
                          <p className="text-xs text-muted-foreground truncate">{c.phone || "No phone"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 opacity-80 shrink-0">
                        <Save className="h-4 w-4 text-orange-500" />
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-2 border rounded-md bg-muted/10 mt-1">
                    <div className="text-sm font-medium mb-2 text-primary">New Customer</div>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text"
                        placeholder="Full Name"
                        value={customerSearchText}
                        onChange={(e) => setCustomerSearchText(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <select 
                          value={customerCountryCode}
                          onChange={(e) => setCustomerCountryCode(e.target.value)}
                          className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-24"
                        >
                          <option value="+213">+213 (Algeria)</option>
                          <option value="+244">+244 (Angola)</option>
                          <option value="+229">+229 (Benin)</option>
                          <option value="+267">+267 (Botswana)</option>
                          <option value="+226">+226 (Burkina Faso)</option>
                          <option value="+257">+257 (Burundi)</option>
                          <option value="+237">+237 (Cameroon)</option>
                          <option value="+238">+238 (Cape Verde)</option>
                          <option value="+236">+236 (Central African Republic)</option>
                          <option value="+235">+235 (Chad)</option>
                          <option value="+269">+269 (Comoros)</option>
                          <option value="+242">+242 (Congo)</option>
                          <option value="+243">+243 (DR Congo)</option>
                          <option value="+253">+253 (Djibouti)</option>
                          <option value="+20">+20 (Egypt)</option>
                          <option value="+240">+240 (Equatorial Guinea)</option>
                          <option value="+291">+291 (Eritrea)</option>
                          <option value="+268">+268 (Eswatini)</option>
                          <option value="+251">+251 (Ethiopia)</option>
                          <option value="+241">+241 (Gabon)</option>
                          <option value="+220">+220 (Gambia)</option>
                          <option value="+233">+233 (Ghana)</option>
                          <option value="+224">+224 (Guinea)</option>
                          <option value="+245">+245 (Guinea-Bissau)</option>
                          <option value="+225">+225 (Ivory Coast)</option>
                          <option value="+254">+254 (Kenya)</option>
                          <option value="+266">+266 (Lesotho)</option>
                          <option value="+231">+231 (Liberia)</option>
                          <option value="+218">+218 (Libya)</option>
                          <option value="+261">+261 (Madagascar)</option>
                          <option value="+265">+265 (Malawi)</option>
                          <option value="+223">+223 (Mali)</option>
                          <option value="+222">+222 (Mauritania)</option>
                          <option value="+230">+230 (Mauritius)</option>
                          <option value="+212">+212 (Morocco)</option>
                          <option value="+258">+258 (Mozambique)</option>
                          <option value="+264">+264 (Namibia)</option>
                          <option value="+227">+227 (Niger)</option>
                          <option value="+234">+234 (Nigeria)</option>
                          <option value="+250">+250 (Rwanda)</option>
                          <option value="+239">+239 (Sao Tome)</option>
                          <option value="+221">+221 (Senegal)</option>
                          <option value="+248">+248 (Seychelles)</option>
                          <option value="+232">+232 (Sierra Leone)</option>
                          <option value="+252">+252 (Somalia)</option>
                          <option value="+27">+27 (South Africa)</option>
                          <option value="+211">+211 (South Sudan)</option>
                          <option value="+249">+249 (Sudan)</option>
                          <option value="+255">+255 (Tanzania)</option>
                          <option value="+228">+228 (Togo)</option>
                          <option value="+216">+216 (Tunisia)</option>
                          <option value="+256">+256 (Uganda)</option>
                          <option value="+260">+260 (Zambia)</option>
                          <option value="+263">+263 (Zimbabwe)</option>
                        </select>
                        <input 
                          type="tel"
                          placeholder="Phone number"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          setCustomerSearch(customerSearchText)
                          setShowCustomerDropdown(false)
                        }}
                        className="mt-2 w-full bg-primary/10 text-primary py-1.5 rounded-md text-sm font-bold hover:bg-primary/20 transition-colors"
                      >
                        Confirm Info
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                    <p className="font-bold text-sm text-blue-800 dark:text-blue-300 uppercase leading-tight">
                      {item.sku || item.name}(<span className="text-blue-600 dark:text-blue-400 underline">{item.piecesPerBundle || 1}</span> Pcs)1X <span className="text-blue-600 dark:text-blue-400 underline">{item.sellingPrice}</span>
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      Qty:{item.cartQuantity} X {item.sellingPrice}={(item.cartQuantity * item.sellingPrice).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Name:<span className="underline uppercase">{item.sku || item.name}</span>
                    </p>
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
                    min="0"
                    step="any"
                    placeholder="Ayo Yishyuye..."
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full text-right rounded-md border-none bg-transparent px-3 py-1.5 text-sm font-medium focus:outline-none placeholder:text-muted-foreground/60"
                  />
                  {!amountReceived && <span className="absolute right-3 text-orange-400/80 pointer-events-none">⚠️</span>}
                </div>
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

      {/* ==================================================== */}
      {/* MOBILE VIEW (Hidden on Desktop)                      */}
      {/* ==================================================== */}
      <div className="flex flex-col lg:hidden w-full h-full bg-background rounded-xl overflow-y-auto pb-24 shadow-sm border relative">
        
        {/* Mobile Header */}
        <div className="flex flex-col items-center py-2 border-b bg-background/50">
          <h1 className="text-red-500 font-bold tracking-widest text-lg uppercase">{cashierName || "GASORE"}</h1>
          <div className="flex items-center gap-1 text-sm font-bold mt-1">
            <span className="uppercase">{shopName || "GASORELTD"}</span>
            <span className="text-xs">▼</span>
          </div>
          {heldCarts.length > 0 && (
            <button 
              onClick={() => setShowHeldCarts(true)}
              className="flex items-center gap-2 mt-2 text-sm font-bold text-primary bg-primary/10 px-4 py-1 rounded-full hover:bg-primary/20 transition-colors"
            >
              <Clock className="h-4 w-4" /> {heldCarts.length} waiting
            </button>
          )}
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 py-3 border-b flex flex-col relative z-20 bg-background">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold whitespace-nowrap text-muted-foreground uppercase">Search By</span>
            <div className="flex-1 flex items-center border border-gray-300 rounded-full px-3 py-1 bg-white shadow-sm">
              <select className="bg-transparent text-sm font-bold focus:outline-none py-1 mr-2 appearance-none">
                <option>Code</option>
              </select>
              <span className="text-xs text-muted-foreground">▼</span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-3 text-sm focus:outline-none" 
              />
              <div className="w-5 h-5 rounded-full bg-gray-700 text-white flex items-center justify-center">
                <Search className="h-3 w-3" />
              </div>
            </div>
          </div>
          
          {/* Mobile Search Popup (Absolute) */}
          {searchTerm && (
            <div className="absolute top-full left-0 right-0 bg-white border shadow-xl max-h-[50vh] overflow-y-auto z-30">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => {
                    handleProductClick(product)
                    setSearchTerm("")
                  }}
                  className="flex items-center justify-between p-3 border-b hover:bg-muted/30 cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300 uppercase">
                      {product.sku || product.name}(<span className="text-blue-600 dark:text-blue-400 underline">{product.piecesPerBundle || 1}</span> Pcs)1X <span className="text-blue-600 dark:text-blue-400 underline">{product.sellingPrice}</span>
                    </h4>
                    <span className="text-xs text-muted-foreground font-medium">{product.quantity} in stock</span>
                  </div>
                  <span className="font-bold text-primary">{product.currency} {product.sellingPrice.toLocaleString()}</span>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">No products found</div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Customer Selection */}
        <div className="py-4 border-b flex flex-col items-center relative" ref={mobileDropdownRef}>
          <button 
            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
            className="flex items-center gap-4 text-primary font-bold hover:opacity-80 transition-opacity"
          >
            <User className="h-5 w-5 text-orange-500" />
            <span className="text-blue-600 dark:text-blue-400">{customerSearch || cashierName || "Walk-in"}</span>
            <span className="w-5 h-5 border border-emerald-500 bg-emerald-500/10 text-emerald-500 rounded-sm flex items-center justify-center text-[10px]">NEW</span>
          </button>
          
          <div className="w-32 border-b border-dashed border-muted-foreground/30 mt-2 text-center text-sm font-medium text-foreground pb-1">
            {customerSearch || cashierName || "Walk-in"}
          </div>

          {showCustomerDropdown && (
            <div className="absolute top-full z-30 w-72 bg-card border rounded-md shadow-xl p-2 mt-1 left-1/2 -translate-x-1/2">
              <input 
                type="text" 
                placeholder="Search by name or phone..."
                value={customerSearchText}
                onChange={e => setCustomerSearchText(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
              />
              
              <div className="overflow-y-auto max-h-48 flex flex-col gap-1">
                {customers.filter(c => c.fullName.toLowerCase().includes(customerSearchText.toLowerCase()) || (c.phone && c.phone.includes(customerSearchText))).length > 0 ? (
                  customers.filter(c => c.fullName.toLowerCase().includes(customerSearchText.toLowerCase()) || (c.phone && c.phone.includes(customerSearchText))).map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCustomerSearch(c.fullName)
                        if (c.phone) setCustomerPhone("") 
                        setShowCustomerDropdown(false)
                        setCustomerSearchText("")
                      }}
                      className="w-full bg-card border rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:bg-muted/50 transition-all text-left mt-2 first:mt-0"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0 ${getInitialsColor(c.fullName)}`}>
                          {c.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-bold text-foreground text-sm truncate">{c.fullName}</h3>
                          <p className="text-xs text-muted-foreground truncate">{c.phone || "No phone"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 opacity-80 shrink-0">
                        <Save className="h-4 w-4 text-orange-500" />
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-2 border rounded-md bg-muted/10 mt-1">
                    <div className="text-sm font-medium mb-2 text-primary">New Customer</div>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text"
                        placeholder="Full Name"
                        value={customerSearchText}
                        onChange={(e) => setCustomerSearchText(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <select 
                          value={customerCountryCode}
                          onChange={(e) => setCustomerCountryCode(e.target.value)}
                          className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-24"
                        >
                          <option value="+213">+213 (Algeria)</option>
                          <option value="+244">+244 (Angola)</option>
                          <option value="+229">+229 (Benin)</option>
                          <option value="+267">+267 (Botswana)</option>
                          <option value="+226">+226 (Burkina Faso)</option>
                          <option value="+257">+257 (Burundi)</option>
                          <option value="+237">+237 (Cameroon)</option>
                          <option value="+238">+238 (Cape Verde)</option>
                          <option value="+236">+236 (Central African Republic)</option>
                          <option value="+235">+235 (Chad)</option>
                          <option value="+269">+269 (Comoros)</option>
                          <option value="+242">+242 (Congo)</option>
                          <option value="+243">+243 (DR Congo)</option>
                          <option value="+253">+253 (Djibouti)</option>
                          <option value="+20">+20 (Egypt)</option>
                          <option value="+240">+240 (Equatorial Guinea)</option>
                          <option value="+291">+291 (Eritrea)</option>
                          <option value="+268">+268 (Eswatini)</option>
                          <option value="+251">+251 (Ethiopia)</option>
                          <option value="+241">+241 (Gabon)</option>
                          <option value="+220">+220 (Gambia)</option>
                          <option value="+233">+233 (Ghana)</option>
                          <option value="+224">+224 (Guinea)</option>
                          <option value="+245">+245 (Guinea-Bissau)</option>
                          <option value="+225">+225 (Ivory Coast)</option>
                          <option value="+254">+254 (Kenya)</option>
                          <option value="+266">+266 (Lesotho)</option>
                          <option value="+231">+231 (Liberia)</option>
                          <option value="+218">+218 (Libya)</option>
                          <option value="+261">+261 (Madagascar)</option>
                          <option value="+265">+265 (Malawi)</option>
                          <option value="+223">+223 (Mali)</option>
                          <option value="+222">+222 (Mauritania)</option>
                          <option value="+230">+230 (Mauritius)</option>
                          <option value="+212">+212 (Morocco)</option>
                          <option value="+258">+258 (Mozambique)</option>
                          <option value="+264">+264 (Namibia)</option>
                          <option value="+227">+227 (Niger)</option>
                          <option value="+234">+234 (Nigeria)</option>
                          <option value="+250">+250 (Rwanda)</option>
                          <option value="+239">+239 (Sao Tome)</option>
                          <option value="+221">+221 (Senegal)</option>
                          <option value="+248">+248 (Seychelles)</option>
                          <option value="+232">+232 (Sierra Leone)</option>
                          <option value="+252">+252 (Somalia)</option>
                          <option value="+27">+27 (South Africa)</option>
                          <option value="+211">+211 (South Sudan)</option>
                          <option value="+249">+249 (Sudan)</option>
                          <option value="+255">+255 (Tanzania)</option>
                          <option value="+228">+228 (Togo)</option>
                          <option value="+216">+216 (Tunisia)</option>
                          <option value="+256">+256 (Uganda)</option>
                          <option value="+260">+260 (Zambia)</option>
                          <option value="+263">+263 (Zimbabwe)</option>
                        </select>
                        <input 
                          type="tel"
                          placeholder="Phone number"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          setCustomerSearch(customerSearchText)
                          setShowCustomerDropdown(false)
                        }}
                        className="mt-2 w-full bg-primary/10 text-primary py-1.5 rounded-md text-sm font-bold hover:bg-primary/20 transition-colors"
                      >
                        Confirm Info
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Cart Items (Compact) */}
        {cart.length > 0 && (
          <div className="p-2 border-b bg-muted/5 flex flex-col gap-1 max-h-40 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{item.cartQuantity}x</span>
                  <span className="truncate w-32 uppercase text-blue-800 dark:text-blue-300">
                    {item.sku || item.name}(<span className="text-blue-600 dark:text-blue-400 underline">{item.piecesPerBundle || 1}</span> Pcs)1X <span className="text-blue-600 dark:text-blue-400 underline">{item.sellingPrice}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{item.currency} {(item.sellingPrice * item.cartQuantity).toLocaleString()}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500"><Trash2 className="h-3 w-3"/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Total */}
        <div className="py-2 flex items-center justify-center gap-2 font-bold text-lg">
          <span>Total:</span>
          {Object.entries(totalsByCurrency).length === 0 ? <span>0</span> : (
            Object.entries(totalsByCurrency).map(([currency, total]) => (
              <span key={currency}>{total.toLocaleString()}</span>
            ))
          )}
          <span className="text-blue-500 ml-2">{"<"}</span>
        </div>

        {/* Mobile Payment Input */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-2 p-1 border rounded-lg bg-white shadow-sm border-gray-300">
            <span className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-bold flex-shrink-0">
              dettes {customerDebt.toLocaleString()}
            </span>
            <div className="flex-1 flex items-center justify-end relative">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Ayo Yishyuye..."
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="w-full text-left rounded-md border-none bg-transparent px-2 py-2 text-sm font-medium focus:outline-none"
              />
              {!amountReceived && <span className="absolute right-2 text-orange-400 text-lg pointer-events-none">⚠️</span>}
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="px-4 pt-4 pb-2 flex gap-3 mt-auto">
          <button
            onClick={handleHoldCart}
            disabled={cart.length === 0 || isHolding || isCheckingOut}
            className="flex-1 bg-muted py-2 rounded-lg font-bold text-sm disabled:opacity-50"
          >
            Hold
          </button>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isCheckingOut || isHolding}
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-bold text-sm shadow-sm disabled:opacity-50"
          >
            Complete
          </button>
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

      {/* Debt/Loan Confirmation Modal */}
      {showDebtConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Confirm Debt/Loan</h2>
            <div className="mb-6 space-y-2 text-sm">
              <p>Customer: <span className="font-bold">{customerSearch.trim()}</span></p>
              <p>Total Due: <span className="font-bold text-foreground">{rawTotal.toLocaleString()} RWF</span></p>
              <p>Amount Received: <span className="font-bold text-foreground">{amt.toLocaleString()} RWF</span></p>
              {customerDebt !== 0 && (
                <p>Previous Balance: <span className="font-bold text-muted-foreground">{customerDebt.toLocaleString()} RWF</span></p>
              )}
              <div className="p-3 mt-4 rounded-lg bg-muted/50 border">
                {newBalance > 0 ? (
                  <p className="text-red-500 font-bold">New Debt Balance: {newBalance.toLocaleString()} RWF</p>
                ) : newBalance < 0 ? (
                  <p className="text-emerald-500 font-bold">New Loan Balance: {Math.abs(newBalance).toLocaleString()} RWF (You owe them)</p>
                ) : (
                  <p className="text-emerald-500 font-bold">Debt is cleared! Balance: 0 RWF</p>
                )}
              </div>
              <p className="text-muted-foreground pt-2">Do you want to proceed and save this transaction?</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDebtConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-muted font-medium text-sm transition-colors"
                disabled={isCheckingOut}
              >
                Cancel
              </button>
              <button 
                onClick={proceedCheckout}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
