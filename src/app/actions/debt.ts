"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const payDebtSchema = z.object({
  customerId: z.string(),
  amountPaid: z.number().min(0, "Amount must be positive")
})

export async function payDebtAction(data: z.infer<typeof payDebtSchema>) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    const validated = payDebtSchema.parse(data)

    await prisma.$transaction(async (tx) => {
      // Create a dummy sale or payment record to track this? 
      // The user didn't specify creating a receipt, just deducting balance.
      // We will just deduct the balance for now.
      
      const customer = await tx.customer.findUnique({
        where: { id: validated.customerId, shopId: session.user.shopId as string }
      })

      if (!customer) {
        throw new Error("Customer not found")
      }

      await tx.customer.update({
        where: { id: validated.customerId },
        data: {
          balance: { decrement: validated.amountPaid } // Balance > 0 means debt. Paying decreases it.
        }
      })
    })

    revalidatePath("/dettes")
    revalidatePath("/loans")
    revalidatePath("/customers")
    
    return { success: true }
  } catch (error) {
    console.error("Pay Debt Error:", error)
    return { success: false, error: "Failed to process payment" }
  }
}
