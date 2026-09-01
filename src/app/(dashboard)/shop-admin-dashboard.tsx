"use client"

import { Receipt, DollarSign, Package, Users, Activity } from "lucide-react"
import { useTranslation } from "@/components/providers/language-provider"

interface ShopAdminDashboardProps {
  stats: {
    totalProducts: number
    totalCustomers: number
    todaySalesCount: number // Kept variable name the same for compatibility, but it represents all-time now
  }
  revenueByCurrency: Record<string, number>
}

export function ShopAdminDashboard({ stats, revenueByCurrency }: ShopAdminDashboardProps) {
  const { t } = useTranslation()
  const currencies = Object.keys(revenueByCurrency)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.admin_title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('dashboard.admin_subtitle')}
        </p>
      </div>
      
      {/* Top Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">{t('dashboard.total_sales')}</h3>
          </div>
          <p className="text-2xl font-bold">{stats.todaySalesCount}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">{t('dashboard.total_products')}</h3>
          </div>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">{t('pos_page.customer_optional').split('(')[0].trim()}</h3>
          </div>
          <p className="text-2xl font-bold">{stats.totalCustomers}</p>
        </div>
      </div>
      
      {/* Revenue Breakdown */}
      <h2 className="text-xl font-bold mt-4 border-b pb-2">{t('dashboard.total_revenue').replace('{0}', '')}</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {currencies.map(currency => (
          <div key={currency} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-sm">{t('dashboard.total_revenue').replace('{0}', currency)}</h3>
            </div>
            <p className="text-2xl font-bold text-primary">{currency} {revenueByCurrency[currency].toLocaleString()}</p>
          </div>
        ))}
        
        {currencies.length === 0 && (
          <div className="rounded-xl border border-dashed bg-muted/20 text-muted-foreground p-6 flex items-center justify-center col-span-full">
            {t('dashboard.no_sales')}
          </div>
        )}
      </div>

      {/* System Total Money (Aggregated visually but separated by currency since rates vary) */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 mt-4 max-w-md bg-primary/5 border-primary/20">
        <div className="flex items-center gap-2 text-muted-foreground mb-4 border-b border-primary/10 pb-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-sm text-primary">{t('reports_page.total_amount')}</h3>
        </div>
        <div className="flex flex-col gap-3">
          {currencies.length > 0 ? (
            currencies.map(currency => (
              <div key={`total-${currency}`} className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">{currency} {t('reports_page.total')}</span>
                <span className="text-xl font-bold">{revenueByCurrency[currency].toLocaleString()}</span>
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">{t('dashboard.no_sales')}</span>
          )}
        </div>
      </div>
    </div>
  )
}
