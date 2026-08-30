"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateShopSettingsAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SHOP_ADMIN" || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    const vatRate = parseFloat(formData.get("vatRate") as string)
    const isVatEnabled = formData.get("isVatEnabled") === "on"
    const receiptPrefix = formData.get("receiptPrefix") as string

    await prisma.$transaction(async (tx) => {
      // Upsert VAT
      await tx.vatSetting.upsert({
        where: { shopId: session.user.shopId! },
        update: { rate: vatRate || 0, isEnabled: isVatEnabled },
        create: { shopId: session.user.shopId!, rate: vatRate || 0, isEnabled: isVatEnabled }
      })

      // Upsert Shop Setting
      await tx.shopSetting.upsert({
        where: { shopId: session.user.shopId! },
        update: { receiptPrefix: receiptPrefix || "SC-" },
        create: { shopId: session.user.shopId!, receiptPrefix: receiptPrefix || "SC-" }
      })
    })

    revalidatePath("/settings")
    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Update Shop Settings Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
