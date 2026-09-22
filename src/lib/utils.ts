import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PaymentStatus } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "TND") {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatAppointmentTime(time: string) {
  return time.replace(":", "h")
}

export function resolveAmountPaid(total: number, status: PaymentStatus, amountPaid?: number) {
  if (typeof amountPaid === "number" && !Number.isNaN(amountPaid)) {
    return Math.max(0, Math.min(total, amountPaid))
  }
  if (status === "paid") return total
  if (status === "partial") return Math.round(total * 0.3)
  return 0
}

export function paymentStatusFromAmount(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return "unpaid"
  if (paid >= total) return "paid"
  return "partial"
}

export function formatPaymentSummary(total: number, status: PaymentStatus, amountPaid?: number) {
  const paid = resolveAmountPaid(total, status, amountPaid)
  const rest = Math.max(0, total - paid)
  if (status === "paid" || paid >= total) return `tt ${total}dt — payé`
  if (status === "partial" || (paid > 0 && paid < total)) {
    return `tt ${total}dt a donné ${paid}dt rst ${rest}dt`
  }
  if (status === "refunded") return `tt ${total}dt — remboursé`
  return `tt ${total}dt — non payé`
}

export function delay(_ms = 0) {
  return Promise.resolve()
}
