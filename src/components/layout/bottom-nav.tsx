"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, User, Settings, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/pos", icon: Home },
    { name: "Payments", href: "/sales", icon: FileText },
    { name: "Account", href: "/settings/account", icon: User },
    { name: "Card", href: "/customers", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

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
