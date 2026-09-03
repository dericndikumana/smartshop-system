"use client"

import { signOut } from "next-auth/react"
import { Power } from "lucide-react"

export function LogOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center justify-between p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 font-bold text-lg border border-teal-100 dark:border-teal-900 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors w-full"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-yellow-400 flex items-center justify-center text-yellow-400">
          <Power className="h-4 w-4" />
        </div>
        <span>Logout:</span>
      </div>
      <Power className="h-5 w-5 text-teal-700 dark:text-teal-400" />
    </button>
  )
}
