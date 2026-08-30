import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ReportsClient } from "./reports-client"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const session = await auth()
  
  if (!session || !session.user.shopId || session.user.role !== "SHOP_ADMIN") {
    redirect("/login")
  }

  const shopId = session.user.shopId

  // Fetch all sales for this shop
  const sales = await prisma.sale.findMany({
    where: { shopId },
    include: {
      items: true,
      cashier: { select: { name: true, id: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const now = new Date()
  
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  startOfWeek.setHours(0, 0, 0, 0)
  now.setDate(now.getDate() + now.getDay()) // reset now
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  // Aggregate Helper
  const aggregateRevenue = (filteredSales: typeof sales) => {
    const totals: Record<string, number> = {}
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        totals[item.currency] = (totals[item.currency] || 0) + item.subtotal
        // Add VAT for that item to the total
        const itemVat = item.subtotal * (sale.vatRate / 100)
        totals[item.currency] += itemVat
      })
    })
    return totals
  }

  const dailySales = sales.filter(s => s.createdAt >= startOfDay)
  const weeklySales = sales.filter(s => s.createdAt >= startOfWeek)
  const monthlySales = sales.filter(s => s.createdAt >= startOfMonth)
  const annualSales = sales.filter(s => s.createdAt >= startOfYear)

  const metrics = {
    daily: aggregateRevenue(dailySales),
    weekly: aggregateRevenue(weeklySales),
    monthly: aggregateRevenue(monthlySales),
    annual: aggregateRevenue(annualSales),
  }

  // Cashier Performance
  const cashierStats: Record<string, { name: string, totalSales: number, revenueByCurrency: Record<string, number> }> = {}
  
  sales.forEach(sale => {
    if (!cashierStats[sale.cashier.id]) {
      cashierStats[sale.cashier.id] = { name: sale.cashier.name, totalSales: 0, revenueByCurrency: {} }
    }
    
    cashierStats[sale.cashier.id].totalSales += 1
    
    sale.items.forEach(item => {
      const itemTotal = item.subtotal + (item.subtotal * (sale.vatRate / 100))
      cashierStats[sale.cashier.id].revenueByCurrency[item.currency] = 
        (cashierStats[sale.cashier.id].revenueByCurrency[item.currency] || 0) + itemTotal
    })
  })

  return <ReportsClient metrics={metrics} cashierStats={Object.values(cashierStats)} />
}
