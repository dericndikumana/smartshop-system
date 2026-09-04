import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsMenuClient } from "./settings-menu-client"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return <SettingsMenuClient userRole={session.user.role} userName={session.user.name || "USER"} />
}
