import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { LogOutButton } from "./logout-button"
import { 
  Truck, 
  ShoppingCart, 
  ListOrdered, 
  Package, 
  Users, 
  Wallet, 
  CreditCard, 
  Coins, 
  Receipt,
  User
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  // Calculate shop balance/revenue for the display
  let shopBalance = 0
  if (session.user.shopId) {
    const sales = await prisma.sale.findMany({
      where: { shopId: session.user.shopId },
      select: { totalAmount: true }
    })
    shopBalance = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  }

  const menuItems = [
    { name: "Account Details", href: "/settings/account", icon: User },
    { name: "Dispatch Orders:", href: "#", icon: Truck },
    { name: "Sales:", href: "/pos", icon: ShoppingCart },
    { name: "All Sales:", href: "/sales", icon: ListOrdered },
    { name: "Stocks:", href: "/inventory", icon: Package },
    { name: "Contacts:", href: "/customers", icon: Users },
    { name: "Dettes:", href: "/dettes", icon: Wallet },
    { name: "Edit Card:", href: "#", icon: CreditCard },
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background max-w-md mx-auto md:max-w-none md:border md:rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col items-center py-6 border-b bg-background/50">
        <h1 className="text-red-500 font-bold tracking-widest text-xl uppercase">{session.user.name || "USER"}</h1>
        <div className="flex items-center gap-1 text-sm font-bold mt-1">
          <span className="uppercase">Shop Admin ▼</span>
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

        <div className="flex items-center justify-between p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 font-bold text-lg border border-teal-100 dark:border-teal-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-yellow-400 flex items-center justify-center text-yellow-400">
              <Coins className="h-4 w-4" />
            </div>
            <span>Balance: {shopBalance.toFixed(2)}</span>
          </div>
          <span>→</span>
        </div>

        <Link 
          href="#"
          className="flex items-center justify-between p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 font-bold text-lg border border-teal-100 dark:border-teal-900 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-yellow-400 flex items-center justify-center text-yellow-400">
              <Receipt className="h-4 w-4" />
            </div>
            <span>Spendings:</span>
          </div>
          <span>→</span>
        </Link>
        
        <LogOutButton />
      </div>
    </div>
  )
}
