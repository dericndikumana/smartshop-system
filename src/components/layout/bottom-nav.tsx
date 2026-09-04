"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, ListOrdered, Package, Users, Settings, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/providers/language-provider"

export function BottomNav({ role }: { role: string }) {
  const pathname = usePathname()
  const { t } = useTranslation()

  let navItems: { name: string; href: string; icon: React.ElementType }[] = []

  if (role === "SUPER_ADMIN") {
    navItems = [
      { name: t("sidebar.system_overview") || "Home", href: "/superadmin", icon: LayoutDashboard },
      { name: t("sidebar.manage_shops") || "Shops", href: "/superadmin/shops", icon: Store },
      { name: t("sidebar.settings") || "Settings", href: "/settings", icon: Settings },
    ]
  } else if (role === "CASHIER") {
    navItems = [
      { name: t("nav.home") || "Home", href: "/", icon: LayoutDashboard },
      { name: t("nav.pos") || "POS", href: "/pos", icon: ShoppingCart },
      { name: t("nav.all_sales") || "Sales", href: "/sales", icon: ListOrdered },
      { name: t("nav.customer_info") || "Customers", href: "/customers", icon: Users },
    ]
  } else {
    // SHOP_ADMIN
    navItems = [
      { name: t("nav.home") || "Home", href: "/", icon: LayoutDashboard },
      { name: t("nav.pos") || "POS", href: "/pos", icon: ShoppingCart },
      { name: t("nav.all_sales") || "Sales", href: "/sales", icon: ListOrdered },
      { name: t("nav.product") || "Products", href: "/inventory", icon: Package },
      { name: t("nav.customer_info") || "Customers", href: "/customers", icon: Users },
      { name: t("nav.settings") || "Settings", href: "/settings", icon: Settings },
    ]
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50 px-2 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/pos" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary fill-primary/10")} />
              <span className={cn("text-[10px] font-medium", isActive && "text-primary font-bold")}>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
