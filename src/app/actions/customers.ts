"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const customerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
})

export async function createCustomerAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      fullName: formData.get("fullName") as string,
      phone: (formData.get("phone") as string) || undefined,
    }

    const validated = customerSchema.parse(data)

    await prisma.customer.create({
      data: {
        fullName: validated.fullName,
        phone: validated.phone,
        shopId: session.user.shopId,
      }
    })

    revalidatePath("/customers")
    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error type mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Create Customer Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function editCustomerAction(customerId: string, formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      fullName: formData.get("fullName") as string,
      phone: (formData.get("phone") as string) || undefined,
    }

    const validated = customerSchema.parse(data)

    await prisma.customer.update({
      where: { 
        id: customerId,
        shopId: session.user.shopId
      },
      data: {
        fullName: validated.fullName,
        phone: validated.phone,
      }
    })

    revalidatePath("/customers")
    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error type mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Edit Customer Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteCustomerAction(customerId: string) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId || session.user.role === "CASHIER") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.customer.delete({
      where: { 
        id: customerId,
        shopId: session.user.shopId
      }
    })

    revalidatePath("/customers")
    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Delete Customer Error:", error)
    return { success: false, error: "Failed to delete customer" }
  }
}
