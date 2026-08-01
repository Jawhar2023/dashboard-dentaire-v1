import { motion } from "framer-motion"
import { useSwipeable } from "react-swipeable"
import {
  MessageSquare, Mail, Pencil, CheckCircle, Clock, Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { AppointmentStatusSelect } from "@/components/appointments/AppointmentStatusSelect"
import { AppointmentPaymentCell } from "@/components/appointments/AppointmentPaymentCell"
import { getPatient, getDoctor, getTreatment } from "@/lib/mockDataStore"
import { getNationalityCode } from "@/lib/constants"
import type { Appointment, ReminderChannel } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useUpdateAppointmentStatus, useUpdateAppointment } from "@/hooks/useData"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

const statusBorder: Record<string, string> = {
  confirmed: "border-l-emerald-500",
  arrived: "border-l-primary",
  waiting: "border-l-amber-500",
  completed: "border-l-slate-400",
  cancelled: "border-l-red-500",
  treatment: "border-l-violet-500",
}

interface AppointmentCardProps {
  appointment: Appointment
  selected?: boolean
  onSelect?: (id: string, checked: boolean) => void
  onReminder: (appointment: Appointment, channel: ReminderChannel) => void
  onEdit?: (appointment: Appointment) => void
  onDelete?: (appointment: Appointment) => void
}

export function AppointmentCard({ appointment, selected, onSelect, onReminder, onEdit, onDelete }: AppointmentCardProps) {
  const patient = getPatient(appointment.patientId)
  const doctor = getDoctor(appointment.doctorId)
  const treatment = getTreatment(appointment.treatmentId)
  const updateStatus = useUpdateAppointmentStatus()
  const updateAppointment = useUpdateAppointment()
  const isMobile = useIsMobile()

  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (isMobile && appointment.status !== "completed") {
        updateStatus.mutate({ id: appointment.id, status: "arrived" })
        toast.success("Checked in!")
      }
    },
    onSwipedLeft: () => {
      if (isMobile) toast.info("Swipe actions: Cancel / Reschedule / Reminder")
    },
    trackMouse: false,
  })

  if (!patient || !doctor || !treatment) return null

  const handleCheckIn = () => {
    updateStatus.mutate({ id: appointment.id, status: "arrived" })
    toast.success(`${patient.firstName} checked in`)
  }

  const handleComplete = () => {
    updateStatus.mutate({ id: appointment.id, status: "completed" })
    toast.success("Appointment completed")
  }

  return (
    <motion.div
      {...handlers}
      layout
      whileHover={{ scale: 1.01, boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.08)" }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-[18px] border border-border/50 bg-card shadow-card border-l-4 p-5 transition-shadow space-y-4",
        statusBorder[appointment.status]
      )}
    >
      <div className="flex items-start gap-4">
        {onSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={(c) => onSelect(appointment.id, !!c)}
            className="mt-3"
          />
        )}

        <PatientAvatar
          name={`${patient.firstName} ${patient.lastName}`}
          avatar={patient.avatar}
          countryCode={getNationalityCode(patient.nationality)}
          size="lg"
        />

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-primary font-medium">{treatment.name}</p>
            </div>
            <AppointmentStatusSelect
              value={appointment.status}
              onChange={(status) => {
                updateStatus.mutate(
                  { id: appointment.id, status },
                  { onSuccess: () => toast.success("Status updated") }
                )
              }}
              disabled={updateStatus.isPending}
            />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>Dr. {doctor.name.split(" ").slice(-1)[0]}</span>
            <span>{appointment.duration} min</span>
            <span>{patient.phone}</span>
            {appointment.notes && <span className="italic">{appointment.notes}</span>}
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <AppointmentPaymentCell
              total={treatment.price}
              paymentStatus={appointment.paymentStatus}
              amountPaid={appointment.amountPaid}
              disabled={updateAppointment.isPending}
              onChange={(data) => {
                updateAppointment.mutate(
                  { id: appointment.id, data },
                  { onSuccess: () => toast.success("Payment updated") }
                )
              }}
            />
            <div className="flex flex-wrap gap-2 content-start">
              {appointment.reminderStatus !== "none" && (
                <Badge variant="outline" className="rounded-lg text-xs capitalize">
                  Reminder: {appointment.reminderStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-border/40 bg-muted/40 px-3 py-2.5">
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 bg-background" onClick={() => onReminder(appointment, "whatsapp")}>
          <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-1.5 h-9 bg-background"
          onClick={() => onReminder(appointment, "email")}
          disabled={!patient.email}
        >
          <Mail className="h-3.5 w-3.5" /> Gmail
        </Button>
        {onEdit && (
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 bg-background" onClick={() => onEdit(appointment)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
        {appointment.status !== "arrived" && appointment.status !== "completed" && (
          <Button variant="secondary" size="sm" className="rounded-xl gap-1.5 h-9" onClick={handleCheckIn}>
            <CheckCircle className="h-3.5 w-3.5" /> Check In
          </Button>
        )}
        {(appointment.status === "arrived" || appointment.status === "treatment") && (
          <Button size="sm" className="rounded-xl gap-1.5 h-9" onClick={handleComplete}>
            <Clock className="h-3.5 w-3.5" /> Complete
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl h-9 w-9 p-0 bg-background text-destructive hover:text-destructive"
            onClick={() => onDelete(appointment)}
            title="Delete appointment"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
