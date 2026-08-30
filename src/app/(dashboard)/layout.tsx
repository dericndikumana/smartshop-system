import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  let shopName = undefined
  
  if (session?.user?.shopId) {
    const prisma = (await import("@/lib/prisma")).default
    const shop = await prisma.shop.findUnique({
      where: { id: session.user.shopId },
      select: { name: true }
    })
    shopName = shop?.name
  }

  return (
    <DashboardShell user={session.user} shopName={shopName}>
      {children}
    </DashboardShell>
  )
}
