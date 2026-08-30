import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { POSClient } from "./pos-client"

export const dynamic = 'force-dynamic'

export default async function POSPage() {
  const session = await auth()
  
  if (!session || !session.user.shopId) {
    redirect("/login")
  }

  // Fetch only active products with stock > 0
  const products = await prisma.product.findMany({
    where: { 
      shopId: session.user.shopId,
      status: "IN_STOCK",
      quantity: { gt: 0 }
    },
    orderBy: { name: 'asc' }
  })

  // Fetch shop VAT settings
  const vatSetting = await prisma.vatSetting.findUnique({
    where: { shopId: session.user.shopId }
  })


  const serializedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    sellingPrice: p.sellingPrice,
    currency: p.currency,
    quantity: p.quantity,
  }))

  return (
    <POSClient 
      products={serializedProducts} 
      vatRate={vatSetting?.isEnabled ? vatSetting.rate : 0}
    />
  )
}
