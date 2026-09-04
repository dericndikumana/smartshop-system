"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Footer } from "./footer"
import { BottomNav } from "./bottom-nav"

import { IdleTimer } from "./idle-timer"

export function DashboardShell({ 
  children, 
  user,
  shopName 
}: { 
  children: React.ReactNode
  user: { role?: string, email?: string | null, name?: string | null }
  shopName?: string
}) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <IdleTimer />

      {/* Sidebar Wrapper */}
      <div className={`
        print:hidden
        hidden md:block fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0
        ${isDesktopCollapsed ? "md:w-20" : "md:w-64"}
      `}>
        <Sidebar 
          role={user.role || ""} 
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <div className="flex items-center px-4 md:px-0 bg-background border-b md:border-b-0 sticky top-0 z-10 shadow-sm md:shadow-none print:hidden">
          <div className="flex-1">
            <Header user={user} shopName={shopName} hideBorder />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20 print:p-0 print:bg-white print:overflow-visible">
          {children}
        </main>
        <div className="print:hidden">
          <Footer />
        </div>
      </div>
      <BottomNav role={user.role || ""} />
    </div>
  )
}
