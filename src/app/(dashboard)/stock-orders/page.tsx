import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { StockOrdersClient } from "./stock-orders-client"

export const dynamic = 'force-dynamic'

export default async function StockOrdersPage() {
  const session = await auth()
  
  if (!session || !session.user.shopId) {
    redirect("/login")
  }

  // Only STOCK_CASHIER and SHOP_ADMIN can view
  if (session.user.role !== "STOCK_CASHIER" && session.user.role !== "SHOP_ADMIN") {
    redirect("/")
  }

  const orders = await prisma.internalOrder.findMany({
    take: 100,
    where: { 
      shopId: session.user.shopId,
      status: "PENDING"
    },
    include: {
      requester: { select: { name: true } },
      items: {
        include: { product: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format data for client
  const mappedOrders = orders.map(order => {
    return {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      requesterName: order.requester.name,
      totalAmount: order.totalAmount,
      currency: order.currency,
      items: order.items.map(item => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        currency: item.currency
      }))
    }
  })

  return <StockOrdersClient orders={mappedOrders} userRole={session.user.role} />
}
