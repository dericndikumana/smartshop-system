"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().optional(),
  sellingPrice: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().min(2, "Currency is required"),
  quantity: z.coerce.number().min(0, "Quantity must be non-negative"),
  minStock: z.coerce.number().min(0, "Min stock must be non-negative"),
})

export async function createProductAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      name: formData.get("name") as string,
      sku: (formData.get("sku") as string) || undefined,
      sellingPrice: formData.get("sellingPrice"),
      currency: formData.get("currency") as string,
      quantity: formData.get("quantity"),
      minStock: formData.get("minStock"),
    }

    const validated = productSchema.parse(data)

    await prisma.product.create({
      data: {
        name: validated.name,
        sku: validated.sku,
        sellingPrice: validated.sellingPrice,
        currency: validated.currency,
        quantity: validated.quantity,
        minStock: validated.minStock,
        shopId: session.user.shopId,
        status: validated.quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
      }
    })

    revalidatePath("/inventory")
    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error ZodError generic typing mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Create Product Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function editProductAction(productId: string, formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId || session.user.role === "CASHIER") {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      name: formData.get("name") as string,
      sku: (formData.get("sku") as string) || undefined,
      sellingPrice: formData.get("sellingPrice"),
      currency: formData.get("currency") as string,
      quantity: formData.get("quantity"),
      minStock: formData.get("minStock"),
    }

    const validated = productSchema.parse(data)

    await prisma.product.update({
      where: { 
        id: productId,
        shopId: session.user.shopId
      },
      data: {
        name: validated.name,
        sku: validated.sku,
        sellingPrice: validated.sellingPrice,
        currency: validated.currency,
        quantity: validated.quantity,
        minStock: validated.minStock,
        status: validated.quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
      }
    })

    revalidatePath("/inventory")
    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error ZodError generic typing mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Edit Product Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function addStockAction(productId: string, quantityToAdd: number) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    if (quantityToAdd <= 0) {
      return { success: false, error: "Quantity must be greater than zero" }
    }

    // Verify product exists and belongs to shop
    const product = await prisma.product.findUnique({
      where: { id: productId, shopId: session.user.shopId }
    })

    if (!product) return { success: false, error: "Product not found" }

    await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: { increment: quantityToAdd },
        status: "IN_STOCK"
      }
    })

    await prisma.stockTransaction.create({
      data: {
        type: "STOCK_IN",
        quantity: quantityToAdd,
        reason: "Manual Stock Add",
        productId,
        userId: session.user.id,
        shopId: session.user.shopId
      }
    })

    revalidatePath("/inventory")
    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Add Stock Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const session = await auth()
    if (!session || !session.user.shopId) {
      return { success: false, error: "Unauthorized" }
    }

    // Ensure product belongs to shop
    await prisma.product.delete({
      where: { 
        id: productId,
        shopId: session.user.shopId // Security check
      }
    })

    revalidatePath("/inventory")
    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Delete Product Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
