import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientSearchSelect } from "@/components/appointments/PatientSearchSelect"
import { AppointmentTimePicker } from "@/components/appointments/AppointmentTimePicker"
import { AppointmentStatusSelect } from "@/components/appointments/AppointmentStatusSelect"
import { doctors, treatments } from "@/lib/mockDataStore"
import { useCreateAppointment, useUpdateAppointment, usePatients } from "@/hooks/useData"
import { format } from "date-fns"
import { toast } from "sonner"
import type { Appointment, AppointmentStatus } from "@/lib/types"

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: Appointment
  defaultPatientId?: string
}

interface FormData {
  patientId: string
  doctorId: string
  treatmentId: string
  date: string
  time: string
  duration: number
  status: AppointmentStatus
  notes: string
  smsReminder: boolean
  whatsappReminder: boolean
  emailReminder: boolean
  autoReminder24h: boolean
  autoReminder3h: boolean
  autoReminder1h: boolean
}

function appointmentToForm(a: Appointment): FormData {
  return {
    patientId: a.patientId,
    doctorId: a.doctorId,
    treatmentId: a.treatmentId,
    date: a.date,
    time: a.time,
    duration: a.duration,
    status: a.status,
    notes: a.notes ?? "",
    smsReminder: a.smsReminder,
    whatsappReminder: a.whatsappReminder,
    emailReminder: a.emailReminder,
    autoReminder24h: a.autoReminder24h,
    autoReminder3h: a.autoReminder3h,
    autoReminder1h: a.autoReminder1h,
  }
}

function emptyForm(): FormData {
  return {
    patientId: "",
    doctorId: "",
    treatmentId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    duration: 30,
    status: "confirmed",
    notes: "",
    smsReminder: true,
    whatsappReminder: true,
    emailReminder: false,
    autoReminder24h: true,
    autoReminder3h: true,
    autoReminder1h: true,
  }
}

export function AppointmentFormDialog({ open, onOpenChange, appointment, defaultPatientId }: AppointmentFormDialogProps) {
  const isEdit = !!appointment
  const { t } = useTranslation()
  const { data: patientList = [] } = usePatients()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: appointment ? appointmentToForm(appointment) : emptyForm(),
  })

  useEffect(() => {
    if (open) {
      reset(
        appointment
          ? appointmentToForm(appointment)
          : { ...emptyForm(), patientId: defaultPatientId ?? "" }
      )
    }
  }, [open, appointment, defaultPatientId, reset])

  const patientId = watch("patientId")
  const doctorId = watch("doctorId")
  const treatmentId = watch("treatmentId")
  const time = watch("time")
  const status = watch("status")
  const isPending = createAppointment.isPending || updateAppointment.isPending

  const onSubmit = async (data: FormData) => {
    if (!data.patientId || !data.doctorId || !data.treatmentId) {
      toast.error("Patient, treatment, and doctor are required")
      return
    }

    if (isEdit && appointment) {
      await updateAppointment.mutateAsync({ id: appointment.id, data })
      toast.success("Appointment updated")
      onOpenChange(false)
      return
    }

    const appt: Omit<Appointment, "id"> = {
      ...data,
      paymentStatus: "unpaid",
      amountPaid: 0,
      reminderStatus: "pending",
      arrivalStatus: "not_arrived",
    }
    await createAppointment.mutateAsync(appt)
    toast.success("Appointment created")
    reset(emptyForm())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit appointment" : t("common.newAppointment")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Patient *</Label>
              <PatientSearchSelect
                patients={patientList}
                value={patientId}
                onChange={(id) => setValue("patientId", id)}
              />
            </div>

            <div className="space-y-2">
              <Label>Treatment</Label>
              <Select value={treatmentId || undefined} onValueChange={(v) => {
                setValue("treatmentId", v)
                const tr = treatments.find((t) => t.id === v)
                if (tr) setValue("duration", tr.duration)
              }}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Treatment" /></SelectTrigger>
                <SelectContent>
                  {treatments.map((tr) => (
                    <SelectItem key={tr.id} value={tr.id}>{tr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={doctorId || undefined} onValueChange={(v) => setValue("doctorId", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" className="rounded-xl" {...register("date")} />
            </div>

            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input type="number" className="rounded-xl" {...register("duration", { valueAsNumber: true })} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Status</Label>
              <AppointmentStatusSelect
                value={status}
                onChange={(v) => setValue("status", v)}
                size="md"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Time *</Label>
              <AppointmentTimePicker
                value={time}
                onChange={(v) => setValue("time", v)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea className="rounded-xl" {...register("notes")} />
          </div>

          <div className="space-y-3 rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium">Reminders</p>
            {[
              { key: "smsReminder" as const, label: "SMS Reminder" },
              { key: "whatsappReminder" as const, label: "WhatsApp Reminder" },
              { key: "emailReminder" as const, label: "Email Reminder" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox checked={watch(key)} onCheckedChange={(c) => setValue(key, !!c)} id={key} />
                <label htmlFor={key} className="text-sm">{label}</label>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">Automatic reminders:</p>
            {[
              { key: "autoReminder24h" as const, label: "24 hours before" },
              { key: "autoReminder3h" as const, label: "3 hours before" },
              { key: "autoReminder1h" as const, label: "1 hour before" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox checked={watch(key)} onCheckedChange={(c) => setValue(key, !!c)} id={key} />
                <label htmlFor={key} className="text-sm">{label}</label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" className="rounded-xl" disabled={isPending}>
              {isPending ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function NewAppointmentDialog(props: Omit<AppointmentFormDialogProps, "appointment">) {
  return <AppointmentFormDialog {...props} />
}

export type { AppointmentFormDialogProps }
