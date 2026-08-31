"use client"

import { useTranslation } from "@/components/providers/language-provider"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
        <Languages className="h-4 w-4" />
        <span className="text-sm font-medium uppercase">{language}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-32 rounded-md border bg-popover shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-1 flex flex-col gap-1">
          <button 
            onClick={() => setLanguage("en")}
            className={`text-sm text-left px-3 py-1.5 rounded-sm transition-colors ${language === "en" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage("rw")}
            className={`text-sm text-left px-3 py-1.5 rounded-sm transition-colors ${language === "rw" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
          >
            Kinyarwanda
          </button>
        </div>
      </div>
    </div>
  )
}
