import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { language } = body

    if (language !== "en" && language !== "rw") {
      return NextResponse.json({ success: false, error: "Invalid language" }, { status: 400 })
    }

    // Update in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { language }
    })

    return NextResponse.json({ success: true, language })
  } catch (error) {
    console.error("Set Language Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
