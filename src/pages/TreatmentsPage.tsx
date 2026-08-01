import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Clock, Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreatmentFormDialog } from "@/components/treatments/TreatmentFormDialog"
import { DeleteTreatmentDialog } from "@/components/treatments/DeleteTreatmentDialog"
import { useTreatments } from "@/hooks/useData"
import { formatCurrency } from "@/lib/utils"
import type { Treatment } from "@/lib/types"

export default function TreatmentsPage() {
  const { t } = useTranslation()
  const { data: treatmentList = [], isLoading } = useTreatments()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | undefined>()

  const openAdd = () => {
    setSelectedTreatment(undefined)
    setFormOpen(true)
  }

  const openEdit = (treatment: Treatment) => {
    setSelectedTreatment(treatment)
    setFormOpen(true)
  }

  const openDelete = (treatment: Treatment) => {
    setSelectedTreatment(treatment)
    setDeleteOpen(true)
  }

  return (
    <PageTransition>
      <PageHeader
        title={t("nav.treatments")}
        description="Treatment catalog & pricing"
        action={
          <Button className="rounded-xl gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Treatment
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
          {treatmentList.map((tr) => (
            <Card key={tr.id} className="p-6 transition-all hover:shadow-card-hover hover:scale-[1.01]">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight">{tr.name}</h3>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(tr)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                        onClick={() => openDelete(tr)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{tr.category}</p>
                </div>
                <span className="text-lg font-bold text-primary shrink-0">{formatCurrency(tr.price)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-4 flex items-center gap-1">
                <Clock className="h-4 w-4" /> {tr.duration} min
              </p>
            </Card>
          ))}
        </div>
      )}

      <TreatmentFormDialog open={formOpen} onOpenChange={setFormOpen} treatment={selectedTreatment} />
      {selectedTreatment && (
        <DeleteTreatmentDialog open={deleteOpen} onOpenChange={setDeleteOpen} treatment={selectedTreatment} />
      )}
    </PageTransition>
  )
}
