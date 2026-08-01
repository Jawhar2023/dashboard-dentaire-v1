import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, RefreshCw, Copy } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import {
  doctors,
  treatments,
  generatePortalUsername,
  generatePortalPassword,
} from "@/lib/mockDataStore"
import { useCreatePatient, useUpdatePatient } from "@/hooks/useData"
import { NATIONALITIES, getNationalityFlag, getNationalityCode, getDicebearAvatar } from "@/lib/constants"
import { toast } from "sonner"
import type { Patient, PaymentStatus } from "@/lib/types"

interface PatientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient
}

interface FormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  nationality: string
  passport: string
  doctorId: string
  treatmentId: string
  paymentStatus: PaymentStatus
  isInternational: boolean
  emergencyContact: string
  notes: string
  portalUsername: string
  portalPassword: string
}

function patientToForm(patient: Patient): FormData {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    email: patient.email,
    nationality: patient.nationality,
    passport: patient.passport ?? "",
    doctorId: patient.doctorId ?? "",
    treatmentId: patient.treatmentId ?? "",
    paymentStatus: patient.paymentStatus,
    isInternational: patient.isInternational,
    emergencyContact: patient.emergencyContact ?? "",
    notes: patient.notes ?? "",
    portalUsername: patient.portalUsername ?? "",
    portalPassword: patient.portalPassword ?? "",
  }
}

export function PatientFormDialog({ open, onOpenChange, patient }: PatientFormDialogProps) {
  const isEdit = !!patient
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: patient
      ? patientToForm(patient)
      : {
          nationality: "Tunisia",
          paymentStatus: "unpaid",
          isInternational: false,
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          passport: "",
          doctorId: "",
          treatmentId: "",
          emergencyContact: "",
          notes: "",
        },
  })

  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (open) {
      setShowPassword(false)
      reset(patient ? patientToForm(patient) : {
        nationality: "Tunisia",
        paymentStatus: "unpaid",
        isInternational: false,
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        passport: "",
        doctorId: "",
        treatmentId: "",
        emergencyContact: "",
        notes: "",
        portalUsername: "",
        portalPassword: generatePortalPassword(),
      })
    }
  }, [open, patient, reset])

  const isInternational = watch("isInternational")
  const firstName = watch("firstName")
  const lastName = watch("lastName")
  const nationality = watch("nationality")
  const paymentStatus = watch("paymentStatus")
  const doctorId = watch("doctorId")
  const treatmentId = watch("treatmentId")
  const portalUsername = watch("portalUsername")
  const portalPassword = watch("portalPassword")
  const isPending = createPatient.isPending || updatePatient.isPending
  const previewAvatar = getDicebearAvatar(`${firstName}${lastName}`.trim() || patient?.firstName || "Patient")

  useEffect(() => {
    if (!patient && firstName && lastName && !portalUsername) {
      setValue("portalUsername", generatePortalUsername(firstName, lastName))
    }
  }, [firstName, lastName, patient, portalUsername, setValue])

  const regenerateUsername = () => {
    setValue("portalUsername", generatePortalUsername(firstName || "patient", lastName || "user"))
  }

  const regeneratePassword = () => {
    setValue("portalPassword", generatePortalPassword())
    setShowPassword(true)
  }

  const copyCredentials = async () => {
    const uname = portalUsername?.trim()
    const pwd = portalPassword?.trim()
    if (!uname || !pwd) {
      toast.error("Set username and password first")
      return
    }
    try {
      await navigator.clipboard.writeText(`Username: ${uname}\nPassword: ${pwd}`)
      toast.success("Credentials copied to clipboard")
    } catch {
      toast.error("Could not copy — please copy manually")
    }
  }

  const buildPatientFields = (data: FormData): Omit<Patient, "id"> => ({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    nationality: data.nationality,
    nationalityFlag: getNationalityFlag(data.nationality),
    passport: data.passport.trim() || undefined,
    avatar: getDicebearAvatar(`${data.firstName.trim()}${data.lastName.trim()}`),
    arrival: patient?.arrival,
    departure: patient?.departure,
    hotelId: patient?.hotelId,
    driverId: patient?.driverId,
    doctorId: data.doctorId || undefined,
    treatmentId: data.treatmentId || undefined,
    paymentStatus: data.paymentStatus,
    isInternational: data.isInternational,
    emergencyContact: data.emergencyContact.trim() || undefined,
    visaNotes: patient?.visaNotes,
    notes: data.notes.trim() || undefined,
    portalUsername: data.portalUsername.trim().toLowerCase() || undefined,
    portalPassword: data.portalPassword.trim() || undefined,
  })

  const onSubmit = async (data: FormData) => {
    if (!data.firstName.trim() || !data.lastName.trim() || !data.phone.trim()) {
      toast.error("First name, last name, and phone are required")
      return
    }

    if (isEdit && patient) {
      await updatePatient.mutateAsync({ id: patient.id, data: buildPatientFields(data) })
      toast.success(`${data.firstName} ${data.lastName} updated`)
      onOpenChange(false)
      return
    }

    const created = await createPatient.mutateAsync(buildPatientFields(data))
    toast.success(`${created.firstName} ${created.lastName} added`)
    onOpenChange(false)
    navigate(`/patients/${created.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Patient" : "Add Patient"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
            <PatientAvatar
              name={`${firstName} ${lastName}`.trim() || "Patient"}
              avatar={previewAvatar}
              countryCode={getNationalityCode(nationality)}
              size="lg"
            />
            <div>
              <p className="text-sm font-medium">Character profile</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Auto-generated from patient name
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input className="rounded-xl" {...register("firstName", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input className="rounded-xl" {...register("lastName", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input className="rounded-xl" type="tel" {...register("phone", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input className="rounded-xl" type="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Select value={nationality} onValueChange={(v) => setValue("nationality", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map((n) => (
                    <SelectItem key={n.name} value={n.name}>{n.flag} {n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Passport</Label>
              <Input className="rounded-xl" {...register("passport")} />
            </div>
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={doctorId || undefined} onValueChange={(v) => setValue("doctorId", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Treatment</Label>
              <Select value={treatmentId || undefined} onValueChange={(v) => setValue("treatmentId", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {treatments.map((tr) => (
                    <SelectItem key={tr.id} value={tr.id}>{tr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(v) => setValue("paymentStatus", v as PaymentStatus)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Patient portal access</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Give the patient a login so they can see their treatments & payments
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-lg gap-1.5 h-8"
                onClick={copyCredentials}
                disabled={!portalUsername || !portalPassword}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Username</Label>
                <div className="flex gap-1.5">
                  <Input
                    className="rounded-xl bg-background"
                    placeholder="ahmed.benali42"
                    {...register("portalUsername")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-10 w-10 shrink-0"
                    onClick={regenerateUsername}
                    title="Generate username"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Input
                      className="rounded-xl bg-background pr-9"
                      type={showPassword ? "text" : "password"}
                      {...register("portalPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-10 w-10 shrink-0"
                    onClick={regeneratePassword}
                    title="Generate password"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isInternational}
              onCheckedChange={(c) => setValue("isInternational", !!c)}
              id="isInternational"
            />
            <label htmlFor="isInternational" className="text-sm">International patient</label>
          </div>

          {isInternational && (
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input className="rounded-xl" {...register("emergencyContact")} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea className="rounded-xl" rows={3} {...register("notes")} />
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

/** @deprecated Use PatientFormDialog */
export function NewPatientDialog(props: Omit<PatientFormDialogProps, "patient">) {
  return <PatientFormDialog {...props} />
}
