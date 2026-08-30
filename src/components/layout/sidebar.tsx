"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Users, FileText, Settings, LogOut, Receipt, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

interface SidebarProps {
  role: string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  
  // Define navigation based on Role
  let navItems: { name: string; href: string; icon: React.ElementType }[] = []

  if (role === "SUPER_ADMIN") {
    navItems = [
      { name: "System Overview", href: "/superadmin", icon: LayoutDashboard },
      { name: "Manage Shops", href: "/superadmin/shops", icon: Store },
      { name: "System Settings", href: "/settings", icon: Settings },
    ]
  } else if (role === "SHOP_ADMIN") {
    navItems = [
      { name: "Shop Dashboard", href: "/", icon: LayoutDashboard },
      { name: "POS Terminal", href: "/pos", icon: ShoppingCart },
      { name: "Inventory", href: "/inventory", icon: Package },
      { name: "Sales & Receipts", href: "/sales", icon: Receipt },
      { name: "Manage Cashiers", href: "/staff", icon: Users },
      { name: "Reports", href: "/reports", icon: FileText },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  } else if (role === "CASHIER") {
    navItems = [
      { name: "POS Terminal", href: "/pos", icon: ShoppingCart },
      { name: "My Receipts", href: "/sales", icon: Receipt },
      { name: "My Settings", href: "/settings", icon: Settings },
    ]
  }

  return (
    <div className="w-64 border-r h-screen bg-card flex flex-col hidden md:flex">
      <div className="p-6 border-b flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-primary">shopCore</h1>
          <p className="text-[10px] text-muted-foreground mt-1 tracking-widest uppercase font-semibold">System v1.0</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
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
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
