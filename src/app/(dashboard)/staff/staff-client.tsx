"use client"

import { useState } from "react"
import { toggleCashierStatusAction, deleteCashierAction, createCashierAction, editCashierAction } from "@/app/actions/staff"
import { Search, CheckCircle, ShieldAlert, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "@/components/providers/language-provider"

interface Cashier {
  id: string
  name: string
  email: string
  phone?: string | null
  status: string
  role: string
}

export function StaffClient({ cashiers: initialCashiers }: { cashiers: Cashier[] }) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editCashier, setEditCashier] = useState<Cashier | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredCashiers = initialCashiers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredCashiers.length / itemsPerPage)
  const paginatedCashiers = filteredCashiers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  async function handleEditCashier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append("userId", editCashier!.id)
    
    const result = await editCashierAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      setEditCashier(null)
      toast.success("Cashier updated successfully.")
    }
    
    setIsLoading(false)
  }

  async function handleCreateCashier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await createCashierAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsModalOpen(false)
      ;(e.target as HTMLFormElement).reset()
      toast.success("Cashier added successfully.")
    }
    
    setIsLoading(false)
  }

  async function handleToggleStatus(userId: string, currentStatus: string) {
    setIsLoading(true)
    await toggleCashierStatusAction(userId, currentStatus)
    toast.success(`Cashier ${currentStatus === "ACTIVE" ? "suspended" : "activated"} successfully.`)
    setIsLoading(false)
  }

  async function handleDelete(userId: string) {
    setIsLoading(true)
    await deleteCashierAction(userId)
    toast.success("Cashier deleted successfully.")
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={t('staff_page.search')} 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          {t('staff_page.add_cashier')}
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-[17px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium w-12">#</th>
                <th className="px-4 py-3 font-medium">{t('staff_page.col_name')}</th>
                <th className="px-4 py-3 font-medium">{t('staff_page.col_email')}</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">{t('staff_page.col_status')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('staff_page.col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCashiers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {t('staff_page.no_cashiers')}
                  </td>
                </tr>
              ) : (
                paginatedCashiers.map((cashier, index) => (
                  <tr key={cashier.id} className="border-b hover:bg-muted/20 text-[17px]">
                    <td className="px-4 py-3 text-muted-foreground font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{cashier.name}</td>
                    <td className="px-4 py-3">{cashier.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-600 border-blue-500/20">
                        {cashier.role === "CASHIER" ? "Shop Cashier" : "Stock Cashier"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        cashier.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}>
                        {cashier.status === "ACTIVE" ? <CheckCircle className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {cashier.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setEditCashier(cashier)}
                        disabled={isLoading}
                        className="text-xs font-medium px-3 py-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 mr-2"
                      >
                        {t('common.edit')}
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(cashier.id, cashier.status)}
                        disabled={isLoading}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors mr-2 ${
                          cashier.status === "ACTIVE" 
                            ? "text-orange-600 hover:bg-orange-500/10" 
                            : "text-emerald-600 hover:bg-emerald-500/10"
                        } disabled:opacity-50`}
                      >
                        {cashier.status === "ACTIVE" ? t('staff_page.suspend') : t('staff_page.activate')}
                      </button>
                      <button 
                        onClick={() => handleDelete(cashier.id)}
                        disabled={isLoading}
                        className="text-xs font-medium px-3 py-1.5 rounded-md text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        {t('staff_page.delete')}
                      </button>
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
              Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredCashiers.length)}</span> of <span className="font-medium">{filteredCashiers.length}</span> cashiers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs rounded-md border bg-background hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs rounded-md border bg-background hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">{t('staff_page.add_modal_title')}</h2>
            <form onSubmit={handleCreateCashier} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('staff_page.full_name')}</label>
                <input required name="name" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Jane Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input name="phone" type="tel" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. +250788000000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('staff_page.email')}</label>
                <input required name="email" type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. jane@shop.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('staff_page.password')}</label>
                <input required name="password" type="password" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Minimum 6 characters" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select name="roleName" required className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="CASHIER">Shop Cashier</option>
                  <option value="STOCK_CASHIER">Stock Cashier</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  {t('staff_page.cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "..." : t('staff_page.add_cashier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editCashier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">{t('common.edit')}</h2>
            <form onSubmit={handleEditCashier} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('staff_page.full_name')}</label>
                <input required name="name" type="text" defaultValue={editCashier.name} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input name="phone" type="tel" defaultValue={editCashier.phone || ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. +250788000000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('staff_page.email')}</label>
                <input required name="email" type="email" defaultValue={editCashier.email} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('staff_page.password')}</label>
                <input name="password" type="password" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Leave blank to keep current" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select name="roleName" required defaultValue={editCashier.role} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="CASHIER">Shop Cashier</option>
                  <option value="STOCK_CASHIER">Stock Cashier</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditCashier(null)}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
                >
                  {t('staff_page.cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "..." : t('staff_page.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
