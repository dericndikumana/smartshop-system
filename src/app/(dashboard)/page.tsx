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

    const todaySalesTotal = todaySalesData.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const todaySalesCount = todaySalesData.length

    const recentSales = todaySalesData.slice(0, 10).map(sale => ({
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      totalAmount: sale.totalAmount,
      currency: sale.currency,
      createdAt: sale.createdAt,
      cashierName: sale.cashier.name,
      items: sale.items.reduce((sum, item) => sum + item.quantity, 0)
    }))

    // Calculate Cashier performance
    const cashierPerformanceMap = new Map<string, { cashierName: string, salesTotal: number, salesCount: number, currency: string }>()
    
    todaySalesData.forEach(sale => {
      const existing = cashierPerformanceMap.get(sale.cashier.id)
      if (existing) {
        existing.salesTotal += sale.totalAmount
        existing.salesCount += 1
      } else {
        cashierPerformanceMap.set(sale.cashier.id, {
          cashierName: sale.cashier.name,
          salesTotal: sale.totalAmount,
          salesCount: 1,
          currency: sale.currency
        })
      }
    })

    const cashierSales = Array.from(cashierPerformanceMap.values()).sort((a, b) => b.salesTotal - a.salesTotal)

    return (
      <ShopAdminDashboard 
        stats={{
          totalProducts,
          totalCustomers,
          todaySalesTotal,
          todaySalesCount
        }}
        recentSales={recentSales}
        cashierSales={cashierSales}
      />
    )
  }

  return (
    <div className="p-8 text-center text-muted-foreground">
      Unknown role or not implemented.
    </div>
  )
}
