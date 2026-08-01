import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteDoctor } from "@/hooks/useData"
import { toast } from "sonner"
import type { Doctor } from "@/lib/types"

interface DeleteDoctorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor: Doctor
}

export function DeleteDoctorDialog({ open, onOpenChange, doctor }: DeleteDoctorDialogProps) {
  const deleteDoctor = useDeleteDoctor()

  const handleDelete = async () => {
    await deleteDoctor.mutateAsync(doctor.id)
    toast.success(`${doctor.name} deleted`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete doctor?</DialogTitle>
          <DialogDescription>
            This will remove {doctor.name} from the team. Patients linked to this doctor will be unassigned.
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
            disabled={deleteDoctor.isPending}
          >
            {deleteDoctor.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
