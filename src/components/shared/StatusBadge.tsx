import { Badge } from "@/components/ui/badge"
import type { AppointmentStatus, PaymentStatus } from "@/lib/types"
import { useTranslation } from "react-i18next"

type StatusType = AppointmentStatus | PaymentStatus | string

const variantMap: Record<string, "confirmed" | "arrived" | "waiting" | "completed" | "cancelled" | "treatment" | "paid" | "partial" | "unpaid" | "default"> = {
  confirmed: "confirmed",
  arrived: "arrived",
  waiting: "waiting",
  completed: "completed",
  cancelled: "cancelled",
  treatment: "treatment",
  paid: "paid",
  partial: "partial",
  unpaid: "unpaid",
}

export function StatusBadge({ status }: { status: StatusType }) {
  const { t } = useTranslation()
  const variant = variantMap[status] ?? "default"
  const label = t(`status.${status}`, status)

  return <Badge variant={variant}>{label}</Badge>
}
