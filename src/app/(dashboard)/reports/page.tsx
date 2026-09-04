import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ReportsClient } from "./reports-client"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const session = await auth()
  
  if (!session || !session.user.shopId) {
    redirect("/login")
  }

  const shopId = session.user.shopId
  const userRole = session.user.role

  if (userRole !== "SHOP_ADMIN" && userRole !== "CASHIER" && userRole !== "STOCK_CASHIER") {
    redirect("/login")
  }

  // Fetch all sales for this shop
  const sales = await prisma.sale.findMany({
    where: { 
      shopId,
      ...(userRole !== "SHOP_ADMIN" ? { cashierId: session.user.id } : {}) 
    },
    include: {
      items: {
        include: {
          product: { select: { name: true, sku: true } }
        }
      },
      cashier: { select: { name: true, id: true } },
      customer: { select: { fullName: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format details for the new table
  const detailedTransactions = sales.map(sale => {
    const totalsByCurrency = sale.items.reduce((acc, item) => {
      const sub = item.subtotal + (item.subtotal * (sale.vatRate / 100))
      acc[item.currency] = (acc[item.currency] || 0) + sub
      return acc
    }, {} as Record<string, number>)
    
    const itemsSoldList = sale.items.map(item => `${item.product.name} ${item.product.sku ? `(${item.product.sku})` : ''} (x${item.quantity})`).join(", ")
    return {
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      cashierId: sale.cashier.id,
      cashierName: sale.cashier.name,
      customerName: sale.customer?.fullName || "Walk-in",
      date: sale.createdAt.toISOString(),
      itemsSold: itemsSoldList,
      totalsByCurrency
    }
  })

  // Cashier list for filter
  const cashiers = userRole === "SHOP_ADMIN" 
    ? Array.from(new Set(sales.map(s => s.cashier.id))).map(id => {
        const sale = sales.find(s => s.cashier.id === id)
        return { id, name: sale?.cashier.name || "Unknown" }
      })
    : []

  return <ReportsClient 
    transactions={detailedTransactions} 
    cashiers={cashiers} 
    userRole={userRole} 
  />
}
