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
    <div className="relative min-h-screen overflow-hidden bg-[#110c24] text-slate-50 flex flex-col items-center justify-center selection:bg-fuchsia-500/30">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-fuchsia-400" />
          <span className="text-xl font-bold tracking-tight text-white">SmartShop</span>
        </div>
        <div className="rounded-lg">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Dynamic Animated Background / Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,rgba(0,0,0,0)_70%)] blur-2xl" />
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      {/* Main Landing Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center text-center px-6 transition-all duration-700 ease-in-out ${isModalOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        
        {/* Logo Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1e1438] rounded-[1.5rem] border-[1.5px] border-fuchsia-500/30 mb-8 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
          <Store className="h-10 w-10 text-fuchsia-400" />
        </div>
        
        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4 text-white drop-shadow-sm">
          SmartShop
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-300 font-medium mb-12 max-w-2xl leading-relaxed">
          The all-in-one multi-tenant retail platform. Run the counter
          <br className="hidden md:block" />
          and the back office from one screen.
        </p>

        {/* Access Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 text-base font-bold text-white bg-gradient-to-r from-fuchsia-500 to-violet-600 rounded-full overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]"
        >
          <span className="relative">Access Your Shop</span>
          <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Footer Contact Info */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full text-center px-6">
          <p className="text-slate-400 text-sm mb-4">Don&apos;t have an account? Contact the System Administrator:</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-300 text-sm">
            <span className="flex items-center gap-2 bg-[#1e1b36]/60 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
              <span className="text-[#00e676] font-semibold">WhatsApp</span> +250 781 096 567
            </span>
            <span className="flex items-center gap-2 bg-[#1e1b36]/60 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
              <span className="text-[#00e5ff] font-semibold">Email</span> ndikumanaderic2@gmail.com
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
          className={`relative w-full max-w-md bg-[#160f2e]/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl transition-all duration-500 delay-100 ${
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

          <div className="[&_label]:text-slate-200 [&_input]:bg-[#1e1438] [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder:text-slate-500 [&_input:focus]:border-fuchsia-500 [&_input:focus]:ring-fuchsia-500/20 [&_button]:bg-gradient-to-r [&_button]:from-fuchsia-500 [&_button]:to-violet-600 [&_button]:text-white [&_button:hover]:opacity-90 [&_button]:rounded-xl [&_button]:font-bold [&_button]:h-12 [&_button]:shadow-lg [&_button]:shadow-violet-500/25">
            <LoginForm initialSuspended={isSuspended} />
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 mb-3">Don&apos;t have an account? Contact the System Administrator:</p>
            <div className="flex flex-col items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
                <span className="text-[#00e676] font-semibold">WhatsApp</span> +250 781 096 567
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
                <span className="text-[#00e5ff] font-semibold">Email</span> ndikumanaderic2@gmail.com
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

