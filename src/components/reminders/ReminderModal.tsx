import { useState } from "react"
import { useTranslation } from "react-i18next"
import { MessageSquare, Mail, Send } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSendReminder } from "@/hooks/useData"
import { getPatient, getTreatment, getClinicSettings } from "@/lib/mockDataStore"
import { toast } from "sonner"
import type { Appointment, ReminderChannel } from "@/lib/types"

interface ReminderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
  channel: ReminderChannel
}

function sanitizePhone(phone: string) {
  return phone.replace(/[^0-9]/g, "")
}

function buildAppointmentMessage(
  patientName: string,
  date: string,
  time: string,
  treatmentName?: string,
  clinicName?: string
) {
  const clinic = clinicName || "notre cabinet"
  const treatment = treatmentName ? ` (${treatmentName})` : ""
  return `Bonjour ${patientName},

Nous vous rappelons votre rendez-vous le ${date} à ${time}${treatment}.

Merci d'arriver 10 minutes avant.

${clinic}`
}

function buildChannelLink(
  channel: ReminderChannel,
  phone: string,
  email: string,
  subject: string,
  message: string
) {
  const encodedBody = encodeURIComponent(message)
  const encodedSubject = encodeURIComponent(subject)
  if (channel === "whatsapp") {
    return `https://wa.me/${sanitizePhone(phone)}?text=${encodedBody}`
  }
  if (channel === "sms") {
    return `sms:${phone.replace(/\s/g, "")}?&body=${encodedBody}`
  }
  // Opens Gmail compose in the browser
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodedSubject}&body=${encodedBody}`
}

const channelMeta = {
  whatsapp: { label: "Open WhatsApp", title: "WhatsApp Reminder", icon: MessageSquare },
  sms: { label: "Open SMS", title: "SMS Reminder", icon: Send },
  email: { label: "Open Gmail", title: "Gmail Reminder", icon: Mail },
} as const

export function ReminderModal({ open, onOpenChange, appointment, channel }: ReminderModalProps) {
  const { t } = useTranslation()
  const sendReminder = useSendReminder()
  const [message, setMessage] = useState("")
  const [preview, setPreview] = useState(false)

  const patient = appointment ? getPatient(appointment.patientId) : null
  const treatment = appointment ? getTreatment(appointment.treatmentId) : null
  const clinic = getClinicSettings()

  const defaultMessage = patient && appointment
    ? buildAppointmentMessage(
        `${patient.firstName} ${patient.lastName}`,
        appointment.date,
        appointment.time,
        treatment?.name,
        clinic.clinicName
      )
    : ""

  const displayMessage = message || defaultMessage
  const meta = channelMeta[channel]
  const subject = `Rappel de rendez-vous — ${appointment?.date ?? ""} ${appointment?.time ?? ""}`

  const handleSend = async () => {
    if (!appointment || !patient) return

    if (channel === "email" && !patient.email) {
      toast.error(`${patient.firstName} has no email on file`)
      return
    }
    if (channel !== "email" && !patient.phone) {
      toast.error(`${patient.firstName} has no phone number on file`)
      return
    }

    const link = buildChannelLink(channel, patient.phone, patient.email, subject, displayMessage)
    window.open(link, "_blank", "noopener,noreferrer")

    await sendReminder.mutateAsync({
      appointmentId: appointment.id,
      patientId: patient.id,
      channel,
      content: displayMessage,
    })
    toast.success(
      channel === "email"
        ? `Gmail opened for ${patient.firstName}`
        : channel === "whatsapp"
          ? `WhatsApp opened for ${patient.firstName}`
          : `SMS opened for ${patient.firstName}`
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>
            {patient ? `${patient.firstName} ${patient.lastName} ${patient.nationalityFlag}` : ""}
            {patient && (
              <span className="block text-xs mt-0.5">
                {channel === "email" ? patient.email || "No email" : patient.phone || "No phone"}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {preview ? (
            <div className="rounded-xl bg-muted p-4 text-sm whitespace-pre-wrap">{displayMessage}</div>
          ) : (
            <Textarea
              value={message || defaultMessage}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="rounded-xl"
            />
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPreview(!preview)}>
              {t("reminder.preview")}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPreview(false)}>
              {t("common.edit")}
            </Button>
            <Button size="sm" className="rounded-xl ml-auto gap-1.5" onClick={handleSend} disabled={sendReminder.isPending}>
              <meta.icon className="h-3.5 w-3.5" />
              {sendReminder.isPending ? t("reminder.sending") : meta.label}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
