import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Search, Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { NewPatientDialog } from "@/components/patients/PatientFormDialog"
import { usePatients } from "@/hooks/useData"
import { getDoctor, getTreatment } from "@/lib/mockDataStore"
import { getNationalityCode } from "@/lib/constants"

export default function PatientsPage() {
  const { t } = useTranslation()
  const { data: patientList = [], isLoading } = usePatients()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = patientList.filter((p) => {
    const q = search.toLowerCase()
    return (
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.nationality.toLowerCase().includes(q) ||
      p.passport?.toLowerCase().includes(q)
    )
  })

  return (
    <PageTransition>
      <PageHeader
        title={t("nav.patients")}
        description={`${patientList.length} patients`}
        action={
          <Button className="rounded-xl gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add Patient
          </Button>
        }
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common.search")}
          className="pl-10 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-[18px] bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const doctor = p.doctorId ? getDoctor(p.doctorId) : null
            const treatment = p.treatmentId ? getTreatment(p.treatmentId) : null
            return (
              <Link key={p.id} to={`/patients/${p.id}`}>
                <Card className="p-5 transition-all duration-200 hover:shadow-card-hover hover:scale-[1.01]">
                  <div className="flex items-start gap-4">
                    <PatientAvatar
                      name={`${p.firstName} ${p.lastName}`}
                      avatar={p.avatar}
                      countryCode={getNationalityCode(p.nationality)}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {p.firstName} {p.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{p.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">{p.nationality}</p>
                      {treatment && <p className="text-sm text-primary mt-2">{treatment.name}</p>}
                      {doctor && <p className="text-xs text-muted-foreground">{doctor.name}</p>}
                      <div className="mt-3">
                        <StatusBadge status={p.paymentStatus} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
      <NewPatientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </PageTransition>
  )
}
