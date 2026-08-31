"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import en from "@/locales/en.json"
import rw from "@/locales/rw.json"

type Language = "en" | "rw"
type Translations = typeof en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const dictionaries = {
  en,
  rw,
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    if (session?.user?.language) {
      setLanguageState(session.user.language as Language)
    }
  }, [session?.user?.language])

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang) // Optimistic update
    
    try {
      await fetch("/api/user/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: newLang })
      })
      await update({ language: newLang }) // Update session
    } catch (error) {
      console.error("Failed to update language:", error)
    }
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = dictionaries[language]

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return value as string
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }
  return context
}
