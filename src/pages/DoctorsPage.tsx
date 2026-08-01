import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Phone, Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { Badge } from "@/components/ui/badge"
import { DoctorFormDialog } from "@/components/doctors/DoctorFormDialog"
import { DeleteDoctorDialog } from "@/components/doctors/DeleteDoctorDialog"
import { useDoctors } from "@/hooks/useData"
import type { Doctor } from "@/lib/types"

export default function DoctorsPage() {
  const { t } = useTranslation()
  const { data: doctorList = [], isLoading } = useDoctors()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>()

  const openAdd = () => {
    setSelectedDoctor(undefined)
    setFormOpen(true)
  }

  const openEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setFormOpen(true)
  }

  const openDelete = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setDeleteOpen(true)
  }

  return (
    <PageTransition>
      <PageHeader
        title={t("nav.doctors")}
        description="Medical team directory"
        action={
          <Button className="rounded-xl gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Doctor
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-[18px] bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctorList.map((d) => (
            <Card key={d.id} className="p-6 transition-all hover:shadow-card-hover">
              <div className="flex items-start gap-4">
                <PatientAvatar name={d.name} avatar={d.avatar} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{d.name}</h3>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(d)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                        onClick={() => openDelete(d)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-primary mt-1">{d.specialty}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Phone className="h-3 w-3" />{d.phone}
                  </p>
                  <Badge variant={d.available ? "confirmed" : "waiting"} className="mt-3">
                    {d.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DoctorFormDialog open={formOpen} onOpenChange={setFormOpen} doctor={selectedDoctor} />
      {selectedDoctor && (
        <DeleteDoctorDialog open={deleteOpen} onOpenChange={setDeleteOpen} doctor={selectedDoctor} />
      )}
    </PageTransition>
  )
}
