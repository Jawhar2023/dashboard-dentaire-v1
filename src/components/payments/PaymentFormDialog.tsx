import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PatientSearchSelect } from "@/components/appointments/PatientSearchSelect"
import { useCreatePayment, useUpdatePayment, usePatients, useTreatments } from "@/hooks/useData"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import type { Payment } from "@/lib/types"

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment?: Payment | null
  /** Lock to a patient (e.g. from profile page) */
  fixedPatientId?: string
}

interface FormData {
  patientId: string
  treatmentId: string
  amount: string
  method: Payment["method"]
  date: string
  status: Payment["status"]
}

function paymentToForm(payment: Payment, treatmentId?: string): FormData {
  return {
    patientId: payment.patientId,
    treatmentId: treatmentId ?? "",
    amount: String(payment.amount),
    method: payment.method,
    date: payment.date.slice(0, 10),
    status: payment.status,
  }
}

function emptyForm(patientId?: string, treatmentId?: string): FormData {
  return {
    patientId: patientId ?? "",
    treatmentId: treatmentId ?? "",
    amount: "",
    method: "cash",
    date: format(new Date(), "yyyy-MM-dd"),
    status: "completed",
  }
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  payment,
  fixedPatientId,
}: PaymentFormDialogProps) {
  const isEdit = !!payment
  const createPayment = useCreatePayment()
  const updatePayment = useUpdatePayment()
  const { data: patientList = [] } = usePatients()
  const { data: treatmentList = [] } = useTreatments()

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: emptyForm(fixedPatientId),
  })

  useEffect(() => {
    if (!open) return
    if (payment) {
      const patient = patientList.find((p) => p.id === payment.patientId)
      reset(paymentToForm(payment, patient?.treatmentId))
      return
    }
    const patient = patientList.find((p) => p.id === (fixedPatientId ?? ""))
    reset(emptyForm(fixedPatientId, patient?.treatmentId))
  }, [open, payment, fixedPatientId, reset, patientList])

  const patientId = watch("patientId")
  const treatmentId = watch("treatmentId")
  const method = watch("method")
  const status = watch("status")
  const isPending = createPayment.isPending || updatePayment.isPending

  useEffect(() => {
    if (!open || isEdit || !patientId) return
    const patient = patientList.find((p) => p.id === patientId)
    if (patient?.treatmentId) {
      setValue("treatmentId", patient.treatmentId)
    }
  }, [patientId, open, isEdit, patientList, setValue])

  const onSubmit = async (data: FormData) => {
    const amount = Number(data.amount)
    if (!data.patientId) {
      toast.error("Select a patient")
      return
    }
    if (!isEdit && !data.treatmentId) {
      toast.error("Select a treatment")
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }

    if (isEdit && payment) {
      await updatePayment.mutateAsync({
        id: payment.id,
        data: {
          patientId: data.patientId,
          amount,
          method: data.method,
          date: new Date(data.date).toISOString(),
          status: data.status,
        },
      })
      toast.success("Payment updated")
    } else {
      await createPayment.mutateAsync({
        patientId: data.patientId,
        amount,
        method: data.method,
        date: new Date(data.date).toISOString(),
        status: data.status,
        treatmentId: data.treatmentId || undefined,
      })
      toast.success("Payment recorded")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit payment" : "Add payment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!fixedPatientId && (
            <div className="space-y-2">
              <Label>Patient *</Label>
              <PatientSearchSelect
                patients={patientList}
                value={patientId}
                onChange={(id) => setValue("patientId", id)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Treatment *</Label>
              <Select
                value={treatmentId || undefined}
                onValueChange={(v) => {
                  setValue("treatmentId", v)
                  const tr = treatmentList.find((t) => t.id === v)
                  if (tr && !watch("amount")) {
                    setValue("amount", String(tr.price))
                  }
                }}
                disabled={isEdit}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose treatment…" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentList.map((tr) => (
                    <SelectItem key={tr.id} value={tr.id}>
                      {tr.name} · {formatCurrency(tr.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (TND) *</Label>
              <Input
                type="number"
                min={1}
                step={1}
                className="rounded-xl"
                placeholder="150"
                {...register("amount", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" className="rounded-xl" {...register("date")} />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={(v) => setValue("method", v as Payment["method"])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setValue("status", v as Payment["status"])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
