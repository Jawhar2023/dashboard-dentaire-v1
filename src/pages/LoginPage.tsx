import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStaffSession } from "@/lib/staffAuth"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useStaffSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<"email" | "password" | null>(null)

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("Entrez votre email et mot de passe")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 450))
    const session = login(email, password)
    setLoading(false)
    if (!session) {
      toast.error("Email ou mot de passe incorrect")
      return
    }
    toast.success("Connexion réussie")
    navigate("/", { replace: true })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070f1c] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[#00C2E8]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[#1d4ed8]/25 blur-[110px]" />
        <div className="absolute top-[30%] left-[-8%] h-[320px] w-[320px] rounded-full bg-[#00C2E8]/10 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.11) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at center, black 35%, transparent 78%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Brand panel */}
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-10 lg:flex lg:flex-col lg:justify-between"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-10 top-16 h-48 w-48 rounded-full border border-[#00C2E8]/25" />
              <div className="absolute -right-2 top-28 h-72 w-72 rounded-full border border-white/10" />
              <div className="absolute bottom-16 left-10 h-24 w-24 rounded-2xl bg-[#00C2E8]/15 blur-2xl" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00C2E8]" />
                Accès sécurisé au cabinet
              </div>

              <div className="mt-10 rounded-2xl bg-white px-6 py-5 shadow-[0_20px_60px_-20px_rgba(0,194,232,0.55)]">
                <img
                  src={`${import.meta.env.BASE_URL}it2lab-logo.svg`}
                  alt="IT2LAB"
                  className="h-12 w-auto max-w-[280px] object-contain"
                />
              </div>

              <h1 className="mt-10 max-w-md text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                Gérez votre clinique avec clarté.
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/60">
                Patients, rendez-vous, paiements et factures — tout centralisé dans un tableau de bord fluide.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-3">
              {[
                { label: "Patients", value: "CRM" },
                { label: "Agenda", value: "Live" },
                { label: "Factures", value: "PDF" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur"
                >
                  <p className="text-[11px] uppercase tracking-wider text-white/45">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-[#00C2E8]">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Form panel */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center"
          >
            <div className="w-full rounded-[2rem] border border-white/10 bg-white p-7 text-slate-900 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.55)] sm:p-10">
              <div className="mb-8 lg:hidden">
                <div className="mx-auto flex w-fit items-center justify-center rounded-2xl bg-slate-50 px-5 py-3 ring-1 ring-slate-200">
                  <img
                    src={`${import.meta.env.BASE_URL}it2lab-logo.svg`}
                    alt="IT2LAB"
                    className="h-9 w-auto max-w-[200px] object-contain"
                  />
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#00A8C9]">
                  Connexion
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0B1F3A]">
                  Bon retour
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Saisissez vos identifiants pour ouvrir le tableau de bord.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="staff-email" className="text-slate-600">
                    Adresse email
                  </Label>
                  <div
                    className={cn(
                      "group flex h-12 items-center gap-3 rounded-2xl border bg-slate-50 px-3.5 transition-all",
                      focused === "email"
                        ? "border-[#00C2E8] bg-white ring-4 ring-[#00C2E8]/15"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Mail className={cn("h-4 w-4 shrink-0", focused === "email" ? "text-[#00C2E8]" : "text-slate-400")} />
                    <Input
                      id="staff-email"
                      type="email"
                      className="h-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-password" className="text-slate-600">
                    Mot de passe
                  </Label>
                  <div
                    className={cn(
                      "group flex h-12 items-center gap-3 rounded-2xl border bg-slate-50 px-3.5 transition-all",
                      focused === "password"
                        ? "border-[#00C2E8] bg-white ring-4 ring-[#00C2E8]/15"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Lock className={cn("h-4 w-4 shrink-0", focused === "password" ? "text-[#00C2E8]" : "text-slate-400")} />
                    <Input
                      id="staff-password"
                      className="h-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 h-12 w-full overflow-hidden rounded-2xl bg-[#0B1F3A] text-base font-medium text-white shadow-[0_12px_30px_-12px_rgba(11,31,58,0.8)] transition-all hover:bg-[#123056] hover:shadow-[0_16px_36px_-12px_rgba(0,194,232,0.45)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? "Connexion..." : "Se connecter"}
                    {!loading && (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </span>
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-slate-400">
                © {new Date().getFullYear()} IT2LAB · Accès réservé au personnel
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
