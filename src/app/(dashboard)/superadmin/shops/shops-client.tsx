"use client"

import { useState } from "react"
import { Store, Trash2, ShieldAlert, CheckCircle, Search, Plus, Edit, Key, ChevronLeft, ChevronRight, ArchiveRestore, AlertTriangle } from "lucide-react"
import { softDeleteShopAction, restoreShopAction, permanentDeleteShopAction, toggleShopStatusAction, createShopAction, editShopAdminAction, resetShopAdminPasswordAction, editShopAction } from "@/app/actions/superadmin"
import { toast } from "sonner"

interface Shop {
  id: string
  name: string
  status: string
  adminId: string
  adminName: string
  adminEmail: string
  adminPhone?: string
  productsCount: number
  salesCount: number
  createdAt: string
}

export function ShopsClient({ shops: initialShops }: { shops: Shop[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editAdmin, setEditAdmin] = useState<Shop | null>(null)
  const [editShop, setEditShop] = useState<Shop | null>(null)
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "RECYCLE_BIN">("ACTIVE")
  
  const [isLoading, setIsLoading] = useState(false)

  // Phone states for create shop
  const [createCountryCode, setCreateCountryCode] = useState("+250")
  const [createPhoneNumber, setCreatePhoneNumber] = useState("")

  // Phone states for edit admin
  const [editCountryCode, setEditCountryCode] = useState("+250")
  const [editPhoneNumber, setEditPhoneNumber] = useState("")

  // Actions
  async function handleEditShop(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append("shopId", editShop!.id)
    
    const result = await editShopAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      setEditShop(null)
      toast.success("Shop updated successfully.")
    }
    setIsLoading(false)
  }
  async function handleCreateShop(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await createShopAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsCreateOpen(false)
      ;(e.target as HTMLFormElement).reset()
      toast.success("Shop created successfully.")
    }
    setIsLoading(false)
  }

  async function handleEditAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append("userId", editAdmin!.adminId)
    
    const result = await editShopAdminAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      setEditAdmin(null)
      toast.success("Admin updated successfully.")
    }
    setIsLoading(false)
  }

  async function handleResetPassword(userId: string) {
    setIsLoading(true)
    const result = await resetShopAdminPasswordAction(userId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Password reset to shop@123 successfully!")
    }
    setIsLoading(false)
  }

  async function handleSoftDelete(shopId: string) {
    setIsLoading(true)
    const result = await softDeleteShopAction(shopId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Shop moved to Recycle Bin.")
    }
    setIsLoading(false)
  }

  async function handleRestore(shopId: string) {
    setIsLoading(true)
    const result = await restoreShopAction(shopId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Shop restored successfully.")
    }
    setIsLoading(false)
  }

  async function handlePermanentDelete(shopId: string) {
    setIsLoading(true)
    const result = await permanentDeleteShopAction(shopId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setConfirmPermanentDelete(null)
      toast.success("Shop permanently deleted.")
    }
    setIsLoading(false)
  }

  async function handleToggleStatus(shopId: string, currentStatus: string) {
    setIsLoading(true)
    await toggleShopStatusAction(shopId, currentStatus)
    toast.success(`Shop ${currentStatus === "ACTIVE" ? "suspended" : "activated"} successfully.`)
    setIsLoading(false)
  }

  // Filter by tab
  const tabFilteredShops = initialShops.filter(s => 
    activeTab === "ACTIVE" ? s.status !== "DELETED" : s.status === "DELETED"
  )

  // Pagination logic
  const filteredShops = tabFilteredShops.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(filteredShops.length / itemsPerPage)
  const paginatedShops = filteredShops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Shops</h1>
          <p className="text-muted-foreground mt-2">
            View, edit, or delete registered tenant shops.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Create New Shop
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Registered Shops
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex bg-background border rounded-lg p-1">
              <button
                onClick={() => { setActiveTab("ACTIVE"); setCurrentPage(1) }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "ACTIVE" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
              >
                Active Shops
              </button>
              <button
                onClick={() => { setActiveTab("RECYCLE_BIN"); setCurrentPage(1) }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "RECYCLE_BIN" ? "bg-red-500 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
              >
                Recycle Bin
              </button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search shops..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Shop Details</th>
                <th className="px-6 py-4 font-medium">Primary Admin</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedShops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No shops found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col group/shop">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-base">{shop.name}</p>
                          <button 
                            onClick={() => setEditShop(shop)}
                            className="p-1 text-muted-foreground hover:text-primary opacity-0 group-hover/shop:opacity-100 transition-opacity rounded-md"
                            title="Edit Shop"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">ID: {shop.id.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between group/admin">
                        <div>
                          <p className="font-medium">{shop.adminName}</p>
                          <p className="text-muted-foreground text-xs">{shop.adminEmail}</p>
                          <p className="text-muted-foreground text-xs">{shop.adminPhone}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/admin:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditAdmin(shop)
                              const initialCC = shop.adminPhone && shop.adminPhone.startsWith("+") 
                                ? (shop.adminPhone.match(/^\+\d{1,4}/) || ["+250"])[0] 
                                : "+250"
                              const initialNumber = shop.adminPhone ? shop.adminPhone.replace(initialCC, "") : ""
                              setEditCountryCode(initialCC)
                              setEditPhoneNumber(initialNumber)
                            }}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Edit Admin"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleResetPassword(shop.adminId)}
                            disabled={isLoading}
                            className="p-1.5 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-md transition-colors disabled:opacity-50"
                            title="Reset Password to shop@123"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs"><span className="font-medium">{shop.productsCount}</span> Products</p>
                      <p className="text-xs text-muted-foreground mt-1"><span className="font-medium text-foreground">{shop.salesCount}</span> Sales</p>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === "RECYCLE_BIN" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400">
                          <Trash2 className="h-3 w-3" />
                          DELETED
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          shop.status === "ACTIVE" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400" 
                            : "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400"
                        }`}>
                          {shop.status === "ACTIVE" ? <CheckCircle className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                          {shop.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {activeTab === "ACTIVE" ? (
                          <>
                            <button
                              onClick={() => handleToggleStatus(shop.id, shop.status)}
                              disabled={isLoading}
                              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 ${
                                shop.status === "ACTIVE" 
                                  ? "text-orange-600 hover:bg-orange-500/10" 
                                  : "text-emerald-600 hover:bg-emerald-500/10"
                              }`}
                            >
                              {shop.status === "ACTIVE" ? "Suspend" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleSoftDelete(shop.id)}
                              disabled={isLoading}
                              className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Delete Shop"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(shop.id)}
                              disabled={isLoading}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors disabled:opacity-50"
                            >
                              <ArchiveRestore className="h-3.5 w-3.5" />
                              Restore
                            </button>
                            <button
                              onClick={() => setConfirmPermanentDelete(shop.id)}
                              disabled={isLoading}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Delete Permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Permanent Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredShops.length)}</span> of <span className="font-medium">{filteredShops.length}</span> shops
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border bg-background hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border bg-background hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Create New Shop & Admin</h2>
            <form onSubmit={handleCreateShop} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shop Name</label>
                <input required name="shopName" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Downtown Coffee Co." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Full Name</label>
                <input required name="adminName" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <input required name="adminEmail" type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. john@downtowncoffee.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Phone</label>
                <div className="flex items-center w-full rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary">
                  <select 
                    value={createCountryCode}
                    onChange={(e) => setCreateCountryCode(e.target.value)}
                    className="h-10 bg-transparent border-none text-sm font-medium focus:outline-none pl-2 max-w-[140px] truncate"
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
                    <option value="+239">+239 (Sao Tome and Principe)</option>
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
                  <input 
                    type="tel" 
                    value={createPhoneNumber}
                    onChange={(e) => setCreatePhoneNumber(e.target.value)}
                    placeholder="781234567"
                    className="flex h-10 w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none" 
                  />
                  <input type="hidden" name="adminPhone" value={createPhoneNumber ? `${createCountryCode}${createPhoneNumber}` : ""} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Password</label>
                <input required name="adminPassword" type="password" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Minimum 6 characters" />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-1">Edit Shop Admin</h2>
            <p className="text-sm text-muted-foreground mb-4">Update details for {editAdmin.name}</p>
            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Full Name</label>
                <input required name="name" type="text" defaultValue={editAdmin.adminName} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <input required name="email" type="email" defaultValue={editAdmin.adminEmail} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Phone</label>
                <div className="flex items-center w-full rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary">
                  <select 
                    value={editCountryCode}
                    onChange={(e) => setEditCountryCode(e.target.value)}
                    className="h-10 bg-transparent border-none text-sm font-medium focus:outline-none pl-2 max-w-[140px] truncate"
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
                    <option value="+239">+239 (Sao Tome and Principe)</option>
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
                  <input 
                    type="tel" 
                    value={editPhoneNumber}
                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                    placeholder="781234567"
                    className="flex h-10 w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none" 
                  />
                  <input type="hidden" name="phone" value={editPhoneNumber ? `${editCountryCode}${editPhoneNumber}` : ""} />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditAdmin(null)}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-1">Edit Shop Details</h2>
            <p className="text-sm text-muted-foreground mb-4">Update details for {editShop.name}</p>
            <form onSubmit={handleEditShop} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shop Name</label>
                <input required name="shopName" type="text" defaultValue={editShop.name} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditShop(null)}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {confirmPermanentDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-lg border border-red-500/20 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle className="h-8 w-8" />
              <h2 className="text-xl font-bold">Warning</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you absolutely sure? This will permanently destroy all data (products, sales, users) for this shop. This action <strong>cannot</strong> be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setConfirmPermanentDelete(null)}
                className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => handlePermanentDelete(confirmPermanentDelete)}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
