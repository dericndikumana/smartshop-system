import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ suspended: false })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true, shop: { select: { status: true } } }
  })

  if (!user || user.status === "BLOCKED" || user.status === "INACTIVE" || user.shop?.status === "BLOCKED") {
    return NextResponse.json({ suspended: true })
  }

  return NextResponse.json({ suspended: false })
}
