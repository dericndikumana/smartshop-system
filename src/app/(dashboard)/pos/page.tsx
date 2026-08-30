import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShoppingCart, User, Plus, Search } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function POSPage() {
  const session = await auth()
  
  if (session?.user?.role === "SUPER_ADMIN") {
    redirect("/") // Super admins shouldn't ring up sales
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Left side: Product Catalog */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Scan barcode or search products..." 
            className="w-full h-12 pl-10 pr-4 rounded-xl border bg-card text-card-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
          {/* Mock Products */}
          {[
            { name: "House Blend 500g", price: 14.00, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500" },
            { name: "Oat Milk 1L", price: 7.00, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500" },
            { name: "Paper Filters", price: 5.50, color: "bg-stone-100 dark:bg-stone-900/30 text-stone-700 dark:text-stone-500" },
            { name: "Ceramic Pour-over", price: 22.00, color: "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-500" },
            { name: "Espresso Beans 1kg", price: 28.00, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500" },
            { name: "Almond Milk 1L", price: 6.50, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500" },
          ].map((item, i) => (
            <button key={i} className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all h-32">
              <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center ${item.color}`}>
                <PackageIcon />
              </div>
              <span className="font-medium text-sm text-center line-clamp-1">{item.name}</span>
              <span className="text-muted-foreground text-sm">${item.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right side: Receipt/Cart */}
      <div className="w-96 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
        
        {/* Customer Selector attached to receipt */}
        <div className="p-4 border-b bg-muted/30">
          <button className="w-full flex items-center justify-between p-2 rounded-md border border-dashed border-muted-foreground/50 hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Attach Customer</span>
            </div>
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-sm">House Blend 500g</p>
              <p className="text-xs text-muted-foreground">$14.00 × 1</p>
            </div>
            <p className="font-medium text-sm">$14.00</p>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-sm">Oat Milk 1L</p>
              <p className="text-xs text-muted-foreground">$7.00 × 2</p>
            </div>
            <p className="font-medium text-sm">$14.00</p>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-sm">Ceramic Pour-over</p>
              <p className="text-xs text-muted-foreground">$22.00 × 1</p>
            </div>
            <p className="font-medium text-sm">$22.00</p>
          </div>
        </div>

        {/* Totals & Checkout */}
        <div className="p-4 bg-muted/30 border-t space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>$50.00</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (8%)</span>
              <span>$4.00</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>Total</span>
              <span>$54.00</span>
            </div>
          </div>
          <button className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <ShoppingCart className="h-5 w-5" />
            Charge $54.00
          </button>
        </div>
      </div>
    </div>
  )
}

function PackageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  )
}
