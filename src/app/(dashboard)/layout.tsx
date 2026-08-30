import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ForceLogout } from "@/components/auth/force-logout"
import { SessionGuard } from "@/components/auth/session-guard"

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
    select: { status: true, shopId: true, shop: { select: { status: true, name: true } } }
  })

  if (!dbUser || dbUser.status === "BLOCKED" || dbUser.status === "INACTIVE" || dbUser.shop?.status === "BLOCKED") {
    return <ForceLogout />
  }

  const shopName = dbUser.shop?.name

  return (
    <DashboardShell user={session.user} shopName={shopName}>
      <SessionGuard />
      {children}
    </DashboardShell>
  )
}
