"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import { X, ArrowRight, Store, Package, Zap, BarChart3, ShieldCheck } from "lucide-react"
import { useTranslation } from "@/components/providers/language-provider"
import { LanguageSwitcher } from "@/components/layout/language-switcher"

export default function LoginClient({ isSuspended }: { isSuspended: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(isSuspended)
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-[#0f172a] text-slate-50 selection:bg-fuchsia-500/30 font-sans">
      
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[30%] left-[10%] w-[80%] h-[80%] rounded-full bg-cyan-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
              <Store className="h-6 w-6 text-fuchsia-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">SmartShop</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all"
            >
              Access Your Shop
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className={`relative z-10 pt-32 pb-24 transition-all duration-700 ease-in-out ${isModalOpen ? 'blur-sm scale-95 pointer-events-none opacity-50' : 'opacity-100 scale-100'}`}>
        
        {/* Hero Section */}
        <div className="container mx-auto px-6 text-center max-w-4xl mb-24 mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-fuchsia-400 text-sm font-semibold tracking-widest uppercase mb-8">
            Everything you need
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 drop-shadow-sm leading-tight">
            Built for how shops actually run
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-medium mb-12 leading-relaxed max-w-2xl mx-auto">
            The all-in-one multi-tenant retail platform. Run the counter and the back office from one screen.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full overflow-hidden shadow-lg shadow-violet-500/25 transition-transform hover:scale-105 active:scale-95 sm:hidden mb-12"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative">Access Your Shop</span>
            <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Feature Cards */}
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-6 mb-32 max-w-6xl">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-fuchsia-500/20 text-fuchsia-400 rounded-2xl flex items-center justify-center mb-6 border border-fuchsia-500/20">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Live inventory</h3>
            <p className="text-slate-400 leading-relaxed">
              Stock levels update the moment a sale is rung up — no manual reconciliation, no surprises at close.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Fast point of sale</h3>
            <p className="text-slate-400 leading-relaxed">
              A checkout built for tapping through orders quickly, with receipts that print in one click.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Real reporting</h3>
            <p className="text-slate-400 leading-relaxed">
              Daily, weekly, and monthly revenue pulled straight from your sales — not a static mock.
            </p>
          </div>
        </div>

        {/* Wide Banner */}
        <div className="container mx-auto px-6 max-w-6xl mb-24">
          <div className="w-full bg-gradient-to-br from-indigo-950/80 to-slate-900/90 border border-indigo-500/20 rounded-[2.5rem] p-10 md:p-16 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Inner glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
              <div className="max-w-xl">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                  <ShieldCheck className="h-6 w-6 text-indigo-300" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">One dashboard, every shop.</h2>
                <p className="text-indigo-200/80 text-lg md:text-xl leading-relaxed mb-8 md:mb-0">
                  Super admins get a single view across every tenant — create shops, manage owners and cashiers, and suspend access without touching a database.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 min-w-[200px]">
                <div className="flex items-center gap-3 text-indigo-200">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  <span className="font-medium">Role-based access</span>
                </div>
                <div className="flex items-center gap-3 text-indigo-200">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  <span className="font-medium">Isolated tenant data</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="container mx-auto px-6">
          <div className="mt-16 text-slate-400 text-sm flex flex-col items-center gap-6 pb-10">
            <p className="text-center px-4">Don&apos;t have an account? Contact the System Administrator:</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-300">
              <span className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-full border border-white/10 backdrop-blur-sm whitespace-nowrap shadow-lg">
                <span className="text-emerald-400 font-bold">WhatsApp</span> +250 781 096 567
              </span>
              <span className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-full border border-white/10 backdrop-blur-sm whitespace-nowrap shadow-lg">
                <span className="text-cyan-400 font-bold">Email</span> ndikumanaderic2@gmail.com
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-8">© {new Date().getFullYear()} SmartShop. All rights reserved.</p>
          </div>
        </div>
      </main>

      {/* Modal Form */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
          isModalOpen ? 'opacity-100 visible backdrop-blur-md bg-slate-950/60' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div 
          className={`relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl transition-all duration-500 delay-100 ${
            isModalOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'
          }`}
        >
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl border border-white/10 mb-4 shadow-xl">
              <Store className="h-8 w-8 text-fuchsia-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('login_page.welcome') || "Welcome back"}</h2>
            <p className="text-slate-300 text-sm">{t('login_page.subtitle') || "Log in to your account"}</p>
          </div>

          <div className="[&_label]:text-slate-200 [&_input]:bg-slate-900/50 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder:text-slate-500 [&_input:focus]:border-fuchsia-500 [&_input:focus]:ring-fuchsia-500/20 [&_button]:bg-white [&_button]:text-slate-900 [&_button:hover]:bg-slate-200 [&_button]:rounded-xl [&_button]:font-bold [&_button]:h-12">
            <LoginForm initialSuspended={isSuspended} />
          </div>
          
        </div>
      </div>

    </div>
  )
}
