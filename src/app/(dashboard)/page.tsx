import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { CashierDashboard } from "./cashier-dashboard"
import { Sale, SaleItem } from "@prisma/client"

type SaleWithItems = Sale & { items: SaleItem[] }

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  // Superadmin dashboard is handled at /superadmin, but just in case:
  if (session.user.role === "SUPER_ADMIN") {
    redirect("/superadmin")
  }

  if (!session.user.shopId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        You are not assigned to a shop.
      </div>
    )
  }

  // Common filters
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (session.user.role === "CASHIER" || session.user.role === "SHOP_ADMIN") {
    // 1. DASHBOARD DATA
    const cashierSales = await prisma.sale.findMany({
      where: {
        shopId: session.user.shopId,
        ...(session.user.role === "CASHIER" ? { cashierId: session.user.id } : {}),
        createdAt: { gte: today }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true
      }
    })

    const salesCount = cashierSales.length
    let totalItemsSold = 0
    const revenueByCurrency: Record<string, number> = {}

    cashierSales.forEach((sale: SaleWithItems) => {
      sale.items.forEach((item: SaleItem) => {
        totalItemsSold += item.quantity
        const itemSubtotalWithVat = item.subtotal + (item.subtotal * (sale.vatRate / 100))
        revenueByCurrency[item.currency] = (revenueByCurrency[item.currency] || 0) + itemSubtotalWithVat
      })
    })

    // 2. ALL-TIME REVENUE
    const allTimeSales = await prisma.sale.findMany({
      where: {
        shopId: session.user.shopId,
        ...(session.user.role === "CASHIER" ? { cashierId: session.user.id } : {})
      },
      include: {
        items: true
      }
    })

    const allTimeRevenueByCurrency: Record<string, number> = {}
    allTimeSales.forEach((sale: SaleWithItems) => {
      sale.items.forEach((item: SaleItem) => {
        const itemSubtotalWithVat = item.subtotal + (item.subtotal * (sale.vatRate / 100))
        allTimeRevenueByCurrency[item.currency] = (allTimeRevenueByCurrency[item.currency] || 0) + itemSubtotalWithVat
      })
    })

    return (
      <CashierDashboard 
        salesCount={salesCount}
        totalItemsSold={totalItemsSold}
        revenueByCurrency={revenueByCurrency}
        allTimeRevenueByCurrency={allTimeRevenueByCurrency}
      />
    )
  }

  return (
    <div className="p-8 text-center text-muted-foreground">
      Unknown role or not implemented.
    </div>
  )
}
