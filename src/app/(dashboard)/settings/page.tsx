import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { SettingsClient } from "./settings-client"
import { ShopSettingsClient } from "./shop-settings-client"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()

  if (!session) redirect("/login")

  let vatSetting = null
  let shopSetting = null
  let shopDetails = null

  if (session.user.role === "SHOP_ADMIN" && session.user.shopId) {
    vatSetting = await prisma.vatSetting.findUnique({ where: { shopId: session.user.shopId } })
    shopSetting = await prisma.shopSetting.findUnique({ where: { shopId: session.user.shopId } })
    shopDetails = await prisma.shop.findUnique({ where: { id: session.user.shopId } })
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and security.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {session.user.role === "SHOP_ADMIN" && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6">
            <ShopSettingsClient 
              initialShopName={shopDetails?.name || ""}
              initialVat={vatSetting?.rate || 0} 
              isVatEnabled={vatSetting?.isEnabled ?? false}
              initialPrefix={shopSetting?.receiptPrefix || "SC-"} 
            />
          </div>
        )}

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium">Profile Information</h3>
            <p className="text-sm text-muted-foreground mb-4">Your current session details.</p>
            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
              <div>
                <p className="font-medium text-muted-foreground">Email</p>
                <p className="font-semibold break-all">{session?.user?.email}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Role</p>
                <p className="font-semibold text-primary">{session?.user?.role}</p>
              </div>
            </div>
          </div>
          <SettingsClient 
            userRole={session.user.role || ""} 
            initialName={session.user.name || ""} 
            initialEmail={session.user.email || ""} 
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 mt-2">
        <h3 className="text-lg font-medium mb-4">Help & Support</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Need assistance or experiencing issues? Contact the System Administrator for help.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 font-medium bg-muted/20 p-4 rounded-lg border text-foreground">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">📞</span> 
            <span>+250781096567</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">✉️</span> 
            <span>ndikumanaderic2@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
