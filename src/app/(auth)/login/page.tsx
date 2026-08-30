import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side: Marketing Splash */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">shopCore</h1>
          <p className="mt-2 text-lg font-medium text-primary-foreground/80">MULTI-TENANT RETAIL PLATFORM</p>
        </div>
        
        <div className="space-y-6 max-w-lg relative z-10">
          <h2 className="text-4xl font-bold leading-tight">Run the counter and the back office from one screen.</h2>
          <p className="text-xl text-primary-foreground/90 leading-relaxed">
            shopCore gives every shop owner a fast point of sale, live inventory, and sales reporting that&apos;s actually built from real transactions — not a spreadsheet duct-taped to a till.
          </p>
        </div>

        <div className="space-y-6 relative z-10 bg-black/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
          <p className="text-sm font-bold tracking-widest uppercase text-primary-foreground/70">EVERYTHING YOU NEED</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-1">Live inventory</h3>
              <p className="text-sm text-primary-foreground/80 leading-snug">Stock levels update the moment a sale is rung up — no manual reconciliation.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Fast point of sale</h3>
              <p className="text-sm text-primary-foreground/80 leading-snug">A checkout built for tapping through orders quickly with 1-click receipts.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Real reporting</h3>
              <p className="text-sm text-primary-foreground/80 leading-snug">Daily, weekly, and monthly revenue pulled straight from your sales.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">One dashboard</h3>
              <p className="text-sm text-primary-foreground/80 leading-snug">Super admins get a single view across every tenant without touching a database.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-muted/10">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-primary lg:hidden mb-8">shopCore</h1>
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to access your shop.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
