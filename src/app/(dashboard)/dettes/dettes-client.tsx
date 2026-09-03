"use client"

import { useState } from "react"
import { Search, CreditCard } from "lucide-react"
import { payDebtAction } from "@/app/actions/debt"
import { toast } from "sonner"

interface CustomerDebt {
  id: string
  fullName: string
  phone: string | null
  balance: number
}

export function DettesClient({ initialCustomers }: { initialCustomers: CustomerDebt[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDebt | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")

  const filteredCustomers = initialCustomers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  )

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsPaying(true)
    const result = await payDebtAction({
      customerId: selectedCustomer.id,
      amountPaid: amount
    })
    
    if (result.success) {
      toast.success(`Payment of ${amount} RWF applied to ${selectedCustomer.fullName}`)
      setSelectedCustomer(null)
      setPaymentAmount("")
    } else {
      toast.error(result.error)
    }
    setIsPaying(false)
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debt Management</h1>
          <p className="text-muted-foreground mt-2">Manage customers who owe you money.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 rounded-xl border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
        />
      </div>

      <div className="grid gap-4 mt-2">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
            No customers with debts found.
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
                    Owes You (Debt)
                  </p>
                  <p className="font-bold text-xl text-red-500">
                    {customer.balance.toLocaleString()} RWF
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCustomer(customer)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium flex items-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Pay Debt
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-bold mb-4">Receive Payment</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter the amount you received from <span className="font-bold text-foreground">{selectedCustomer.fullName}</span>.
              <br/>
              Current Debt: <span className="font-bold text-red-500">{selectedCustomer.balance.toLocaleString()} RWF</span>
            </p>
            
            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Received</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">RWF</span>
                  <input 
                    required 
                    type="number" 
                    min="1"
                    className="w-full pl-12 rounded-md border bg-background px-3 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                {paymentAmount && parseFloat(paymentAmount) > selectedCustomer.balance && (
                  <p className="text-sm text-emerald-500 font-medium">
                    Warning: Customer is overpaying. This will create a {(parseFloat(paymentAmount) - selectedCustomer.balance).toLocaleString()} RWF Loan balance in their favor.
                  </p>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedCustomer(null)
                    setPaymentAmount("")
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPaying}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isPaying ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
