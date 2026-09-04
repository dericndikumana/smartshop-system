import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { LoansClient } from "./loans-client"

export const dynamic = 'force-dynamic'

export default async function LoansPage() {
  const session = await auth()
  if (!session || !session.user.shopId) redirect("/login")

  // Fetch customers with loans (balance < 0)
  const customersWithLoans = await prisma.customer.findMany({
    where: { 
      shopId: session.user.shopId,
      balance: { lt: 0 } 
    },
    orderBy: { fullName: 'asc' }
  })

  const serializedCustomers = customersWithLoans.map(c => ({
    id: c.id,
    fullName: c.fullName,
    phone: c.phone,
    balance: c.balance
  }))

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full pt-8 px-4 pb-20">
      <LoansClient initialCustomers={serializedCustomers} />
    </div>
  )
}
