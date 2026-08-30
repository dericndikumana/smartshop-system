import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { POSClient } from "./pos-client"

export const dynamic = 'force-dynamic'

export default async function POSPage() {
  try {
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
      name: p.name || "Unknown",
      sellingPrice: Number(p.sellingPrice || 0),
      currency: p.currency || "RWF",
      quantity: Number(p.quantity || 0),
    }))

    return (
      <POSClient 
        products={serializedProducts} 
        vatRate={Number(vatSetting?.isEnabled ? vatSetting.rate : 0)}
      />
    )
  } catch (error: any) {
    return (
      <div className="p-10 bg-red-50 text-red-500 font-mono text-sm break-all overflow-auto h-screen">
        <h1 className="text-xl font-bold mb-4">CRITICAL SERVER ERROR (POS)</h1>
        <p><strong>Error Message:</strong> {error?.message || String(error)}</p>
        <pre className="mt-4 p-4 bg-red-100 rounded">{error?.stack}</pre>
      </div>
    )
  }
}
