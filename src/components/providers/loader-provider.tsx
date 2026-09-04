"use client"

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react'
import { GlobalLoader } from '../ui/global-loader'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface LoaderContextType {
  showLoader: (durationMs: number) => void
  hideLoader: () => void
  isLoading: boolean
}

const LoaderContext = createContext<LoaderContextType | null>(null)

export function useLoader() {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider")
  }
  return context
}

function LoaderEffect({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href) {
        const url = new URL(link.href)
        
        // Exclude external links, self-links, and new tabs
        if (
          url.origin === window.location.origin &&
          link.target !== '_blank'
        ) {
          const currentUrl = pathname + searchParams.toString()
          const newUrl = url.pathname + url.search
          
          if (currentUrl !== newUrl) {
            e.preventDefault()
            e.stopPropagation()
            
            // Show the loader immediately
            setIsLoading(true)
            
            // Wait 2 seconds as requested, then push to route
            setTimeout(() => {
              router.push(newUrl)
              
              // Add a slight delay to turn off loader so the new page renders
              setTimeout(() => {
                setIsLoading(false)
              }, 500)
            }, 2000)
          }
        }
      }
    }

    // Capture true to intercept before Next.js Link
    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [router, pathname, searchParams, setIsLoading])

  return null
}

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const showLoader = (durationMs: number) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, durationMs)
  }

  const hideLoader = () => {
    setIsLoading(false)
  }

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      <Suspense fallback={null}>
        <LoaderEffect setIsLoading={setIsLoading} />
      </Suspense>
      {children}
      <GlobalLoader visible={isLoading} />
    </LoaderContext.Provider>
  )
}
