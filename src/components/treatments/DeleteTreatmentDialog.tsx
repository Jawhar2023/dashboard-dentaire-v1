import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteTreatment } from "@/hooks/useData"
import { toast } from "sonner"
import type { Treatment } from "@/lib/types"

interface DeleteTreatmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  treatment: Treatment
}

export function DeleteTreatmentDialog({ open, onOpenChange, treatment }: DeleteTreatmentDialogProps) {
  const deleteTreatment = useDeleteTreatment()

  const handleDelete = async () => {
    await deleteTreatment.mutateAsync(treatment.id)
    toast.success(`${treatment.name} deleted`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete treatment?</DialogTitle>
          <DialogDescription>
            This will remove {treatment.name} from the catalog. Patients and appointments linked to
            this treatment will be reassigned or unlinked. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl"
            onClick={handleDelete}
            disabled={deleteTreatment.isPending}
          >
            {deleteTreatment.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
