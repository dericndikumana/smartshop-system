"use client"

import { useState } from "react"
import { Users, Plus, Search } from "lucide-react"
import { createCustomerAction, editCustomerAction, deleteCustomerAction } from "@/app/actions/customers"
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

export function CustomersClient({ initialCustomers, userRole, currentUserName }: { initialCustomers: Customer[], userRole: string, currentUserName?: string }) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countryCode, setCountryCode] = useState("+250")
  const customers = initialCustomers

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  )

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState<"new" | "edit">("new")

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

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return
    setIsLoading(true)
    const result = await deleteCustomerAction(id)
    if (result.success) {
      toast.success("Customer deleted")
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
          onClick={() => {
            setActiveTab("new")
            setEditingCustomer(null)
            setIsModalOpen(true)
          }}
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

        {/* Mobile View */}
        <div className="flex md:hidden flex-col gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              No customers found.
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div key={customer.id} className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 w-full">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 ${getInitialsColor(customer.fullName)}`}>
                    {customer.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{customer.fullName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{customer.phone || "No phone"}</p>
                  </div>
                </div>
                {userRole !== "CASHIER" && customer.fullName !== currentUserName && (
                  <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        setEditingCustomer(customer)
                        setActiveTab("edit")
                        let cCode = "+250"
                        let phoneNum = customer.phone || ""
                        if (phoneNum.startsWith("+")) {
                          const match = phoneNum.match(/^(\+\d{1,4})(.*)$/)
                          if (match) {
                            cCode = match[1]
                            phoneNum = match[2]
                          }
                        }
                        setCountryCode(cCode)
                        setIsModalOpen(true)
                      }}
                      className="px-3 py-1.5 text-sm font-medium bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors flex items-center gap-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="px-3 py-1.5 text-sm font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto bg-card border rounded-xl shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b text-[17px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium w-12">#</th>
                <th className="px-4 py-3 font-medium">Customer Name</th>
                <th className="px-4 py-3 font-medium">Phone Number</th>
                {userRole !== "CASHIER" && (
                  <th className="px-4 py-3 font-medium text-right w-32">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={userRole !== "CASHIER" ? 4 : 3} className="px-4 py-8 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/20 text-[17px]">
                    <td className="px-4 py-2 text-muted-foreground font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 font-medium">{customer.fullName}</td>
                    <td className="px-4 py-2 text-muted-foreground">{customer.phone || "No phone"}</td>
                    {userRole !== "CASHIER" && customer.fullName !== currentUserName && (
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingCustomer(customer)
                              setActiveTab("edit")
                              let cCode = "+250"
                              let phoneNum = customer.phone || ""
                              if (phoneNum.startsWith("+")) {
                                const match = phoneNum.match(/^(\+\d{1,4})(.*)$/)
                                if (match) {
                                  cCode = match[1]
                                  phoneNum = match[2]
                                }
                              }
                              setCountryCode(cCode)
                              setIsModalOpen(true)
                            }}
                            className="px-2 py-1 text-xs font-bold bg-teal-50 text-teal-600 rounded hover:bg-teal-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded text-xs font-bold px-2 flex items-center gap-1 transition-colors"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                    {userRole !== "CASHIER" && customer.fullName === currentUserName && (
                      <td className="px-4 py-2 text-right">
                        <span className="text-xs text-muted-foreground italic px-2 py-1">Owner</span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-bold mb-4">{activeTab === "new" ? "Add Customer" : "Edit Customer"}</h2>
            <form onSubmit={activeTab === "new" ? handleCreateCustomer : handleEditCustomer} className="space-y-4">
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
                    <option value="+213">+213 (Algeria)</option>
                    <option value="+244">+244 (Angola)</option>
                    <option value="+229">+229 (Benin)</option>
                    <option value="+267">+267 (Botswana)</option>
                    <option value="+226">+226 (Burkina Faso)</option>
                    <option value="+257">+257 (Burundi)</option>
                    <option value="+237">+237 (Cameroon)</option>
                    <option value="+238">+238 (Cape Verde)</option>
                    <option value="+236">+236 (Central African Republic)</option>
                    <option value="+235">+235 (Chad)</option>
                    <option value="+269">+269 (Comoros)</option>
                    <option value="+242">+242 (Congo)</option>
                    <option value="+243">+243 (DR Congo)</option>
                    <option value="+253">+253 (Djibouti)</option>
                    <option value="+20">+20 (Egypt)</option>
                    <option value="+240">+240 (Equatorial Guinea)</option>
                    <option value="+291">+291 (Eritrea)</option>
                    <option value="+268">+268 (Eswatini)</option>
                    <option value="+251">+251 (Ethiopia)</option>
                    <option value="+241">+241 (Gabon)</option>
                    <option value="+220">+220 (Gambia)</option>
                    <option value="+233">+233 (Ghana)</option>
                    <option value="+224">+224 (Guinea)</option>
                    <option value="+245">+245 (Guinea-Bissau)</option>
                    <option value="+225">+225 (Ivory Coast)</option>
                    <option value="+254">+254 (Kenya)</option>
                    <option value="+266">+266 (Lesotho)</option>
                    <option value="+231">+231 (Liberia)</option>
                    <option value="+218">+218 (Libya)</option>
                    <option value="+261">+261 (Madagascar)</option>
                    <option value="+265">+265 (Malawi)</option>
                    <option value="+223">+223 (Mali)</option>
                    <option value="+222">+222 (Mauritania)</option>
                    <option value="+230">+230 (Mauritius)</option>
                    <option value="+212">+212 (Morocco)</option>
                    <option value="+258">+258 (Mozambique)</option>
                    <option value="+264">+264 (Namibia)</option>
                    <option value="+227">+227 (Niger)</option>
                    <option value="+234">+234 (Nigeria)</option>
                    <option value="+250">+250 (Rwanda)</option>
                    <option value="+239">+239 (Sao Tome)</option>
                    <option value="+221">+221 (Senegal)</option>
                    <option value="+248">+248 (Seychelles)</option>
                    <option value="+232">+232 (Sierra Leone)</option>
                    <option value="+252">+252 (Somalia)</option>
                    <option value="+27">+27 (South Africa)</option>
                    <option value="+211">+211 (South Sudan)</option>
                    <option value="+249">+249 (Sudan)</option>
                    <option value="+255">+255 (Tanzania)</option>
                    <option value="+228">+228 (Togo)</option>
                    <option value="+216">+216 (Tunisia)</option>
                    <option value="+256">+256 (Uganda)</option>
                    <option value="+260">+260 (Zambia)</option>
                    <option value="+263">+263 (Zimbabwe)</option>
                  </select>
                  <input name="phoneInput" type="tel" defaultValue={editingCustomer?.phone ? editingCustomer.phone.replace(/^\+\d{1,4}/, '') : ''} className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="788 123 456" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
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
