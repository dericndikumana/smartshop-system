import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const session = await auth()
  
  if (session?.user?.role !== "SHOP_ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Cashiers</h1>
          <p className="text-muted-foreground mt-2">
            Add and remove staff members for your shop.
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Add Cashier</button>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium">Alice Cashier</td>
              <td className="px-4 py-3">alice@downtowncoffee.com</td>
              <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">ACTIVE</span></td>
              <td className="px-4 py-3 text-right">
                <button className="text-primary hover:underline mr-4">Edit</button>
                <button className="text-red-500 hover:underline">Revoke Access</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
