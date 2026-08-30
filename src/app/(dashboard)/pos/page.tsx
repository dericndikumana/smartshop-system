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

    // Fetch customers
    const customers = await prisma.customer.findMany({
      where: { shopId: session.user.shopId },
      orderBy: { fullName: 'asc' }
    })

    const serializedProducts = products.map(p => ({
      id: p.id,
      name: p.name || "Unknown",
      sellingPrice: Number(p.sellingPrice || 0),
      currency: p.currency || "RWF",
      quantity: Number(p.quantity || 0),
    }))

    const serializedCustomers = customers.map(c => ({
      id: c.id,
      fullName: c.fullName
    }))

    return (
      <POSClient 
        products={serializedProducts} 
        customers={serializedCustomers}
        vatRate={Number(vatSetting?.isEnabled ? vatSetting.rate : 0)}
      />
    )
  } catch (error) {
    return (
      <div className="p-10 bg-red-50 text-red-500 font-mono text-sm break-all overflow-auto h-screen">
        <h1 className="text-xl font-bold mb-4">CRITICAL SERVER ERROR (POS)</h1>
        <p><strong>Error Message:</strong> {error instanceof Error ? error.message : String(error)}</p>
        <pre className="mt-4 p-4 bg-red-100 rounded">{error instanceof Error ? error.stack : ''}</pre>
      </div>
    )
  }
}
