"use client"

import { useState } from "react"
import { updateShopSettingsAction } from "@/app/actions/shop-settings"
import { Store, Percent } from "lucide-react"
import { toast } from "sonner"

export function ShopSettingsClient({ 
  initialShopName,
  initialPhone,
  initialVat, 
  isVatEnabled,
  initialPrefix 
}: { 
  initialShopName: string
  initialPhone: string
  initialVat: number
  isVatEnabled: boolean
  initialPrefix: string 
}) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateShopSettingsAction(formData)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success("Shop settings updated successfully.")
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
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-sm">
        
        <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Store className="h-4 w-4 text-primary" />
            General Information
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shop Name (Displayed on Receipts)</label>
            <input 
              name="shopName"
              type="text" 
              required
              defaultValue={initialShopName}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shop Phone (Displayed on Receipts)</label>
            <input 
              name="shopPhone"
              type="text" 
              defaultValue={initialPhone}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
            />
          </div>
        </div>

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
