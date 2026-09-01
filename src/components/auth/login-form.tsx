"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Eye, EyeOff } from "lucide-react"

export default function LoginForm({ initialSuspended }: { initialSuspended?: boolean }) {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialSuspended ? "Your account has been suspended. Please contact the System Administrator." : null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      })

      if (res?.error) {
        if (res.error === "suspended") {
           setErrorMessage("Your account has been suspended. Please contact the System Administrator.")
        } else {
           setErrorMessage("Invalid credentials.")
        }
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setErrorMessage("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="identifier">
          Email or Username
        </label>
        <input 
          id="identifier" 
          type="text" 
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value)
            setErrorMessage(null)
          }}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors" 
          placeholder="name@example.com or Username" 
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input 
            id="password" 
            type={showPassword ? "text" : "password"} 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrorMessage(null)
            }}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors" 
            placeholder="••••••••" 
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 mt-6">
        <Button className="flex-1 font-medium" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        {errorMessage && (
          <Button 
            type="button" 
            variant="outline" 
            className="px-3 shrink-0 text-slate-500 hover:text-slate-900"
            onClick={() => {
              setIdentifier("")
              setPassword("")
              setErrorMessage(null)
            }}
            title="Refresh form"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
