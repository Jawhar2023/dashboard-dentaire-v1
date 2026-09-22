import { useMemo, useState } from "react"
import { format, addDays, isToday, isTomorrow } from "date-fns"
import { fr, enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import { ChevronLeft, ChevronRight, Pencil, Trash2, MessageSquare, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppointmentStatusSelect } from "@/components/appointments/AppointmentStatusSelect"
import { AppointmentPaymentCell } from "@/components/appointments/AppointmentPaymentCell"
import { getPatient, getDoctor, getTreatment } from "@/lib/mockDataStore"
import { useUpdateAppointmentStatus, useUpdateAppointment } from "@/hooks/useData"
import { cn, formatAppointmentTime } from "@/lib/utils"
import type { Appointment, PaymentStatus, ReminderChannel } from "@/lib/types"
import { toast } from "sonner"

interface AppointmentTableViewProps {
  appointments: Appointment[]
  dayCount?: number
  startOffset?: number
  onEdit?: (appointment: Appointment) => void
  onDelete?: (appointment: Appointment) => void
  onReminder?: (appointment: Appointment, channel: ReminderChannel) => void
}

const statusRow: Record<string, string> = {
  confirmed: "border-l-emerald-500",
  arrived: "border-l-primary",
  waiting: "border-l-amber-500",
  completed: "border-l-slate-400",
  cancelled: "border-l-red-500 opacity-60",
  treatment: "border-l-violet-500",
}

export function AppointmentTableView({
  appointments,
  dayCount = 7,
  startOffset = 0,
  onEdit,
  onDelete,
  onReminder,
}: AppointmentTableViewProps) {
  const { i18n } = useTranslation()
  const locale = i18n.language === "fr" ? fr : enUS
  const hasActions = !!(onEdit || onDelete || onReminder)
  const updateStatus = useUpdateAppointmentStatus()
  const updateAppointment = useUpdateAppointment()

  const handleStatusChange = async (appt: Appointment, status: Appointment["status"]) => {
    if (appt.status === status) return
    await updateStatus.mutateAsync({ id: appt.id, status })
    toast.success("Status updated")
  }

  const handlePaymentChange = async (
    appt: Appointment,
    data: { paymentStatus: PaymentStatus; amountPaid: number; total?: number }
  ) => {
    const { total, ...rest } = data
    await updateAppointment.mutateAsync({
      id: appt.id,
      data: total !== undefined ? { ...rest, customPrice: total } : rest,
    })
    toast.success("Payment updated")
  }

  const handleNotesChange = async (appt: Appointment, notes: string) => {
    if (notes === (appt.notes ?? "")) return
    await updateAppointment.mutateAsync({ id: appt.id, data: { notes } })
    toast.success("Notes updated")
  }

  const days = useMemo(() => {
    const start = addDays(new Date(), startOffset)
    return Array.from({ length: dayCount }, (_, i) => {
      const date = addDays(start, i)
      return {
        key: format(date, "yyyy-MM-dd"),
        date,
        label: format(date, "EEE dd/MM/yyyy", { locale }).toLowerCase(),
      }
    })
  }, [dayCount, startOffset, locale])

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    days.forEach((d) => map.set(d.key, []))
    appointments.forEach((appt) => {
      const list = map.get(appt.date)
      if (list) list.push(appt)
    })
    map.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)))
    return map
  }, [appointments, days])

  const scroll = (direction: "left" | "right") => {
    const el = document.getElementById("appointment-table-scroll")
    if (!el) return
    el.scrollBy({ left: direction === "left" ? -el.clientWidth : el.clientWidth, behavior: "smooth" })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          ← Swipe or scroll horizontally to see the next day →
        </p>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => scroll("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        id="appointment-table-scroll"
        className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-[18px] border border-border/60 bg-card shadow-card"
      >
        {days.map((day) => {
          const dayAppointments = byDay.get(day.key) ?? []
          const today = isToday(day.date)
          const tomorrow = isTomorrow(day.date)

          return (
            <section
              key={day.key}
              className="w-full min-w-full shrink-0 snap-start snap-always"
            >
              <div
                className={cn(
                  "px-5 py-3 font-semibold text-sm capitalize border-b",
                  today
                    ? "bg-rose-200/80 text-rose-950 border-rose-300 dark:bg-rose-900/60 dark:text-rose-50 dark:border-rose-800"
                    : "bg-rose-100/90 text-rose-900 border-rose-200 dark:bg-rose-950/50 dark:text-rose-100 dark:border-rose-900"
                )}
              >
                {day.label}
                {today && <span className="ml-2 text-xs font-medium opacity-80">— aujourd&apos;hui</span>}
                {tomorrow && <span className="ml-2 text-xs font-medium opacity-80">— demain</span>}
                <span className="ml-4 text-xs font-normal opacity-70">
                  {dayAppointments.length} rendez-vous
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground bg-muted/50 border-b border-border/50">
                      <th className="px-4 py-2.5 font-semibold w-[72px] whitespace-nowrap">Heure</th>
                      <th className="px-4 py-2.5 font-semibold w-[100px] whitespace-nowrap">Médecin</th>
                      <th className="px-4 py-2.5 font-semibold w-[160px] whitespace-nowrap">Patient</th>
                      <th className="px-4 py-2.5 font-semibold min-w-[240px]">Traitement / Notes</th>
                      <th className="px-4 py-2.5 font-semibold min-w-[200px]">Règlement</th>
                      <th className="px-4 py-2.5 font-semibold w-[100px] whitespace-nowrap">Statut</th>
                      {hasActions && (
                        <th className="px-4 py-2.5 font-semibold w-[210px] text-right whitespace-nowrap">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {dayAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={hasActions ? 7 : 6} className="px-4 py-12 text-center text-muted-foreground">
                          Aucun rendez-vous ce jour
                        </td>
                      </tr>
                    ) : (
                      dayAppointments.map((appt, idx) => {
                        const patient = getPatient(appt.patientId)
                        const doctor = getDoctor(appt.doctorId)
                        const treatment = getTreatment(appt.treatmentId)
                        if (!patient || !doctor || !treatment) return null

                        const doctorShort = doctor.name.replace(/^Dr\.?\s*/i, "").split(" ").slice(-1)[0]

                        return (
                          <tr
                            key={appt.id}
                            className={cn(
                              "border-b border-border/40 border-l-[3px] hover:bg-muted/30 transition-colors",
                              statusRow[appt.status],
                              idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                            )}
                          >
                            <td className="px-4 py-2 font-semibold text-primary whitespace-nowrap align-middle">
                              {formatAppointmentTime(appt.time)}
                            </td>
                            <td className="px-4 py-2 text-muted-foreground whitespace-nowrap align-middle">
                              {doctorShort}
                            </td>
                            <td className="px-4 py-2 font-medium whitespace-nowrap align-middle">
                              {patient.firstName} {patient.lastName}
                            </td>
                            <td className="px-4 py-2 text-sm align-middle leading-snug">
                              <EditableTreatmentCell
                                treatmentName={treatment.name}
                                notes={appt.notes}
                                disabled={updateAppointment.isPending}
                                onCommit={(notes) => void handleNotesChange(appt, notes)}
                              />
                            </td>
                            <td className="px-4 py-2 align-middle">
                              <AppointmentPaymentCell
                                total={appt.customPrice ?? treatment.price}
                                paymentStatus={appt.paymentStatus}
                                amountPaid={appt.amountPaid}
                                disabled={updateAppointment.isPending}
                                onChange={(data) => void handlePaymentChange(appt, data)}
                              />
                            </td>
                            <td className="px-4 py-2 align-middle">
                              <AppointmentStatusSelect
                                value={appt.status}
                                onChange={(status) => void handleStatusChange(appt, status)}
                                disabled={updateStatus.isPending}
                              />
                            </td>
                            {hasActions && (
                              <td className="px-4 py-2 align-middle">
                                <div className="flex justify-end gap-1">
                                  {onReminder && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700"
                                        onClick={() => onReminder(appt, "whatsapp")}
                                        title="Send WhatsApp"
                                      >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600"
                                        onClick={() => onReminder(appt, "email")}
                                        title="Send Gmail reminder"
                                        disabled={!patient.email}
                                      >
                                        <Mail className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  )}
                                  {onEdit && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg"
                                      onClick={() => onEdit(appt)}
                                      title="Edit appointment"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  {onDelete && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                                      onClick={() => onDelete(appt)}
                                      title="Delete appointment"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}
      </div>

      <div className="flex justify-center gap-1.5 pt-1">
        {days.map((day, i) => (
          <div
            key={day.key}
            className={cn(
              "h-1.5 rounded-full transition-all",
              isToday(day.date) ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
            )}
            title={day.label}
            onClick={() => {
              const el = document.getElementById("appointment-table-scroll")
              if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const el = document.getElementById("appointment-table-scroll")
                if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface EditableTreatmentCellProps {
  treatmentName: string
  notes?: string
  disabled?: boolean
  onCommit: (notes: string) => void
}

function EditableTreatmentCell({ treatmentName, notes, disabled, onCommit }: EditableTreatmentCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(notes ?? "")

  if (!editing) {
    return (
      <button
        type="button"
        disabled={disabled}
        className="w-full text-left rounded-md px-1 py-0.5 -mx-1 hover:bg-muted/50 disabled:cursor-default"
        onClick={() => {
          setDraft(notes ?? "")
          setEditing(true)
        }}
      >
        {[treatmentName, notes].filter(Boolean).join(" — ")}
      </button>
    )
  }

  return (
    <Input
      autoFocus
      className="h-8 text-sm"
      value={draft}
      placeholder="Notes…"
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        onCommit(draft.trim())
        setEditing(false)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          onCommit(draft.trim())
          setEditing(false)
        }
        if (e.key === "Escape") {
          setEditing(false)
        }
      }}
    />
  )
}
