import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteRappelNote } from "@/hooks/useData"
import { toast } from "sonner"
import type { RappelNote } from "@/lib/types"

interface DeleteRappelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: RappelNote
}

export function DeleteRappelDialog({ open, onOpenChange, note }: DeleteRappelDialogProps) {
  const deleteNote = useDeleteRappelNote()

  const handleDelete = async () => {
    await deleteNote.mutateAsync(note.id)
    toast.success("Rappel supprimé")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Supprimer ce rappel ?</DialogTitle>
          <DialogDescription>
            Cette action est définitive et ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl"
            onClick={() => void handleDelete()}
            disabled={deleteNote.isPending}
          >
            {deleteNote.isPending ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
