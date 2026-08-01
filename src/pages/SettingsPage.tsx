import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, Star, ImageIcon, LogOut } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClinicLogoDialog } from "@/components/settings/ClinicLogoDialog"
import {
  useReminderLogs,
  useClinicSettings,
  useUpdateClinicSettings,
  useClinicLogos,
  useDeleteClinicLogo,
  useSetDefaultClinicLogo,
} from "@/hooks/useData"
import { getPatient } from "@/lib/mockDataStore"
import { useStaffSession } from "@/lib/staffAuth"
import type { ClinicLogo } from "@/lib/types"

export default function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: logs = [] } = useReminderLogs()
  const { data: settings } = useClinicSettings()
  const { data: logos = [] } = useClinicLogos()
  const updateSettings = useUpdateClinicSettings()
  const deleteLogo = useDeleteClinicLogo()
  const setDefaultLogo = useSetDefaultClinicLogo()
  const { displayName, email, saveProfile, logout } = useStaffSession()

  const [clinicName, setClinicName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [accountName, setAccountName] = useState(displayName)
  const [logoDialogOpen, setLogoDialogOpen] = useState(false)
  const [editingLogo, setEditingLogo] = useState<ClinicLogo | null>(null)

  useEffect(() => {
    if (!settings) return
    setClinicName(settings.clinicName)
    setPhone(settings.phone)
    setAddress(settings.address)
  }, [settings])

  useEffect(() => {
    setAccountName(displayName)
  }, [displayName])

  const saveClinicInfo = async () => {
    await updateSettings.mutateAsync({
      clinicName: clinicName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    })
    toast.success("Clinic information saved")
  }

  const saveAccountName = () => {
    if (!accountName.trim()) {
      toast.error("Entrez votre nom")
      return
    }
    saveProfile({ name: accountName.trim() })
    toast.success("Nom enregistré")
  }

  const handleLogout = () => {
    logout()
    toast.success("Déconnexion réussie")
    navigate("/login", { replace: true })
  }

  const openAddLogo = () => {
    setEditingLogo(null)
    setLogoDialogOpen(true)
  }

  const openEditLogo = (logo: ClinicLogo) => {
    setEditingLogo(logo)
    setLogoDialogOpen(true)
  }

  const handleDeleteLogo = async (logo: ClinicLogo) => {
    await deleteLogo.mutateAsync(logo.id)
    toast.success(`“${logo.name}” removed`)
  }

  const handleSetDefault = async (logo: ClinicLogo) => {
    await setDefaultLogo.mutateAsync(logo.id)
    toast.success(`“${logo.name}” is now the default invoice logo`)
  }

  return (
    <PageTransition>
      <PageHeader title={t("nav.settings")} description="Clinic configuration" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Clinic Information</h3>
          <div className="space-y-2">
            <Label>Clinic Name</Label>
            <Input className="rounded-xl" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
            <p className="text-xs text-muted-foreground">Affiché dans la barre latérale et sur les factures.</p>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input className="rounded-xl" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input className="rounded-xl" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <Button className="rounded-xl" onClick={() => void saveClinicInfo()} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving…" : "Save clinic info"}
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Compte</h3>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              className="rounded-xl"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Votre nom"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input className="rounded-xl" value={email} disabled />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-xl" onClick={saveAccountName}>
              Enregistrer le nom
            </Button>
            <Button variant="outline" className="rounded-xl gap-1.5" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Se déconnecter
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Automatic Reminders</h3>
          {[
            { label: "24 hours before appointment", default: true },
            { label: "3 hours before appointment", default: true },
            { label: "1 hour before appointment", default: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <Label>{item.label}</Label>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">Invoice logos</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add one logo per website/brand. Choose which logo to use when generating a facture.
              </p>
            </div>
            <Button className="rounded-xl gap-1.5" onClick={openAddLogo}>
              <Plus className="h-4 w-4" /> Add logo
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {logos.map((logo) => (
              <div key={logo.id} className="rounded-xl border border-border/60 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{logo.name}</p>
                      {logo.isDefault && (
                        <Badge variant="confirmed" className="text-[10px]">Default</Badge>
                      )}
                    </div>
                    {logo.website && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{logo.website}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!logo.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        title="Set as default"
                        onClick={() => void handleSetDefault(logo)}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditLogo(logo)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                      onClick={() => void handleDeleteLogo(logo)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="h-20 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                  {logo.imageUrl ? (
                    <img src={logo.imageUrl} alt={logo.name} className="max-h-full max-w-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground text-xs gap-1">
                      <ImageIcon className="h-5 w-5" />
                      No image yet — edit to upload
                    </div>
                  )}
                </div>
              </div>
            ))}
            {logos.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full py-6 text-center">
                No logos yet. Add a logo for each website you manage.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-4 lg:col-span-2">
          <h3 className="font-semibold">SMS Template</h3>
          <Textarea
            className="rounded-xl"
            rows={4}
            defaultValue="Bonjour {name},\n\nNous vous rappelons que votre rendez-vous est aujourd'hui à {time}.\n\nMerci d'arriver 10 minutes avant.\n\nCabinet Dr Ben Mustapha Khalil"
          />
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Reminder Logs</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((log) => {
              const patient = getPatient(log.patientId)
              return (
                <div key={log.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
                  <div>
                    <span className="font-medium">{patient?.firstName} {patient?.lastName}</span>
                    <span className="text-muted-foreground ml-2 capitalize">{log.channel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{format(new Date(log.sentAt), "dd MMM HH:mm")}</span>
                    <Badge variant={log.status === "delivered" || log.status === "read" ? "confirmed" : log.status === "failed" ? "cancelled" : "waiting"}>
                      {log.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <ClinicLogoDialog
        open={logoDialogOpen}
        onOpenChange={(open) => {
          setLogoDialogOpen(open)
          if (!open) setEditingLogo(null)
        }}
        logo={editingLogo}
      />
    </PageTransition>
  )
}
