"use client"

import { useState } from "react"
import { Search, HandCoins } from "lucide-react"
import { payLoanAction } from "@/app/actions/debt"
import { toast } from "sonner"
import { useTranslation } from "@/components/providers/language-provider"

interface CustomerLoan {
  id: string
  fullName: string
  phone: string | null
  balance: number
}

export function LoansClient({ initialCustomers }: { initialCustomers: CustomerLoan[] }) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLoan | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error(t("pos_page.invalid_quantity") || "Please enter a valid amount")
      return
    }

    setIsPaying(true)
    const result = await payLoanAction({
      customerId: selectedCustomer.id,
      amountPaid: amount
    })
    
    if (result.success) {
      toast.success(`Refund of ${amount} RWF processed for ${selectedCustomer.fullName}`)
      setSelectedCustomer(null)
      setPaymentAmount("")
    } else {
      toast.error(result.error)
    }
    setIsPaying(false)
  }

  const filteredCustomers = initialCustomers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  )

  return (
    <div className="flex flex-col gap-4 animate-in fade-in pb-32">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-500">{t("loans_page.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("loans_page.subtitle")}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder={t("loans_page.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 rounded-xl border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
        />
      </div>

      <div className="grid gap-4 mt-2">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
            {t("loans_page.no_loans")}
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-card border shadow-sm gap-4 hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-lg">{customer.fullName}</h3>
                <p className="text-sm text-muted-foreground">{customer.phone || "No phone number"}</p>
              </div>
              <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                <div className="text-right">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("loans_page.credit_owe")}
                  </p>
                  <p className="font-bold text-xl text-emerald-500">
                    {Math.abs(customer.balance).toLocaleString()} RWF
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCustomer(customer)}
                  className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <HandCoins className="h-5 w-5" />
                  {t("loans_page.refund")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-1">{t("loans_page.process_refund")}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("loans_page.refund_desc").replace("{0}", selectedCustomer.fullName)}
            </p>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{t("loans_page.current_credit")}</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.abs(selectedCustomer.balance).toLocaleString()} RWF
              </p>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("loans_page.refund_amount")}</label>
                <input 
                  autoFocus
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`e.g. ${Math.abs(selectedCustomer.balance)}`}
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedCustomer(null)
                    setPaymentAmount("")
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  {t("loans_page.cancel")}
                </button>
                <button 
                  type="submit" 
                  disabled={isPaying || !paymentAmount}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isPaying ? t("loans_page.processing") : t("loans_page.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
