"use client"

import { useState } from "react"
import { updateShopSettingsAction } from "@/app/actions/shop-settings"
import { Store, Percent } from "lucide-react"
import { toast } from "sonner"

const africanCountryCodes = [
  { code: "+213", name: "Algeria" }, { code: "+244", name: "Angola" }, { code: "+229", name: "Benin" }, { code: "+267", name: "Botswana" },
  { code: "+226", name: "Burkina Faso" }, { code: "+257", name: "Burundi" }, { code: "+237", name: "Cameroon" }, { code: "+238", name: "Cape Verde" },
  { code: "+236", name: "Central African Republic" }, { code: "+235", name: "Chad" }, { code: "+269", name: "Comoros" }, { code: "+242", name: "Congo" },
  { code: "+243", name: "DR Congo" }, { code: "+253", name: "Djibouti" }, { code: "+20", name: "Egypt" }, { code: "+240", name: "Equatorial Guinea" },
  { code: "+291", name: "Eritrea" }, { code: "+268", name: "Eswatini" }, { code: "+251", name: "Ethiopia" }, { code: "+241", name: "Gabon" },
  { code: "+220", name: "Gambia" }, { code: "+233", name: "Ghana" }, { code: "+224", name: "Guinea" }, { code: "+245", name: "Guinea-Bissau" },
  { code: "+225", name: "Ivory Coast" }, { code: "+254", name: "Kenya" }, { code: "+266", name: "Lesotho" }, { code: "+231", name: "Liberia" },
  { code: "+218", name: "Libya" }, { code: "+261", name: "Madagascar" }, { code: "+265", name: "Malawi" }, { code: "+223", name: "Mali" },
  { code: "+222", name: "Mauritania" }, { code: "+230", name: "Mauritius" }, { code: "+212", name: "Morocco" }, { code: "+258", name: "Mozambique" },
  { code: "+264", name: "Namibia" }, { code: "+227", name: "Niger" }, { code: "+234", name: "Nigeria" }, { code: "+250", name: "Rwanda" },
  { code: "+239", name: "Sao Tome and Principe" }, { code: "+221", name: "Senegal" }, { code: "+248", name: "Seychelles" }, { code: "+232", name: "Sierra Leone" },
  { code: "+252", name: "Somalia" }, { code: "+27", name: "South Africa" }, { code: "+211", name: "South Sudan" }, { code: "+249", name: "Sudan" },
  { code: "+255", name: "Tanzania" }, { code: "+228", name: "Togo" }, { code: "+216", name: "Tunisia" }, { code: "+256", name: "Uganda" },
  { code: "+260", name: "Zambia" }, { code: "+263", name: "Zimbabwe" }
]

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
            <div className="flex gap-2">
              <select 
                name="countryCode" 
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-[140px]"
                defaultValue={initialPhone ? (africanCountryCodes.find(c => initialPhone.startsWith(c.code))?.code || "+250") : "+250"}
              >
                {africanCountryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} ({country.name})
                  </option>
                ))}
              </select>
              <input 
                name="phoneNumber"
                type="text" 
                placeholder="781234567"
                defaultValue={initialPhone ? initialPhone.replace(africanCountryCodes.find(c => initialPhone.startsWith(c.code))?.code || "", "") : ""}
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              />
            </div>
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
