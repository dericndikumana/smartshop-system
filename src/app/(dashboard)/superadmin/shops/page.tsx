import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ShopsClient } from "./shops-client"

export const dynamic = 'force-dynamic'

export default async function ManageShopsPage() {
  const session = await auth()
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login")
  }

  const shops = await prisma.shop.findMany({
    include: {
      users: {
        where: { role: { name: "SHOP_ADMIN" } }
      },
      _count: {
        select: { products: true, sales: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const mappedShops = shops.map(shop => ({
    id: shop.id,
    name: shop.name,
    status: shop.status,
    adminId: shop.users[0]?.id || "",
    adminName: shop.users[0]?.name || "No Admin",
    adminEmail: shop.users[0]?.email || "N/A",
    productsCount: shop._count.products,
    salesCount: shop._count.sales,
    createdAt: shop.createdAt.toISOString()
  }))

  return <ShopsClient shops={mappedShops} />
}
