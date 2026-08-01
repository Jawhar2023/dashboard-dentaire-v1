import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteBeforeAfter } from "@/hooks/useData"
import { toast } from "sonner"
import type { BeforeAfterPhoto } from "@/lib/types"

interface DeleteBeforeAfterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  photo: BeforeAfterPhoto
}

export function DeleteBeforeAfterDialog({
  open,
  onOpenChange,
  photo,
}: DeleteBeforeAfterDialogProps) {
  const deletePhoto = useDeleteBeforeAfter()

  const handleDelete = async () => {
    await deletePhoto.mutateAsync({ id: photo.id, patientId: photo.patientId })
    toast.success(`“${photo.treatment}” deleted`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete photo?</DialogTitle>
          <DialogDescription>
            This will remove the before/after set “{photo.treatment}”. This action cannot be undone.
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
            disabled={deletePhoto.isPending}
          >
            {deletePhoto.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
