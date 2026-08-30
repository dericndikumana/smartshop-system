"use client"

import { Menu } from "lucide-react"

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="md:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground rounded-md"
    >
      <Menu className="h-6 w-6" />
    </button>
  )
}

export function MobileSidebarOverlay({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) {
  if (!isOpen) return null
  
  return (
    <div 
      className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
      onClick={onClose}
    />
  )
}
