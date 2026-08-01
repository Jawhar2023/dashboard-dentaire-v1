import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeletePayment } from "@/hooks/useData"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import type { Payment } from "@/lib/types"

interface DeletePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment
}

export function DeletePaymentDialog({ open, onOpenChange, payment }: DeletePaymentDialogProps) {
  const deletePayment = useDeletePayment()

  const handleDelete = async () => {
    await deletePayment.mutateAsync({ id: payment.id, patientId: payment.patientId })
    toast.success("Payment deleted")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete payment?</DialogTitle>
          <DialogDescription>
            This will remove the {formatCurrency(payment.amount)} payment. The patient’s balance will be recalculated.
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
            disabled={deletePayment.isPending}
          >
            {deletePayment.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
