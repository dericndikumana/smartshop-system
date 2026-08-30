"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createShopSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
  adminEmail: z.string().email("Invalid email address"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
})

export async function createShopAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      shopName: formData.get("shopName") as string,
      adminName: formData.get("adminName") as string,
      adminEmail: formData.get("adminEmail") as string,
      adminPassword: formData.get("adminPassword") as string,
    }

    const validated = createShopSchema.parse(data)

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.adminEmail }
    })

    if (existingUser) {
      return { success: false, error: "Email is already registered to an account." }
    }

    const shopAdminRole = await prisma.role.findUnique({
      where: { name: "SHOP_ADMIN" }
    })

    if (!shopAdminRole) {
      return { success: false, error: "System error: SHOP_ADMIN role not found." }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validated.adminPassword, 10)

    // Run in a transaction to ensure both shop and user are created or neither are
    await prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: {
          name: validated.shopName,
          status: "ACTIVE",
          shopSetting: {
            create: {} // Create default shop settings
          }
        }
      })

      await tx.user.create({
        data: {
          name: validated.adminName,
          email: validated.adminEmail,
          password: hashedPassword,
          roleId: shopAdminRole.id,
          shopId: shop.id,
          status: "ACTIVE"
        }
      })
    })

    revalidatePath("/superadmin")
    return { success: true }

  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error ZodError generic typing mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Create Shop Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function toggleUserStatusAction(userId: string, currentStatus: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    if (session.user.id === userId) {
      return { success: false, error: "You cannot block yourself." }
    }

    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE"

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus }
    })

    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Toggle User Status Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
