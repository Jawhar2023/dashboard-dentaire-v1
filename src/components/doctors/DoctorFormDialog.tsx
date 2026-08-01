import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Plus } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { useCreateDoctor, useUpdateDoctor, useDoctorSpecialties, useAddDoctorSpecialty } from "@/hooks/useData"
import { getDicebearAvatar } from "@/lib/constants"
import { toast } from "sonner"
import type { Doctor } from "@/lib/types"

interface DoctorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor?: Doctor
}

interface FormData {
  name: string
  specialty: string
  phone: string
  available: boolean
}

const ADD_SPECIALTY_VALUE = "__add_specialty__"

function doctorToForm(doctor: Doctor): FormData {
  return {
    name: doctor.name,
    specialty: doctor.specialty,
    phone: doctor.phone,
    available: doctor.available,
  }
}

export function DoctorFormDialog({ open, onOpenChange, doctor }: DoctorFormDialogProps) {
  const isEdit = !!doctor
  const { t } = useTranslation()
  const createDoctor = useCreateDoctor()
  const updateDoctor = useUpdateDoctor()
  const { data: specialties = [] } = useDoctorSpecialties()
  const addSpecialty = useAddDoctorSpecialty()
  const [showCustomSpecialty, setShowCustomSpecialty] = useState(false)
  const [customSpecialty, setCustomSpecialty] = useState("")

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: doctor
      ? doctorToForm(doctor)
      : { name: "", specialty: "", phone: "", available: true },
  })

  useEffect(() => {
    if (open) {
      setShowCustomSpecialty(false)
      setCustomSpecialty("")
      reset(
        doctor
          ? doctorToForm(doctor)
          : { name: "", specialty: specialties[0] ?? "", phone: "", available: true }
      )
    }
  }, [open, doctor, reset, specialties])

  const name = watch("name")
  const specialty = watch("specialty")
  const available = watch("available")
  const isPending = createDoctor.isPending || updateDoctor.isPending
  const previewAvatar = getDicebearAvatar(name.trim() || doctor?.name || "Doctor")

  const handleAddSpecialty = async () => {
    const trimmed = customSpecialty.trim()
    if (!trimmed) {
      toast.error("Enter a specialty name")
      return
    }
    try {
      const added = await addSpecialty.mutateAsync(trimmed)
      setValue("specialty", added)
      setShowCustomSpecialty(false)
      setCustomSpecialty("")
      toast.success(`"${added}" added to specialties`)
    } catch {
      toast.error("Could not add specialty")
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!data.name.trim() || !data.phone.trim()) {
      toast.error("Name and phone are required")
      return
    }
    if (!data.specialty.trim() || data.specialty === ADD_SPECIALTY_VALUE) {
      toast.error("Select or add a specialty")
      return
    }

    const payload: Omit<Doctor, "id"> = {
      name: data.name.trim(),
      specialty: data.specialty,
      phone: data.phone.trim(),
      available: data.available,
      avatar: getDicebearAvatar(data.name.trim()),
    }

    if (isEdit && doctor) {
      await updateDoctor.mutateAsync({ id: doctor.id, data: payload })
      toast.success(`${data.name} updated`)
    } else {
      await createDoctor.mutateAsync(payload)
      toast.success(`${data.name} added`)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
            <PatientAvatar name={name || "Doctor"} avatar={previewAvatar} size="lg" />
            <div>
              <p className="text-sm font-medium">Character profile</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Auto-generated from the doctor&apos;s name
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input className="rounded-xl" placeholder="Dr. Jean Dupont" {...register("name", { required: true })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Select
                value={showCustomSpecialty ? ADD_SPECIALTY_VALUE : specialty}
                onValueChange={(v) => {
                  if (v === ADD_SPECIALTY_VALUE) {
                    setShowCustomSpecialty(true)
                    return
                  }
                  setShowCustomSpecialty(false)
                  setCustomSpecialty("")
                  setValue("specialty", v)
                }}
              >
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select specialty" /></SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                  <SelectItem value={ADD_SPECIALTY_VALUE} className="text-primary font-medium">
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add specialty
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {showCustomSpecialty && (
                <div className="flex gap-2">
                  <Input
                    className="rounded-xl"
                    placeholder="New specialty"
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        void handleAddSpecialty()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl shrink-0"
                    disabled={addSpecialty.isPending}
                    onClick={() => void handleAddSpecialty()}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input className="rounded-xl" type="tel" {...register("phone", { required: true })} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={available}
              onCheckedChange={(c) => setValue("available", !!c)}
              id="doctorAvailable"
            />
            <label htmlFor="doctorAvailable" className="text-sm">Available today</label>
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
