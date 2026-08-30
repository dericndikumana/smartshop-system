import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { StaffClient } from "./staff-client"

export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const session = await auth()
  
  if (session?.user?.role !== "SHOP_ADMIN" || !session.user.shopId) {
    redirect("/")
  }

  const cashiers = await prisma.user.findMany({
    where: { 
      shopId: session.user.shopId,
      role: { name: "CASHIER" }
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Cashiers</h1>
          <p className="text-muted-foreground mt-2">
            Add, remove, and suspend staff members for your shop.
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">Add Cashier</button>
      </div>
      
      <StaffClient cashiers={cashiers} />
    </div>
  )
}
