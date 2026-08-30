"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Bell, User } from "lucide-react"

export function Header() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-background sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold hidden md:block">Overview</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
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
          <div className="text-sm hidden sm:block">
            <p className="font-semibold leading-none">Deric</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">SUPER ADMIN</p>
          </div>
        </div>
      </div>
    </header>
  )
}
