"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "./language-switcher"
import { signOut } from "next-auth/react"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
    shopId?: string | null
  }
  hideBorder?: boolean
  shopName?: string
}

export function Header({ user, hideBorder, shopName }: HeaderProps) {
  const { setTheme, theme } = useTheme()
  const [showLogout, setShowLogout] = useState(false)

  const getRoleLabel = (role?: string) => {
    if (role === "SUPER_ADMIN") return "SUPER ADMIN"
    if (role === "SHOP_ADMIN") return "SHOP ADMIN"
    if (role === "CASHIER") return "CASHIER"
    return "USER"
  }

  return (
    <header className={cn("flex items-center justify-between px-6 py-3 bg-background", !hideBorder && "border-b sticky top-0 z-10 shadow-sm")}>
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold hidden md:block">
          {user.role === "SUPER_ADMIN" ? "System Overview" : (shopName || "Dashboard")}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <LanguageSwitcher />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <div className="relative">
          <button 
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center gap-3 border-l pl-5 ml-1 hover:opacity-80 transition-opacity text-left"
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-semibold leading-none">{user.name || user.email?.split("@")[0] || "User"}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">{getRoleLabel(user.role)}</p>
            </div>
          </button>
          
          {showLogout && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowLogout(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-md shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
