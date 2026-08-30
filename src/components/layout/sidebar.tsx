"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Users, FileText, Settings, LogOut, Receipt, Store, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

interface SidebarProps {
  role: string
  onNavClick?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ role, onNavClick, isCollapsed, onToggleCollapse }: SidebarProps) {
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
    <div className="w-full border-r h-full bg-card flex flex-col relative group">
      {/* Desktop Collapse Toggle */}
      <button 
        onClick={onToggleCollapse}
        className="hidden md:flex absolute -right-3 top-6 h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground z-10"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className={`p-6 border-b flex items-center justify-center transition-all ${isCollapsed ? "px-2" : "px-6"}`}>
        <h1 className={`text-2xl font-bold tracking-tight text-primary transition-all ${isCollapsed ? "scale-0 hidden" : "scale-100"}`}>
          shopCore
        </h1>
        {isCollapsed && <Store className="h-8 w-8 text-primary" />}
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isCollapsed && "justify-center px-0",
                isActive 
                  ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0", isCollapsed && "h-5 w-5")} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className={cn("h-4 w-4 flex-shrink-0", isCollapsed && "h-5 w-5")} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}
