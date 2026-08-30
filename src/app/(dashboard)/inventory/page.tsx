import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { InventoryClient } from "./inventory-client"

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const session = await auth()
  
  if (!session || !session.user.shopId) {
    redirect("/login")
  }

  const products = await prisma.product.findMany({
    where: { shopId: session.user.shopId },
    orderBy: { createdAt: 'desc' }
  })

  const serializedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    sellingPrice: Number(p.sellingPrice),
    currency: p.currency,
    quantity: p.quantity,
    minStock: Number(p.minStock),
  }))

  // We are not uploading images, just passing data
  return <InventoryClient products={serializedProducts} />
}
