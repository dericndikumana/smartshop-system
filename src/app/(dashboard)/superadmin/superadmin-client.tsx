"use client"

import { Store, ShieldAlert, CheckCircle } from "lucide-react"
import { toggleUserStatusAction } from "@/app/actions/superadmin"
import { toast } from "sonner"
import { useTranslation } from "@/components/providers/language-provider"

interface SuperAdminClientProps {
  stats: { label: string; value: string }[]
  admins: {
    id: string
    name: string
    email: string
    shopName: string
    status: string
  }[]
  currentUserId: string
}

export function SuperAdminClient({ stats, admins, currentUserId }: SuperAdminClientProps) {
  const { t } = useTranslation()

  async function handleToggleStatus(userId: string, currentStatus: string) {
    if (userId === currentUserId) return
    try {
      await toggleUserStatusAction(userId, currentStatus)
      toast.success(`Admin ${currentStatus === "ACTIVE" ? "suspended" : "activated"} successfully.`)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("superadmin.system_overview")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("superadmin.system_desc")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col max-h-[400px]">
        <div className="p-6 border-b border-border/50 bg-muted/10 shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            {t("superadmin.registered_admins")}
          </h2>
        </div>
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs sticky top-0 z-10 shadow-sm border-b">
              <tr>
                <th className="px-6 py-4 font-medium">{t("superadmin.name")}</th>
                <th className="px-6 py-4 font-medium">{t("superadmin.email")}</th>
                <th className="px-6 py-4 font-medium">{t("superadmin.shop_assigned")}</th>
                <th className="px-6 py-4 font-medium">{t("common.status")}</th>
                <th className="px-6 py-4 font-medium text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    {t("superadmin.no_shops")}
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{admin.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {admin.shopName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        admin.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}>
                        {admin.status === "ACTIVE" ? <CheckCircle className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {admin.status === "ACTIVE" ? t("common.active") : t("common.blocked")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {admin.id !== currentUserId && (
                        <button
                          onClick={() => handleToggleStatus(admin.id, admin.status)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                            admin.status === "ACTIVE" 
                              ? "text-red-600 hover:bg-red-500/10" 
                              : "text-emerald-600 hover:bg-emerald-500/10"
                          }`}
                        >
                          {admin.status === "ACTIVE" ? t("superadmin.suspend") : t("superadmin.activate")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
