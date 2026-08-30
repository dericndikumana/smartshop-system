"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    currency: z.string()
  })).min(1, "Cart cannot be empty"),
  vatRate: z.number().min(0),
  primaryCurrency: z.string() // We'll just save the first currency as the receipt currency for simplicity, but track subtotal currencies in items
})

export async function checkoutAction(data: z.infer<typeof checkoutSchema>) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = checkoutSchema.parse(data)

    // Verify stock availability
    for (const item of validated.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product || product.quantity < item.quantity) {
        return { success: false, error: `Not enough stock for product ID ${item.productId}` }
      }
    }

    // Run transaction
    const saleResult = await prisma.$transaction(async (tx) => {
      // 1. Generate receipt number
      const shopSetting = await tx.shopSetting.findUnique({ where: { shopId: session.user.shopId! } })
      const prefix = shopSetting?.receiptPrefix || "SC-"
      const seq = shopSetting?.nextReceiptSeq || 1
      const receiptNumber = `${prefix}${seq.toString().padStart(6, '0')}`

      // Increment sequence
      await tx.shopSetting.update({
        where: { shopId: session.user.shopId! },
        data: { nextReceiptSeq: seq + 1 }
      })

      // Calculate total amount (We'll just sum raw values for the Sale object, but receipts will group by currency via items)
      const totalAmount = validated.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      const vatAmount = totalAmount * (validated.vatRate / 100)

      // 2. Create Sale
      const sale = await tx.sale.create({
        data: {
          receiptNumber,
          totalAmount: totalAmount + vatAmount,
          vatAmount,
          vatRate: validated.vatRate,
          currency: validated.primaryCurrency,
          shopId: session.user.shopId!,
          cashierId: session.user.id,
          items: {
            create: validated.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
              currency: item.currency
            }))
          }
        }
      })

      // 3. Create Receipt
      await tx.receipt.create({
        data: {
          receiptNum: receiptNumber,
          saleId: sale.id,
          shopId: session.user.shopId!
        }
      })

      // 4. Update Product Quantities & Create Stock Transactions
      for (const item of validated.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        })

        await tx.stockTransaction.create({
          data: {
            type: "SALE",
            quantity: -item.quantity,
            reason: `Sale ${receiptNumber}`,
            productId: item.productId,
            userId: session.user.id,
            shopId: session.user.shopId!
          }
        })
      }

      return sale
    })

    revalidatePath("/pos")
    revalidatePath("/inventory")
    revalidatePath("/sales")
    return { success: true, receiptId: saleResult.id }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid cart data" }
    }
    console.error("Checkout Error:", error)
    return { success: false, error: "Checkout failed" }
  }
}
