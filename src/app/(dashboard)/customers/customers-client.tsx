"use client"

import { useState } from "react"
import { Users, Plus, Search, Trash2, Save } from "lucide-react"
import { createCustomerAction, deleteCustomerAction, editCustomerAction } from "@/app/actions/customers"
import { toast } from "sonner"
import { useTranslation } from "@/components/providers/language-provider"

interface Customer {
  id: string
  fullName: string
  phone?: string | null
  balance?: number
}

const getInitialsColor = (name: string) => {
  const colors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", 
    "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", 
    "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", 
    "bg-pink-500", "bg-rose-500"
  ]
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export function CustomersClient({ customers }: { customers: Customer[] }) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countryCode, setCountryCode] = useState("+250")
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  )

  const handleCreateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const rawPhone = formData.get("phoneInput") as string
    
    if (rawPhone) {
      formData.set("phone", `${countryCode}${rawPhone}`)
    }
    
    const result = await createCustomerAction(formData)
    
    if (result.success) {
      toast.success("Customer created successfully")
      setIsModalOpen(false)
    } else {
      toast.error(result.error || "Failed to create customer")
    }
    
    setIsLoading(false)
  }

  const handleEditCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCustomer) return
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const rawPhone = formData.get("phoneInput") as string
    
    if (rawPhone) {
      formData.set("phone", `${countryCode}${rawPhone}`)
    }
    
    const result = await editCustomerAction(editingCustomer.id, formData)
    
    if (result.success) {
      toast.success("Customer updated successfully")
      setIsModalOpen(false)
      setEditingCustomer(null)
    } else {
      toast.error(result.error || "Failed to update customer")
    }
    
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    setIsLoading(true)
    const result = await deleteCustomerAction(id)
    if (result.success) {
      toast.success("Customer deleted successfully")
    } else {
      toast.error(result.error || "Failed to delete customer")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.customer_info")}</h1>
          <p className="text-muted-foreground mt-2">Manage your customers and contact information.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Add Customer
        </button>
      </div>

      <div className="relative w-full mb-2">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 rounded-xl border bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
        />
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mt-4">
        <div className="flex flex-col gap-0">
          {filteredCustomers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border-dashed">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              No customers found.
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div key={customer.id} className="bg-card border-b last:border-b-0 py-4 px-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 ${getInitialsColor(customer.fullName)}`}>
                    {customer.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{customer.fullName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{customer.phone || "No phone"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(customer.id)}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete Customer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCustomer(customer)
                      setIsModalOpen(true)
                    }}
                    className="text-[#f57c00] hover:text-[#f57c00]/80 transition-colors"
                    title="Edit Customer"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-bold mb-4">{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>
            <form onSubmit={editingCustomer ? handleEditCustomer : handleCreateCustomer} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input required name="fullName" type="text" defaultValue={editingCustomer?.fullName} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="flex gap-2">
                  <select 
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="rounded-md border bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-32"
                  >
                    <option value="+213">+213 (DZ)</option>
                    <option value="+244">+244 (AO)</option>
                    <option value="+229">+229 (BJ)</option>
                    <option value="+267">+267 (BW)</option>
                    <option value="+226">+226 (BF)</option>
                    <option value="+257">+257 (BI)</option>
                    <option value="+237">+237 (CM)</option>
                    <option value="+238">+238 (CV)</option>
                    <option value="+236">+236 (CF)</option>
                    <option value="+235">+235 (TD)</option>
                    <option value="+269">+269 (KM)</option>
                    <option value="+242">+242 (CG)</option>
                    <option value="+243">+243 (CD)</option>
                    <option value="+253">+253 (DJ)</option>
                    <option value="+20">+20 (EG)</option>
                    <option value="+240">+240 (GQ)</option>
                    <option value="+291">+291 (ER)</option>
                    <option value="+268">+268 (SZ)</option>
                    <option value="+251">+251 (ET)</option>
                    <option value="+241">+241 (GA)</option>
                    <option value="+220">+220 (GM)</option>
                    <option value="+233">+233 (GH)</option>
                    <option value="+224">+224 (GN)</option>
                    <option value="+245">+245 (GW)</option>
                    <option value="+225">+225 (CI)</option>
                    <option value="+254">+254 (KE)</option>
                    <option value="+266">+266 (LS)</option>
                    <option value="+231">+231 (LR)</option>
                    <option value="+218">+218 (LY)</option>
                    <option value="+261">+261 (MG)</option>
                    <option value="+265">+265 (MW)</option>
                    <option value="+223">+223 (ML)</option>
                    <option value="+222">+222 (MR)</option>
                    <option value="+230">+230 (MU)</option>
                    <option value="+212">+212 (MA)</option>
                    <option value="+258">+258 (MZ)</option>
                    <option value="+264">+264 (NA)</option>
                    <option value="+227">+227 (NE)</option>
                    <option value="+234">+234 (NG)</option>
                    <option value="+250">+250 (RW)</option>
                    <option value="+239">+239 (ST)</option>
                    <option value="+221">+221 (SN)</option>
                    <option value="+248">+248 (SC)</option>
                    <option value="+232">+232 (SL)</option>
                    <option value="+252">+252 (SO)</option>
                    <option value="+27">+27 (ZA)</option>
                    <option value="+211">+211 (SS)</option>
                    <option value="+249">+249 (SD)</option>
                    <option value="+255">+255 (TZ)</option>
                    <option value="+228">+228 (TG)</option>
                    <option value="+216">+216 (TN)</option>
                    <option value="+256">+256 (UG)</option>
                    <option value="+260">+260 (ZM)</option>
                    <option value="+263">+263 (ZW)</option>
                  </select>
                  <input name="phoneInput" type="tel" defaultValue={editingCustomer?.phone?.replace(countryCode, "")} className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="788 123 456" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingCustomer(null)
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
