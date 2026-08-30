import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { SuperAdminClient } from "@/app/(dashboard)/superadmin/superadmin-client"

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const session = await auth()
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login")
  }

  // Fetch real data
  const totalShops = await prisma.shop.count()
  const totalAdmins = await prisma.user.count({
    where: { role: { name: "SHOP_ADMIN" } }
  })
  
  const allAdmins = await prisma.user.findMany({
    where: { role: { name: "SHOP_ADMIN" } },
    include: { shop: true },
    orderBy: { createdAt: 'desc' }
  })

  // Format data for the client component
  const stats = [
    { label: "Total Tenants (Shops)", value: totalShops.toString() },
    { label: "Total Shop Admins", value: totalAdmins.toString() },
    { label: "System Health", value: "Optimal" },
    { label: "Active Sessions", value: "N/A" } // NextAuth doesn't track active JWT sessions by default
  ]

  const mappedAdmins = allAdmins.map((admin: any) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    shopName: admin.shop?.name || "Unassigned",
    status: admin.status
  }))

  return <SuperAdminClient stats={stats} admins={mappedAdmins} currentUserId={session.user.id} />
}
