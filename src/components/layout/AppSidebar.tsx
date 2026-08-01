import {
  LayoutDashboard, Users, CalendarClock, Calendar, Stethoscope, Sparkles,
  CreditCard, FileText, Settings, Menu, X, Activity,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useClinicSettings } from "@/hooks/useData"

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, path: "/" },
  { key: "patients", icon: Users, path: "/patients" },
  { key: "appointments", icon: CalendarClock, path: "/appointments" },
  { key: "calendar", icon: Calendar, path: "/calendar" },
  { key: "doctors", icon: Stethoscope, path: "/doctors" },
  { key: "treatments", icon: Sparkles, path: "/treatments" },
  { key: "payments", icon: CreditCard, path: "/payments" },
  { key: "invoices", icon: FileText, path: "/invoices" },
  { key: "settings", icon: Settings, path: "/settings" },
]

export function AppSidebar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()
  const { data: settings } = useClinicSettings()
  const clinicName = settings?.clinicName?.trim() || "Cabinet Dentaire"

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    if (path === "/patients") return location.pathname === "/patients" || location.pathname.startsWith("/patients/")
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-base text-foreground block truncate">{clinicName}</span>
            <p className="text-[10px] text-muted-foreground leading-tight">Cabinet Dentaire</p>
          </div>
        </div>
        <button type="button" onClick={() => setMobileOpen(false)} className="lg:hidden text-muted-foreground p-1 shrink-0">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon size={18} />
              {t(`nav.${item.key}`)}
            </Link>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-card border shadow-sm"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
