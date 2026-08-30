import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { CashierDashboard } from "./cashier-dashboard"
import { ShopAdminDashboard } from "./shop-admin-dashboard"
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

  if (session.user.role === "CASHIER") {
    // 1. CASHIER DASHBOARD DATA
    const cashierSales = await prisma.sale.findMany({
      where: {
        shopId: session.user.shopId,
        cashierId: session.user.id
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

    return (
      <CashierDashboard 
        salesCount={salesCount}
        totalItemsSold={totalItemsSold}
        revenueByCurrency={revenueByCurrency}
      />
    )
  }

  if (session.user.role === "SHOP_ADMIN") {
    // 2. SHOP ADMIN DASHBOARD DATA
    const [totalProducts, totalCustomers, todaySalesData] = await Promise.all([
      prisma.product.count({ where: { shopId: session.user.shopId } }),
      prisma.customer.count({ where: { shopId: session.user.shopId } }),
      prisma.sale.findMany({
        where: {
          shopId: session.user.shopId
        },
        orderBy: { createdAt: 'desc' },
        include: {
          cashier: true,
          items: true
        }
      })
    ])

    const todaySalesCount = todaySalesData.length

    // Calculate revenue grouped by currency
    const revenueByCurrency: Record<string, number> = {}
    todaySalesData.forEach((sale: SaleWithItems) => {
      // It's safer to sum from items directly to respect multiple currencies if any exist
      // But sale.currency holds the primary currency for the sale
      // Let's use items to accurately group
      sale.items.forEach((item: SaleItem) => {
        const itemSubtotalWithVat = item.subtotal + (item.subtotal * (sale.vatRate / 100))
        revenueByCurrency[item.currency] = (revenueByCurrency[item.currency] || 0) + itemSubtotalWithVat
      })
    })

    return (
      <ShopAdminDashboard 
        stats={{
          totalProducts,
          totalCustomers,
          todaySalesCount
        }}
        revenueByCurrency={revenueByCurrency}
      />
    )
  }

  return (
    <div className="p-8 text-center text-muted-foreground">
      Unknown role or not implemented.
    </div>
  )
}
