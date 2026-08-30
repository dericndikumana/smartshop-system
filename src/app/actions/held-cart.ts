"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function holdCartAction(data: {
  customerName?: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
    currency: string
  }[]
}) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    if (data.items.length === 0) {
      return { success: false, error: "Cannot hold an empty cart" }
    }

    // A descriptive reference string for the held cart
    const itemsSummary = data.items.length === 1 
      ? `1 item` 
      : `${data.items.length} items`
    
    const name = data.customerName && data.customerName.trim() !== ""
      ? `${data.customerName} (${itemsSummary})`
      : `Walk-in (${itemsSummary})`

    await prisma.heldCart.create({
      data: {
        shopId: session.user.shopId,
        cashierId: session.user.id,
        name,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            currency: item.currency
          }))
        }
      }
    })

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Failed to hold cart:", error)
    return { success: false, error: "Failed to hold cart" }
  }
}

export async function deleteHeldCartAction(id: string) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    // Security check: ensure it belongs to this shop
    const cart = await prisma.heldCart.findUnique({ where: { id } })
    if (!cart || cart.shopId !== session.user.shopId) {
      return { success: false, error: "Cart not found" }
    }

    await prisma.heldCart.delete({
      where: { id }
    })

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete held cart:", error)
    return { success: false, error: "Failed to delete held cart" }
  }
}
