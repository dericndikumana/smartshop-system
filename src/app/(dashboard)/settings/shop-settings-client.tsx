"use client"

import { useState } from "react"
import { updateShopSettingsAction } from "@/app/actions/shop-settings"
import { Store, Percent } from "lucide-react"

export function ShopSettingsClient({ 
  initialVat, 
  isVatEnabled,
  initialPrefix 
}: { 
  initialVat: number
  isVatEnabled: boolean
  initialPrefix: string 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateShopSettingsAction(formData)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess("Shop settings updated successfully.")
    }
    
    setIsLoading(false)
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-primary flex items-center gap-2">
        <Store className="h-5 w-5" />
        Store Configuration
      </h3>
      <p className="text-sm text-muted-foreground mb-6">Manage global settings for your shop tenant.</p>
      
      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-sm">
        
        <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Percent className="h-4 w-4 text-primary" />
            Tax & VAT Settings
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isVatEnabled" 
              name="isVatEnabled" 
              defaultChecked={isVatEnabled}
              className="rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="isVatEnabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Enable VAT Collection
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Standard VAT Rate (%)</label>
            <input 
              name="vatRate"
              type="number" 
              step="0.1"
              min="0"
              defaultValue={initialVat}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
          <div className="flex items-center gap-2 font-medium text-foreground">
            Receipt Settings
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Receipt Prefix</label>
            <input 
              name="receiptPrefix"
              type="text" 
              placeholder="e.g. INV-"
              defaultValue={initialPrefix}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary uppercase" 
            />
            <p className="text-xs text-muted-foreground">Receipts will look like {initialPrefix}000123</p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 w-full"
        >
          {isLoading ? "Saving..." : "Save Configuration"}
        </button>
      </form>
    </div>
  )
}
