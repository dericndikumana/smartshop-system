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
  adminPhone: z.string().optional(),
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
      adminPhone: formData.get("adminPhone") as string || undefined,
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

    if (validated.adminPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: validated.adminPhone }
      })
      if (existingPhone) {
        return { success: false, error: "Phone number is already registered to an account." }
      }
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
          phone: validated.adminPhone || null,
          password: hashedPassword,
          roleId: shopAdminRole.id,
          shopId: shop.id,
          status: "ACTIVE"
        }
      })

      await tx.customer.create({
        data: {
          shopId: shop.id,
          fullName: validated.adminName,
          phone: validated.adminPhone || "",
          balance: 0
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

export async function softDeleteShopAction(shopId: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.$transaction(async (tx) => {
      await tx.shop.update({
        where: { id: shopId },
        data: { status: "DELETED" }
      })

      const users = await tx.user.findMany({ where: { shopId } })
      
      for (const user of users) {
        if (!user.email.includes(".deleted.")) {
          await tx.user.update({
            where: { id: user.id },
            data: { email: `${user.email}.deleted.${shopId}` }
          })
        }
      }
    })

    revalidatePath("/superadmin/shops")
    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Soft Delete Shop Error:", error)
    return { success: false, error: "Failed to move shop to Recycle Bin" }
  }
}

export async function restoreShopAction(shopId: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({ where: { shopId } })
      
      for (const user of users) {
        if (user.email.includes(`.deleted.${shopId}`)) {
          const originalEmail = user.email.replace(`.deleted.${shopId}`, "")
          
          const existing = await tx.user.findUnique({ where: { email: originalEmail } })
          if (existing) {
            throw new Error(`Cannot restore: Email ${originalEmail} is now in use by another account.`)
          }
          
          await tx.user.update({
            where: { id: user.id },
            data: { email: originalEmail }
          })
        }
      }

      await tx.shop.update({
        where: { id: shopId },
        data: { status: "ACTIVE" }
      })
    })

    revalidatePath("/superadmin/shops")
    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Restore Shop Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to restore shop"
    return { success: false, error: errorMessage }
  }
}

export async function permanentDeleteShopAction(shopId: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.$transaction(async (tx) => {
      // Delete children first to prevent foreign key constraint errors
      await tx.heldCartItem.deleteMany({ where: { heldCart: { shopId } } })
      await tx.saleItem.deleteMany({ where: { sale: { shopId } } })
      await tx.returnItem.deleteMany({ where: { return: { shopId } } })
      await tx.stockTransaction.deleteMany({ where: { shopId } })
      await tx.activityLog.deleteMany({ where: { shopId } })
      await tx.payment.deleteMany({ where: { sale: { shopId } } })
      await tx.receipt.deleteMany({ where: { shopId } })
      
      // Delete internal orders
      await tx.internalOrderItem.deleteMany({ where: { order: { shopId } } })
      await tx.internalOrder.deleteMany({ where: { shopId } })

      await tx.return.deleteMany({ where: { shopId } })
      await tx.heldCart.deleteMany({ where: { shopId } })
      await tx.sale.deleteMany({ where: { shopId } })
      
      await tx.product.deleteMany({ where: { shopId } })
      await tx.category.deleteMany({ where: { shopId } })
      await tx.customer.deleteMany({ where: { shopId } })
      
      await tx.user.deleteMany({ where: { shopId } })
      await tx.vatSetting.deleteMany({ where: { shopId } })
      await tx.shopSetting.deleteMany({ where: { shopId } })
      
      // Finally, delete the shop
      await tx.shop.delete({
        where: { id: shopId }
      })
    })

    revalidatePath("/superadmin/shops")
    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Permanent Delete Shop Error:", error)
    return { success: false, error: "Database constraint error: could not permanently delete this shop" }
  }
}

export async function toggleShopStatusAction(shopId: string, currentStatus: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE"

    await prisma.shop.update({
      where: { id: shopId },
      data: { status: newStatus }
    })

    revalidatePath("/superadmin/shops")
    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Toggle Shop Status Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

const editShopAdminSchema = z.object({
  userId: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
})

export async function editShopAdminAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      userId: formData.get("userId") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || undefined,
    }

    const validated = editShopAdminSchema.parse(data)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    })
    
    if (existingUser && existingUser.id !== validated.userId) {
      return { success: false, error: "Email is already taken by another user." }
    }

    if (validated.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: validated.phone }
      })
      if (existingPhone && existingPhone.id !== validated.userId) {
        return { success: false, error: "Phone number is already taken by another user." }
      }
    }

    await prisma.user.update({
      where: { id: validated.userId },
      data: { 
        name: validated.name, 
        email: validated.email,
        phone: validated.phone || null
      }
    })

    revalidatePath("/superadmin/shops")
    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error ZodError generic typing mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Edit Admin Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function resetShopAdminPasswordAction(userId: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error) {
    console.error("Reset Password Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

const editShopSchema = z.object({
  shopId: z.string(),
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
})

export async function editShopAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      shopId: formData.get("shopId") as string,
      shopName: formData.get("shopName") as string,
    }

    const validated = editShopSchema.parse(data)

    await prisma.shop.update({
      where: { id: validated.shopId },
      data: { name: validated.shopName }
    })

    revalidatePath("/superadmin/shops")
    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error ZodError generic typing mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Edit Shop Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

