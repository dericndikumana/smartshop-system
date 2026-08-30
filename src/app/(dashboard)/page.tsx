import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { CashierDashboard } from "./cashier-dashboard"
import { ShopAdminDashboard } from "./shop-admin-dashboard"

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
        cashierId: session.user.id,
        createdAt: { gte: today }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true
      }
    })

    const salesTotal = cashierSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const salesCount = cashierSales.length

    const recentSales = cashierSales.slice(0, 10).map(sale => ({
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      totalAmount: sale.totalAmount,
      currency: sale.currency,
      createdAt: sale.createdAt,
      items: sale.items.reduce((sum, item) => sum + item.quantity, 0)
    }))

    return (
      <CashierDashboard 
        salesTotal={salesTotal}
        salesCount={salesCount}
        recentSales={recentSales}
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
          shopId: session.user.shopId,
          createdAt: { gte: today }
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
    todaySalesData.forEach(sale => {
      // It's safer to sum from items directly to respect multiple currencies if any exist
      // But sale.currency holds the primary currency for the sale
      // Let's use items to accurately group
      sale.items.forEach(item => {
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
