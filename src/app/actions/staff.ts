"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

const createCashierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

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

export async function createCashierAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SHOP_ADMIN" || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validated = createCashierSchema.parse(data)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    })
    if (existingUser) {
      return { success: false, error: "Email is already in use." }
    }

    const cashierRole = await prisma.role.findUnique({
      where: { name: "CASHIER" }
    })

    if (!cashierRole) {
      return { success: false, error: "System error: CASHIER role not found." }
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10)

    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        roleId: cashierRole.id,
        shopId: session.user.shopId,
        status: "ACTIVE"
      }
    })

    revalidatePath("/staff")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error ZodError generic typing mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Create Cashier Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

const editCashierSchema = z.object({
  userId: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
})

export async function editCashierAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "SHOP_ADMIN" || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      userId: formData.get("userId") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validated = editCashierSchema.parse(data)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    })
    
    if (existingUser && existingUser.id !== validated.userId) {
      return { success: false, error: "Email is already taken by another user." }
    }

    const updateData: Prisma.UserUpdateInput = { name: validated.name, email: validated.email }
    if (validated.password) {
      updateData.password = await bcrypt.hash(validated.password, 10)
    }

    await prisma.user.update({
      where: { 
        id: validated.userId,
        shopId: session.user.shopId
      },
      data: updateData
    })

    revalidatePath("/staff")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error ZodError generic typing mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Edit Cashier Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
