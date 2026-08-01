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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  useCreateTreatment,
  useUpdateTreatment,
  useTreatmentCategories,
  useAddTreatmentCategory,
} from "@/hooks/useData"
import { toast } from "sonner"
import type { Treatment } from "@/lib/types"

interface TreatmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  treatment?: Treatment
}

interface FormData {
  name: string
  category: string
  duration: number
  price: number
}

const ADD_CATEGORY_VALUE = "__add_category__"

function treatmentToForm(treatment: Treatment): FormData {
  return {
    name: treatment.name,
    category: treatment.category,
    duration: treatment.duration,
    price: treatment.price,
  }
}

export function TreatmentFormDialog({ open, onOpenChange, treatment }: TreatmentFormDialogProps) {
  const isEdit = !!treatment
  const { t } = useTranslation()
  const createTreatment = useCreateTreatment()
  const updateTreatment = useUpdateTreatment()
  const { data: categories = [] } = useTreatmentCategories()
  const addCategory = useAddTreatmentCategory()
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState("")

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: treatment
      ? treatmentToForm(treatment)
      : { name: "", category: "", duration: 30, price: 0 },
  })

  useEffect(() => {
    if (open) {
      setShowCustomCategory(false)
      setCustomCategory("")
      reset(
        treatment
          ? treatmentToForm(treatment)
          : { name: "", category: categories[0] ?? "", duration: 30, price: 0 }
      )
    }
  }, [open, treatment, reset, categories])

  const category = watch("category")
  const isPending = createTreatment.isPending || updateTreatment.isPending

  const handleAddCategory = async () => {
    const trimmed = customCategory.trim()
    if (!trimmed) {
      toast.error("Enter a category name")
      return
    }
    try {
      const added = await addCategory.mutateAsync(trimmed)
      setValue("category", added)
      setShowCustomCategory(false)
      setCustomCategory("")
      toast.success(`"${added}" added to categories`)
    } catch {
      toast.error("Could not add category")
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!data.name.trim()) {
      toast.error("Treatment name is required")
      return
    }
    if (!data.category.trim() || data.category === ADD_CATEGORY_VALUE) {
      toast.error("Select or add a category")
      return
    }
    if (data.duration <= 0) {
      toast.error("Duration must be greater than 0")
      return
    }
    if (data.price < 0) {
      toast.error("Price cannot be negative")
      return
    }

    const payload: Omit<Treatment, "id"> = {
      name: data.name.trim(),
      category: data.category,
      duration: Number(data.duration),
      price: Number(data.price),
    }

    if (isEdit && treatment) {
      await updateTreatment.mutateAsync({ id: treatment.id, data: payload })
      toast.success(`${data.name} updated`)
    } else {
      await createTreatment.mutateAsync(payload)
      toast.success(`${data.name} added`)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Treatment" : "Add Treatment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Treatment name *</Label>
            <Input className="rounded-xl" placeholder="Dental Implant" {...register("name", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={showCustomCategory ? ADD_CATEGORY_VALUE : category}
              onValueChange={(v) => {
                if (v === ADD_CATEGORY_VALUE) {
                  setShowCustomCategory(true)
                  return
                }
                setShowCustomCategory(false)
                setCustomCategory("")
                setValue("category", v)
              }}
            >
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
                <SelectItem value={ADD_CATEGORY_VALUE} className="text-primary font-medium">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add category
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {showCustomCategory && (
              <div className="flex gap-2">
                <Input
                  className="rounded-xl"
                  placeholder="New category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      void handleAddCategory()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl shrink-0"
                  disabled={addCategory.isPending}
                  onClick={() => void handleAddCategory()}
                >
                  Add
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (min) *</Label>
              <Input
                className="rounded-xl"
                type="number"
                min={1}
                {...register("duration", { required: true, valueAsNumber: true, min: 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Price (TND) *</Label>
              <Input
                className="rounded-xl"
                type="number"
                min={0}
                step={0.01}
                {...register("price", { required: true, valueAsNumber: true, min: 0 })}
              />
            </div>
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
