import { Search, Bell, Moon, Sun, Globe, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApp } from "@/providers/AppProvider"
import { useNotifications, useMarkNotificationRead } from "@/hooks/useData"
import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { fr, enUS } from "date-fns/locale"
import { GlassPanel } from "@/components/shared/GlassPanel"
import { useStaffSession } from "@/lib/staffAuth"
import { toast } from "sonner"

export function TopNavBar() {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const { setSearchOpen } = useApp()
  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationRead()
  const navigate = useNavigate()
  const { logout } = useStaffSession()

  const unread = notifications.filter((n) => !n.read).length
  const locale = i18n.language === "fr" ? fr : enUS

  const handleLogout = () => {
    logout()
    toast.success("Déconnexion réussie")
    navigate("/login", { replace: true })
  }

  return (
    <GlassPanel className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-6 lg:px-8 border-b">
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex flex-1 max-w-md items-center gap-3 rounded-xl border border-input bg-background/60 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-background hover:border-primary/30"
      >
        <Search className="h-4 w-4" />
        <span>{t("common.search")}</span>
        <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 font-semibold text-sm">Notifications</div>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={() => {
                  markRead.mutate(n.id)
                  if (n.link) navigate(n.link)
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className={n.read ? "text-muted-foreground" : "font-medium"}>{n.title}</span>
                  {!n.read && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">{n.message}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale })}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-1.5 hidden sm:flex"
          onClick={() => i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr")}
        >
          <Globe className="h-4 w-4" />
          {i18n.language.toUpperCase()}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={handleLogout}
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </GlassPanel>
  )
}
