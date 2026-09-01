"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import { X, ArrowRight, Store } from "lucide-react"
import { useTranslation } from "@/components/providers/language-provider"
import { LanguageSwitcher } from "@/components/layout/language-switcher"

export default function LoginClient({ isSuspended }: { isSuspended: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(isSuspended)
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f172a] text-slate-50 flex flex-col items-center justify-center selection:bg-fuchsia-500/30">
      
      <div className="absolute top-6 right-6 z-50 bg-slate-900/50 rounded-lg">
        <LanguageSwitcher />
      </div>
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[30%] left-[10%] w-[80%] h-[80%] rounded-full bg-cyan-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      </div>

      {/* Main Landing Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center text-center px-6 transition-all duration-700 ease-in-out ${isModalOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 mb-8 shadow-2xl">
          <Store className="h-10 w-10 text-fuchsia-400" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 drop-shadow-sm">
          SmartShop
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-300 font-medium mb-8 max-w-2xl leading-relaxed">
          The all-in-one multi-tenant retail platform. Run the counter and the back office from one screen.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full overflow-hidden shadow-lg shadow-violet-500/25 transition-transform hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
          <span className="relative">Access Your Shop</span>
          <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>

        <div className="mt-16 text-slate-400 text-sm flex flex-col items-center gap-4">
          <p className="text-center px-4">Don&apos;t have an account? Contact the System Administrator:</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-slate-300">
            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm whitespace-nowrap">
              <span className="text-emerald-400 font-semibold">WhatsApp</span> +250 781 096 567
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm whitespace-nowrap">
              <span className="text-cyan-400 font-semibold">Email</span> ndikumanaderic2@gmail.com
            </span>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
          isModalOpen ? 'opacity-100 visible backdrop-blur-md bg-slate-950/60' : 'opacity-0 invisible'
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

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{t('login_page.welcome')}</h2>
            <p className="text-slate-300 text-sm">{t('login_page.subtitle')}</p>
          </div>

          <div className="[&_label]:text-slate-200 [&_input]:bg-slate-900/50 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder:text-slate-500 [&_input:focus]:border-fuchsia-500 [&_input:focus]:ring-fuchsia-500/20 [&_button]:bg-white [&_button]:text-slate-900 [&_button:hover]:bg-slate-200 [&_button]:rounded-xl [&_button]:font-bold [&_button]:h-12">
            <LoginForm initialSuspended={isSuspended} />
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 mb-3">Don&apos;t have an account? Contact the System Administrator:</p>
            <div className="flex flex-col items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
                <span className="text-emerald-400 font-semibold">WhatsApp</span> +250 781 096 567
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
                <span className="text-cyan-400 font-semibold">Email</span> ndikumanaderic2@gmail.com
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
