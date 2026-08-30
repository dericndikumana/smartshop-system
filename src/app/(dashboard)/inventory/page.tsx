import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { InventoryClient } from "@/app/(dashboard)/inventory/inventory-client"
import { Product } from "@prisma/client"

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  try {
    const session = await auth()
    
    if (!session || !session.user.shopId) {
      redirect("/login")
    }

    const products = await prisma.product.findMany({
      where: { shopId: session.user.shopId },
      orderBy: { createdAt: 'desc' }
    })

    const serializedProducts = products.map((p: Product) => ({
      id: p.id,
      name: p.name || "Unknown",
      sellingPrice: Number(p.sellingPrice || 0),
      currency: p.currency || "RWF",
      quantity: Number(p.quantity || 0),
      minStock: Number(p.minStock || 0),
    }))

    return <InventoryClient products={serializedProducts} userRole={session.user.role} />
  } catch (error) {
    return (
      <div className="p-10 bg-red-50 text-red-500 font-mono text-sm break-all overflow-auto h-screen">
        <h1 className="text-xl font-bold mb-4">CRITICAL SERVER ERROR (INVENTORY)</h1>
        <p><strong>Error Message:</strong> {error instanceof Error ? error.message : String(error)}</p>
        <pre className="mt-4 p-4 bg-red-100 rounded">{error instanceof Error ? error.stack : ''}</pre>
      </div>
    )
  }
}
