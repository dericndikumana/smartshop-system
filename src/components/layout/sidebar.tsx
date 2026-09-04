"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, Receipt, Store, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { useTranslation } from "@/components/providers/language-provider"

interface SidebarProps {
  role: string
  onNavClick?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ role, onNavClick, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  
  // Define navigation based on Role
  let navItems: { name: string; href: string; icon: React.ElementType }[] = []

  if (role === "SUPER_ADMIN") {
    navItems = [
      { name: t("sidebar.system_overview"), href: "/superadmin", icon: LayoutDashboard },
      { name: t("sidebar.manage_shops"), href: "/superadmin/shops", icon: Store },
      { name: t("sidebar.settings"), href: "/settings", icon: Settings },
    ]
  } else if (role === "CASHIER") {
    navItems = [
      { name: t("nav.home"), href: "/", icon: LayoutDashboard },
      { name: t("nav.pos"), href: "/pos", icon: ShoppingCart },
      { name: t("nav.all_sales"), href: "/sales", icon: Receipt },
      { name: t("nav.customer_info"), href: "/customers", icon: Users },
    ]
  } else {
    // SHOP_ADMIN
    navItems = [
      { name: t("nav.home"), href: "/", icon: LayoutDashboard },
      { name: t("nav.pos"), href: "/pos", icon: ShoppingCart },
      { name: t("nav.all_sales"), href: "/sales", icon: Receipt },
      { name: t("nav.product"), href: "/inventory", icon: Package },
      { name: t("nav.customer_info"), href: "/customers", icon: Users },
      { name: t("nav.settings"), href: "/settings", icon: Settings },
    ]
  }

  return (
    <div className="w-full border-r h-full bg-card flex flex-col relative group shadow-xl">
      {/* Desktop Collapse Toggle */}
      <button 
        onClick={onToggleCollapse}
        className="hidden md:flex absolute -right-3 top-6 h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground z-10"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className={`p-6 border-b flex items-center justify-center gap-3 transition-all ${isCollapsed ? "px-2" : "px-6"}`}>
        <img src="/logo.ico" alt="Logo" className="h-8 w-8 object-contain flex-shrink-0 drop-shadow-md" />
        <h1 className={`text-2xl font-bold tracking-tight text-primary transition-all ${isCollapsed ? "scale-0 hidden" : "scale-100"}`}>
          SmartShop
        </h1>
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
      </nav>
    </div>
  )
}
