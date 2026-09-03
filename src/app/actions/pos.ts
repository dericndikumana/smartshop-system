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
  primaryCurrency: z.string(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  amountReceived: z.number().optional()
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
      // 0. Handle Customer
      let customerId: string | undefined = undefined
      let finalCustomerName = validated.customerName?.trim()
      let finalCustomerPhone = validated.customerPhone?.trim()

      if (!finalCustomerName) {
        const shopAdmin = await tx.user.findFirst({ where: { shopId: session.user.shopId!, role: { name: "SHOP_ADMIN" } } })
        finalCustomerName = shopAdmin?.name || session.user.name || "Shop Admin"
        finalCustomerPhone = shopAdmin?.email || "N/A"
      }

      if (finalCustomerName) {
        const existingCustomer = await tx.customer.findFirst({
          where: { shopId: session.user.shopId!, fullName: finalCustomerName }
        })

        if (existingCustomer) {
          customerId = existingCustomer.id
          // Optionally update phone if not present
          if (finalCustomerPhone && !existingCustomer.phone) {
            await tx.customer.update({
              where: { id: existingCustomer.id },
              data: { phone: finalCustomerPhone }
            })
          }
        } else {
          const newCustomer = await tx.customer.create({
            data: {
              fullName: finalCustomerName,
              phone: finalCustomerPhone || null,
              shopId: session.user.shopId!
            }
          })
          customerId = newCustomer.id
        }
      }

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
      const rawTotal = validated.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      
      const vatRate = validated.vatRate
      let vatAmount = 0
      
      if (vatRate > 0) {
        const netTotal = rawTotal / (1 + vatRate / 100)
        vatAmount = rawTotal - netTotal
      }

      // Handle balance/debt update for customer if amountReceived is provided
      if (customerId && validated.amountReceived !== undefined) {
        const amountReceived = validated.amountReceived
        const diff = rawTotal - amountReceived
        if (diff !== 0) {
          await tx.customer.update({
            where: { id: customerId },
            data: { balance: { increment: diff } }
          })
        }
      }

      // 2. Create Sale
      const sale = await tx.sale.create({
        data: {
          receiptNumber,
          totalAmount: rawTotal,
          vatAmount,
          vatRate: validated.vatRate,
          currency: validated.primaryCurrency,
          shopId: session.user.shopId!,
          cashierId: session.user.id,
          customerId: customerId,
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
