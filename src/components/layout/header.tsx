"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
    shopId?: string | null
  }
  hideBorder?: boolean
}

export function Header({ user, hideBorder }: HeaderProps) {
  const { setTheme, theme } = useTheme()

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
          {user.role === "SUPER_ADMIN" ? "System Overview" : "Dashboard"}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-3 border-l pl-5 ml-1">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-semibold leading-none">{user.name || user.email?.split("@")[0] || "User"}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">{getRoleLabel(user.role)}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
