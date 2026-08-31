import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { SalesClient } from "./sales-client"

export const dynamic = 'force-dynamic'

export default async function SalesPage() {
  const session = await auth()
  
  if (!session || !session.user.shopId) {
    redirect("/login")
  }

  // If cashier, only see their own sales. If admin, see all shop sales.
  const isCashier = session.user.role === "CASHIER"

  const sales = await prisma.sale.findMany({
    take: 100,
    where: { 
      shopId: session.user.shopId,
      ...(isCashier ? { cashierId: session.user.id } : {})
    },
    include: {
      cashier: { select: { name: true } },
      customer: { select: { fullName: true } },
      shop: { select: { name: true, phone: true } },
      items: {
        include: { product: { select: { name: true } } }
      },
      receipt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format data for client
  const mappedSales = sales.map(sale => {
    // Group totals by currency
    const totalsByCurrency = sale.items.reduce((acc, item) => {
      acc[item.currency] = (acc[item.currency] || 0) + item.subtotal
      return acc
    }, {} as Record<string, number>)

    return {
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      createdAt: sale.createdAt.toISOString(),
      cashierName: sale.cashier.name,
      customerName: sale.customer?.fullName || null,
      shopName: sale.shop.name,
      shopPhone: sale.shop.phone,
      items: sale.items.map(item => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        currency: item.currency
      })),
      totalsByCurrency,
      vatRate: sale.vatRate,
      primaryCurrency: sale.currency
    }
  })

  return <SalesClient sales={mappedSales} />
}
