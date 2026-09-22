import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, ChevronDown, Phone, Search, CalendarPlus } from "lucide-react"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getNationalityCode } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Patient } from "@/lib/types"

interface PatientsWithoutAppointmentPanelProps {
  patients: Patient[]
}

export function PatientsWithoutAppointmentPanel({ patients }: PatientsWithoutAppointmentPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const [search, setSearch] = useState("")
  const [bookingPatientId, setBookingPatientId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q
      ? patients.filter(
          (p) =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
            p.phone.toLowerCase().includes(q)
        )
      : patients
    return [...list].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    )
  }, [patients, search])

  if (patients.length === 0) return null

  return (
    <div className="mb-6 rounded-[18px] border border-amber-200 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            {patients.length} {patients.length === 1 ? "patient sans rendez-vous" : "patients sans rendez-vous"}
          </p>
          <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
            Ces profils n&apos;ont encore aucun rendez-vous planifié
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-amber-200/70 dark:border-amber-800/70 px-4 py-3 space-y-3">
          {patients.length > 5 && (
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filtrer par nom ou téléphone..."
                className="h-8 rounded-lg pl-8 text-sm bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-amber-200/70 dark:border-amber-800/60 bg-background px-3 py-2.5"
              >
                <PatientAvatar
                  name={`${p.firstName} ${p.lastName}`}
                  avatar={p.avatar}
                  countryCode={getNationalityCode(p.nationality)}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <Link to={`/patients/${p.id}`} className="block truncate text-sm font-semibold hover:underline">
                    {p.firstName} {p.lastName}
                  </Link>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Phone className="h-3 w-3 shrink-0" /> {p.phone}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 rounded-lg text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/50"
                  title="Créer un rendez-vous"
                  onClick={() => setBookingPatientId(p.id)}
                >
                  <CalendarPlus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
                Aucun patient ne correspond à la recherche
              </p>
            )}
          </div>
        </div>
      )}

      <NewAppointmentDialog
        open={!!bookingPatientId}
        onOpenChange={(open) => !open && setBookingPatientId(null)}
        defaultPatientId={bookingPatientId ?? undefined}
      />
    </div>
  )
}
