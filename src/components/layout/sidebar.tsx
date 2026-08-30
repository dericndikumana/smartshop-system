"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Users, FileText, Settings, LogOut, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  
  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "POS", href: "/pos", icon: ShoppingCart },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Sales & Receipts", href: "/sales", icon: Receipt },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="w-64 border-r h-screen bg-card flex flex-col hidden md:flex">
      <div className="p-6 border-b flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-primary">SmartShop</h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">System v1.0</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
