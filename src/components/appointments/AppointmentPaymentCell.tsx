import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn, paymentStatusFromAmount, resolveAmountPaid } from "@/lib/utils"
import type { PaymentStatus } from "@/lib/types"

const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "partial", "paid"]

const paymentTriggerClass: Record<PaymentStatus, string> = {
  unpaid: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  partial: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  refunded: "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700",
}

interface AppointmentPaymentCellProps {
  total: number
  paymentStatus: PaymentStatus
  amountPaid?: number
  onChange: (data: { paymentStatus: PaymentStatus; amountPaid: number; total?: number }) => void
  disabled?: boolean
}

export function AppointmentPaymentCell({
  total,
  paymentStatus,
  amountPaid,
  onChange,
  disabled,
}: AppointmentPaymentCellProps) {
  const { t } = useTranslation()
  const paid = resolveAmountPaid(total, paymentStatus, amountPaid)
  const rest = Math.max(0, total - paid)
  const [draft, setDraft] = useState(String(paid))
  const [totalDraft, setTotalDraft] = useState(String(total))

  useEffect(() => {
    setDraft(String(resolveAmountPaid(total, paymentStatus, amountPaid)))
  }, [total, paymentStatus, amountPaid])

  useEffect(() => {
    setTotalDraft(String(total))
  }, [total])

  const commitPaid = (raw: string) => {
    const n = Number(raw)
    if (Number.isNaN(n) || n < 0) {
      setDraft(String(paid))
      return
    }
    const nextPaid = Math.min(total, Math.round(n))
    onChange({
      amountPaid: nextPaid,
      paymentStatus: paymentStatusFromAmount(total, nextPaid),
    })
  }

  const commitTotal = (raw: string) => {
    const n = Number(raw)
    if (Number.isNaN(n) || n < 0) {
      setTotalDraft(String(total))
      return
    }
    const nextTotal = Math.round(n)
    const nextPaid = Math.min(paid, nextTotal)
    onChange({
      total: nextTotal,
      amountPaid: nextPaid,
      paymentStatus: paymentStatusFromAmount(nextTotal, nextPaid),
    })
  }

  const handleStatus = (status: PaymentStatus) => {
    const nextPaid =
      status === "paid" ? total : status === "unpaid" ? 0 : Math.max(1, Math.min(total - 1, paid || Math.round(total * 0.3)))
    setDraft(String(nextPaid))
    onChange({ paymentStatus: status, amountPaid: nextPaid })
  }

  return (
    <div className="min-w-[180px] space-y-1.5">
      <Select
        value={paymentStatus === "refunded" ? "unpaid" : paymentStatus}
        onValueChange={(v) => handleStatus(v as PaymentStatus)}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-full rounded-xl text-xs font-medium border",
            paymentTriggerClass[paymentStatus]
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`status.${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-3 gap-1 text-[10px]">
        <div className="rounded-lg bg-muted/50 px-1.5 py-1">
          <p className="text-muted-foreground leading-none mb-0.5">Total</p>
          <Input
            className="h-6 rounded-md border-0 bg-transparent p-0 text-xs font-semibold tabular-nums shadow-none focus-visible:ring-0"
            type="number"
            min={0}
            value={totalDraft}
            disabled={disabled}
            onChange={(e) => setTotalDraft(e.target.value)}
            onBlur={() => commitTotal(totalDraft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                commitTotal(totalDraft)
                ;(e.target as HTMLInputElement).blur()
              }
            }}
          />
        </div>
        <div className="rounded-lg bg-muted/50 px-1.5 py-1">
          <p className="text-muted-foreground leading-none mb-0.5">Payé</p>
          <Input
            className="h-6 rounded-md border-0 bg-transparent p-0 text-xs font-semibold tabular-nums shadow-none focus-visible:ring-0"
            type="number"
            min={0}
            max={total}
            value={draft}
            disabled={disabled}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitPaid(draft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                commitPaid(draft)
                ;(e.target as HTMLInputElement).blur()
              }
            }}
          />
        </div>
        <div className="rounded-lg bg-muted/50 px-1.5 py-1">
          <p className="text-muted-foreground leading-none mb-0.5">Reste</p>
          <p className={cn("font-semibold tabular-nums", rest > 0 ? "text-amber-600" : "text-emerald-600")}>
            {rest}dt
          </p>
        </div>
      </div>
    </div>
  )
}
