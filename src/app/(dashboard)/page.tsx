export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the SmartShop System. Your store overview will appear here.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-3/4 bg-muted/50 rounded animate-pulse mt-2"></div>
          </div>
        ))}
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-96 flex items-center justify-center">
        <p className="text-muted-foreground italic">Interactive charts coming in Phase 4...</p>
      </div>
    </div>
  )
}
