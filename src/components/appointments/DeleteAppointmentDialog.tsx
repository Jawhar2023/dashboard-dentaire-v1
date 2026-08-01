import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteAppointment } from "@/hooks/useData"
import { getPatient } from "@/lib/mockDataStore"
import { toast } from "sonner"
import type { Appointment } from "@/lib/types"

interface DeleteAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment
}

export function DeleteAppointmentDialog({ open, onOpenChange, appointment }: DeleteAppointmentDialogProps) {
  const deleteAppointment = useDeleteAppointment()
  const patient = getPatient(appointment.patientId)
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "this patient"

  const handleDelete = async () => {
    await deleteAppointment.mutateAsync(appointment.id)
    toast.success("Appointment deleted")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete appointment?</DialogTitle>
          <DialogDescription>
            This will permanently remove the appointment for {patientName} on{" "}
            {appointment.date} at {appointment.time}. This action cannot be undone.
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
            disabled={deleteAppointment.isPending}
          >
            {deleteAppointment.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
