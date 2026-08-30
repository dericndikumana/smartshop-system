import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ForceLogout } from "@/components/auth/force-logout"

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

  const prisma = (await import("@/lib/prisma")).default
  
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true, shopId: true }
  })

  if (!dbUser || dbUser.status === "BLOCKED" || dbUser.status === "INACTIVE") {
    return <ForceLogout />
  }

  let shopName = undefined
  if (dbUser.shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: dbUser.shopId },
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
