import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeletePatient } from "@/hooks/useData"
import { toast } from "sonner"
import type { Patient } from "@/lib/types"

interface DeletePatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient
  onDeleted: () => void
}

export function DeletePatientDialog({ open, onOpenChange, patient, onDeleted }: DeletePatientDialogProps) {
  const deletePatient = useDeletePatient()

  const handleDelete = async () => {
    await deletePatient.mutateAsync(patient.id)
    toast.success(`${patient.firstName} ${patient.lastName} deleted`)
    onOpenChange(false)
    onDeleted()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete patient?</DialogTitle>
          <DialogDescription>
            This will permanently remove {patient.firstName} {patient.lastName} and their appointments.
            This action cannot be undone.
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
            disabled={deletePatient.isPending}
          >
            {deletePatient.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
