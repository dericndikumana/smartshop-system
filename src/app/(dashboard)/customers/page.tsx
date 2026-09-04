import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { CustomersClient } from "./customers-client"

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const session = await auth()
  
  if (!session || !session.user.shopId) {
    redirect("/login")
  }

  const customers = await prisma.customer.findMany({
    where: { shopId: session.user.shopId },
    orderBy: { fullName: 'asc' }
  })

  return <CustomersClient initialCustomers={customers} currentUserName={session.user.name} userRole={session.user.role} />
}
