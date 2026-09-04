"use client"

import Link from "next/link"
import { LogOutButton } from "./logout-button"
import { 
  Users, 
  Receipt,
  User,
  ShoppingCart,
  Banknote,
  HandCoins
} from "lucide-react"
import { useTranslation } from "@/components/providers/language-provider"

interface SettingsMenuClientProps {
  userRole: string
  userName: string
}

export function SettingsMenuClient({ userRole, userName }: SettingsMenuClientProps) {
  const { t } = useTranslation()

  // Base menu items
  let menuItems = [
    { name: t('sidebar.account_details') || "Account Details", href: "/settings/account", icon: User },
    { name: t('sidebar.order') || "Order", href: "/pos", icon: ShoppingCart },
    { name: t('sidebar.debt') || "Debt", href: "/dettes", icon: Banknote },
    { name: t('sidebar.loan') || "Loan", href: "/loans", icon: HandCoins },
    { name: t('sidebar.manage_cashiers') || "Manage Cashiers", href: "/staff", icon: Users },
    { name: t('sidebar.reports') || "Report", href: "/reports", icon: Receipt },
  ]

  // Filter based on role
  if (userRole === "CASHIER") {
    // Only Account Details for cashier
    menuItems = [
      { name: t('sidebar.account_details') || "Account Details", href: "/settings/account", icon: User },
    ]
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background max-w-md mx-auto md:max-w-none md:border md:rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col items-center py-6 border-b bg-background/50">
        <h1 className="text-red-500 font-bold tracking-widest text-xl uppercase">{userName}</h1>
        <div className="flex items-center gap-1 text-sm font-bold mt-1">
          <span className="uppercase">{userRole === 'CASHIER' ? 'Cashier' : 'Shop Admin'} ▼</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {menuItems.map((item, i) => (
          <Link 
            key={i} 
            href={item.href}
            className="flex items-center justify-between p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 font-bold text-lg border border-teal-100 dark:border-teal-900 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-yellow-400 flex items-center justify-center text-yellow-400">
                <item.icon className="h-4 w-4" />
              </div>
              <span>{item.name}</span>
            </div>
            <span>→</span>
          </Link>
        ))}

        <LogOutButton />
      </div>
    </div>
  )
}
