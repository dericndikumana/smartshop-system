"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function processInternalOrder(orderId: string, action: "ACCEPT" | "REJECT") {
  try {
    const session = await auth()
    if (!session || !session.user.shopId || session.user.role !== "STOCK_CASHIER") {
      return { success: false, error: "Unauthorized. Only Stock Cashiers can process orders." }
    }

    const order = await prisma.internalOrder.findUnique({
      where: { id: orderId },
      include: { 
        items: true,
        requester: true
      }
    })

    if (!order) return { success: false, error: "Order not found" }
    if (order.status !== "PENDING") return { success: false, error: "Order already processed" }

    if (action === "REJECT") {
      await prisma.internalOrder.update({
        where: { id: orderId },
        data: { status: "REJECTED" }
      })
    } else if (action === "ACCEPT") {
      // Create Sale
      await prisma.$transaction(async (tx) => {
        // Find or create customer record for the requester
        let customer = await tx.customer.findFirst({
          where: { shopId: session.user.shopId!, fullName: order.requester.name }
        })

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              fullName: order.requester.name,
              phone: order.requester.phone || null,
              shopId: session.user.shopId!
            }
          })
        }

        // Generate receipt
        const shopSetting = await tx.shopSetting.findUnique({ where: { shopId: session.user.shopId! } })
        const prefix = shopSetting?.receiptPrefix || "SC-"
        const seq = shopSetting?.nextReceiptSeq || 1
        const receiptNumber = `${prefix}${seq.toString().padStart(6, '0')}`

        await tx.shopSetting.update({
          where: { shopId: session.user.shopId! },
          data: { nextReceiptSeq: seq + 1 }
        })

        // Create Sale
        const sale = await tx.sale.create({
          data: {
            receiptNumber,
            totalAmount: order.totalAmount,
            vatAmount: 0, // Simplified for internal
            vatRate: 0,
            currency: order.currency,
            shopId: session.user.shopId!,
            cashierId: session.user.id, // Stock Cashier who accepted
            customerId: customer.id,
            items: {
              create: order.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
                currency: item.currency
              }))
            }
          }
        })

        await tx.receipt.create({
          data: {
            receiptNum: receiptNumber,
            saleId: sale.id,
            shopId: session.user.shopId!
          }
        })

        // Deduct inventory
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } }
          })

          await tx.stockTransaction.create({
            data: {
              type: "SALE",
              quantity: -item.quantity,
              reason: `Internal Order ${receiptNumber}`,
              productId: item.productId,
              userId: session.user.id,
              shopId: session.user.shopId!
            }
          })
        }

        // Update order status
        await tx.internalOrder.update({
          where: { id: orderId },
          data: { status: "ACCEPTED" }
        })
      })
    }

    revalidatePath("/stock-orders")
    revalidatePath("/inventory")
    revalidatePath("/sales")
    return { success: true }
  } catch (error) {
    console.error("Internal Order Processing Error:", error)
    return { success: false, error: "Failed to process order" }
  }
}
