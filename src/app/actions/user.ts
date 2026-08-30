"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function updatePasswordAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" }
    }

    const data = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    const validated = updatePasswordSchema.parse(data)

    // Fetch the user's current hashed password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Verify current password
    const isValid = await bcrypt.compare(validated.currentPassword, user.password)
    if (!isValid) {
      return { success: false, error: "Incorrect current password" }
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(validated.newPassword, 10)

    // Update password in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })

    return { success: true, message: "Password updated successfully" }

  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-expect-error ZodError generic typing mismatch
      return { success: false, error: error.errors[0].message }
    }
    console.error("Update Password Error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
