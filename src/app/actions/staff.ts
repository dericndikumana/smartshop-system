"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleCashierStatusAction(userId: string, currentStatus: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SHOP_ADMIN" || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE"

    await prisma.user.update({
      where: { 
        id: userId,
        shopId: session.user.shopId // Ensure security
      },
      data: { status: newStatus }
    })

    revalidatePath("/staff")
    return { success: true }
  } catch (error) {
    console.error("Toggle Cashier Status Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteCashierAction(userId: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SHOP_ADMIN" || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.user.delete({
      where: { 
        id: userId,
        shopId: session.user.shopId
      }
    })

    revalidatePath("/staff")
    return { success: true }
  } catch (error) {
    console.error("Delete Cashier Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
