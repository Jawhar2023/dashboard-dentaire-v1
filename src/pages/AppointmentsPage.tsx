import { useState, useMemo } from "react"
import { format, addDays, parseISO } from "date-fns"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { TimelineScheduler } from "@/components/appointments/TimelineScheduler"
import { AppointmentTableView } from "@/components/appointments/AppointmentTableView"
import {
  AppointmentFiltersBar,
  type AppointmentFilters,
  type AppointmentViewMode,
} from "@/components/appointments/AppointmentFilters"
import { AppointmentFormDialog } from "@/components/appointments/NewAppointmentDialog"
import { DeleteAppointmentDialog } from "@/components/appointments/DeleteAppointmentDialog"
import { ReminderModal } from "@/components/reminders/ReminderModal"
import { BulkActionBar } from "@/components/reminders/BulkActionBar"
import { useAllAppointments } from "@/hooks/useData"
import { getPatient, getDoctor } from "@/lib/mockDataStore"
import type { Appointment, ReminderChannel } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

function applyAppointmentFilters(
  appointments: Appointment[],
  filters: AppointmentFilters,
  viewMode: AppointmentViewMode
) {
  const today = format(new Date(), "yyyy-MM-dd")
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd")
  const weekEnd = format(addDays(new Date(), 6), "yyyy-MM-dd")
  const q = filters.search.trim().toLowerCase()

  return appointments.filter((a) => {
    if (viewMode === "timeline") {
      if (filters.dateRange === "today" && a.date !== today) return false
      if (filters.dateRange === "tomorrow" && a.date !== tomorrow) return false
      if (filters.dateRange === "week" && (a.date < today || a.date > weekEnd)) return false
    } else {
      const start = filters.dateRange === "tomorrow" ? tomorrow : today
      const dayCount = 7
      const end = format(addDays(parseISO(start), dayCount - 1), "yyyy-MM-dd")
      if (a.date < start || a.date > end) return false
    }
    if (filters.status !== "all" && a.status !== filters.status) return false
    if (filters.doctorId !== "all" && a.doctorId !== filters.doctorId) return false
    if (filters.treatmentId !== "all" && a.treatmentId !== filters.treatmentId) return false
    if (filters.nationality !== "all") {
      const patient = getPatient(a.patientId)
      if (patient?.nationality !== filters.nationality) return false
    }
    if (q) {
      const patient = getPatient(a.patientId)
      const doctor = getDoctor(a.doctorId)
      const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : ""
      const patientPhone = patient?.phone.toLowerCase() ?? ""
      const doctorName = doctor?.name.toLowerCase() ?? ""
      if (
        !patientName.includes(q) &&
        !patientPhone.includes(q) &&
        !doctorName.includes(q)
      ) {
        return false
      }
    }
    return true
  })
}

export default function AppointmentsPage() {
  const { t } = useTranslation()
  const { data: allAppointments = [], isLoading } = useAllAppointments()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editAppt, setEditAppt] = useState<Appointment | null>(null)
  const [deleteAppt, setDeleteAppt] = useState<Appointment | null>(null)
  const [reminderAppt, setReminderAppt] = useState<Appointment | null>(null)
  const [reminderChannel, setReminderChannel] = useState<ReminderChannel>("whatsapp")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const [sendChannel, setSendChannel] = useState("")
  const [viewMode, setViewMode] = useState<AppointmentViewMode>("table")
  const isMobile = useIsMobile()

  const [filters, setFilters] = useState<AppointmentFilters>({
    dateRange: "today",
    status: "all",
    doctorId: "all",
    treatmentId: "all",
    nationality: "all",
    search: "",
  })

  const filtered = useMemo(
    () => applyAppointmentFilters(allAppointments, filters, viewMode),
    [allAppointments, filters, viewMode]
  )

  const tableDayCount = filters.dateRange === "week" ? 7 : 7
  const tableStartOffset = filters.dateRange === "tomorrow" ? 1 : 0

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleBulkSend = (channel: string) => {
    setSendChannel(channel)
    setConfirmOpen(true)
  }

  const handleConfirmSend = async () => {
    setSending(true)
    const total = selectedIds.size
    for (let i = 0; i < total; i++) {
      await new Promise((r) => setTimeout(r, 80))
      setSendProgress(i + 1)
    }
    setSending(false)
    setConfirmOpen(false)
    setSelectedIds(new Set())
    setSendProgress(0)
    toast.success(`Sent ${total} ${sendChannel} reminders`)
  }

  return (
    <PageTransition>
      <PageHeader
        title={t("nav.appointments")}
        description={
          viewMode === "table"
            ? "Daily appointment register — scroll horizontally by day"
            : "Timeline scheduler — your daily command center"
        }
        action={
          <Button className="rounded-xl gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> {t("common.newAppointment")}
          </Button>
        }
      />

      <AppointmentFiltersBar
        filters={filters}
        onChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-[18px] bg-muted animate-pulse" />
          ))}
        </div>
      ) : viewMode === "table" ? (
        <AppointmentTableView
          appointments={filtered}
          dayCount={tableDayCount}
          startOffset={tableStartOffset}
          onEdit={(appt) => setEditAppt(appt)}
          onDelete={(appt) => setDeleteAppt(appt)}
          onReminder={(appt, ch) => { setReminderAppt(appt); setReminderChannel(ch) }}
        />
      ) : (
        <TimelineScheduler
          appointments={filtered}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onReminder={(appt, ch) => { setReminderAppt(appt); setReminderChannel(ch) }}
          onEdit={(appt) => setEditAppt(appt)}
          onDelete={(appt) => setDeleteAppt(appt)}
        />
      )}

      {isMobile && (
        <Button
          className="fixed bottom-6 left-6 z-30 h-14 w-14 rounded-2xl shadow-card-hover lg:hidden"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <AppointmentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <AppointmentFormDialog
        open={!!editAppt}
        onOpenChange={(o) => !o && setEditAppt(null)}
        appointment={editAppt ?? undefined}
      />
      {deleteAppt && (
        <DeleteAppointmentDialog
          open={!!deleteAppt}
          onOpenChange={(o) => !o && setDeleteAppt(null)}
          appointment={deleteAppt}
        />
      )}
      <ReminderModal
        open={!!reminderAppt}
        onOpenChange={(o) => !o && setReminderAppt(null)}
        appointment={reminderAppt}
        channel={reminderChannel}
      />
      {viewMode === "timeline" && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          allSelected={selectedIds.size === filtered.length && filtered.length > 0}
          onSelectAll={() => {
            if (selectedIds.size === filtered.length) setSelectedIds(new Set())
            else setSelectedIds(new Set(filtered.map((a) => a.id)))
          }}
          onSendSMS={() => handleBulkSend("SMS")}
          onSendWhatsApp={() => handleBulkSend("WhatsApp")}
          onSendEmail={() => handleBulkSend("Email")}
          onClear={() => setSelectedIds(new Set())}
          sending={sending}
          sendProgress={sendProgress}
          sendTotal={selectedIds.size}
          confirmOpen={confirmOpen}
          onConfirmOpenChange={setConfirmOpen}
          onConfirmSend={handleConfirmSend}
          sendChannel={sendChannel}
        />
      )}
    </PageTransition>
  )
}
