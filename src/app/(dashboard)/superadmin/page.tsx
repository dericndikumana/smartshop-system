import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const session = await auth()
  
  // Extra security check just in case middleware fails
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground mt-2">
          Global view of all active tenants and system metrics.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Active Shops</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Revenue (30d)</h3>
          <p className="text-3xl font-bold">$142,500.00</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">System Status</h3>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <p className="text-3xl font-bold text-green-500">Healthy</p>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Shop Admins</h3>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Create New Shop</button>
        </div>
        
        <div className="border rounded-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Shop Name</th>
                <th className="px-4 py-3 font-medium">Admin Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3">Downtown Coffee Co.</td>
                <td className="px-4 py-3">admin@downtowncoffee.com</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">ACTIVE</span></td>
                <td className="px-4 py-3 text-right">
                  <button className="text-primary hover:underline mr-4">Edit</button>
                  <button className="text-orange-500 hover:underline mr-4">Reset Pass</button>
                  <button className="text-red-500 hover:underline">Suspend</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
