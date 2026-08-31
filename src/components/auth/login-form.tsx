"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function LoginForm({ initialSuspended }: { initialSuspended?: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        if (res.error === "suspended") {
           setErrorMessage("Your account has been suspended. Please contact the System Administrator.")
        } else {
           setErrorMessage("Invalid email or password.")
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
        <label className="text-sm font-medium leading-none" htmlFor="email">
          Email Address
        </label>
        <input 
          id="email" 
          type="email" 
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrorMessage(null)
          }}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors" 
          placeholder="name@example.com" 
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="password">
          Password
        </label>
        <input 
          id="password" 
          type="password" 
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrorMessage(null)
          }}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors" 
          placeholder="••••••••" 
        />
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
              setEmail("")
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
