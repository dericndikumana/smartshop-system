import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { DettesClient } from "./dettes-client"

export const dynamic = 'force-dynamic'

export default async function DettesPage() {
  const session = await auth()
  if (!session || !session.user.shopId) redirect("/login")

  // Fetch customers with debts (balance > 0)
  const customersWithDebt = await prisma.customer.findMany({
    where: { 
      shopId: session.user.shopId,
      balance: { gt: 0 }
    },
    orderBy: { fullName: 'asc' }
  })

  const serializedCustomers = customersWithDebt.map(c => ({
    id: c.id,
    fullName: c.fullName,
    phone: c.phone,
    balance: c.balance
  }))

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full pt-8 px-4 pb-20">
      <DettesClient initialCustomers={serializedCustomers} />
    </div>
  )
}
