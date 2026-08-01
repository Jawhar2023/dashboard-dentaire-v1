import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePortalSession } from "@/lib/patientAuth"
import { toast } from "sonner"

export default function PortalLoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = usePortalSession()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate("/portal", { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error("Enter your username and password")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))
    const patient = login(username, password)
    setLoading(false)
    if (!patient) {
      toast.error("Invalid credentials. Contact the clinic if you need help.")
      return
    }
    toast.success(`Welcome back, ${patient.firstName}!`)
    navigate("/portal", { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to clinic login
        </Link>

        <Card className="p-8 shadow-card-hover">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mb-4">
              <LogIn className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-semibold">Patient Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to see your treatments and payments
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portal-username">Username</Label>
              <Input
                id="portal-username"
                className="rounded-xl"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your.username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portal-password">Password</Label>
              <div className="relative">
                <Input
                  id="portal-password"
                  className="rounded-xl pr-10"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Try the demo: <span className="font-mono">ahmed.benali42</span> /{" "}
            <span className="font-mono">Ahmed2026</span>
          </p>
        </Card>
      </div>
    </div>
  )
}
