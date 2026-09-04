"use client"

import { Receipt, DollarSign, Package } from "lucide-react"
import { useTranslation } from "@/components/providers/language-provider"

interface CashierDashboardProps {
  salesCount: number
  totalItemsSold: number
  revenueByCurrency: Record<string, number>
  allTimeRevenueByCurrency?: Record<string, number>
}

export function CashierDashboard({ salesCount, totalItemsSold, revenueByCurrency, allTimeRevenueByCurrency = {} }: CashierDashboardProps) {
  const { t } = useTranslation()
  const hasSales = salesCount > 0
  const currencies = Object.entries(revenueByCurrency)
  const allTimeCurrencies = Object.entries(allTimeRevenueByCurrency)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.cashier_title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('dashboard.cashier_subtitle')}
        </p>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">{t('dashboard.today_summary')}</h2>
        {hasSales ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Receipt className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-sm">{t('dashboard.total_transactions')}</h3>
              </div>
              <p className="text-2xl font-bold">{salesCount}</p>
            </div>
            
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-sm">{t('dashboard.items_sold')}</h3>
              </div>
              <p className="text-2xl font-bold">{totalItemsSold}</p>
            </div>

            {currencies.map(([currency, total]) => (
              <div key={currency} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-sm">{t('dashboard.revenue').replace('{0}', currency)}</h3>
                </div>
                <p className="text-2xl font-bold text-primary">{total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-12 text-center text-muted-foreground">
            {t('dashboard.no_sales')}
          </div>
        )}
      </div>

      {allTimeCurrencies.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">{t('dashboard.all_time_revenue')}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {allTimeCurrencies.map(([currency, total]) => (
              <div key={currency} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Total {currency}</h3>
                </div>
                <p className="text-2xl font-bold">{total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
