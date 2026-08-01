import { useTranslation } from "react-i18next"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { AppointmentStatus } from "@/lib/types"

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "confirmed",
  "waiting",
  "arrived",
  "treatment",
  "completed",
  "cancelled",
]

const statusTriggerClass: Record<AppointmentStatus, string> = {
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  waiting: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  arrived: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  treatment: "border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
  completed: "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700",
  cancelled: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
}

interface AppointmentStatusSelectProps {
  value: AppointmentStatus
  onChange: (status: AppointmentStatus) => void
  disabled?: boolean
  className?: string
  size?: "sm" | "md"
}

export function AppointmentStatusSelect({
  value,
  onChange,
  disabled,
  className,
  size = "sm",
}: AppointmentStatusSelectProps) {
  const { t } = useTranslation()

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as AppointmentStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "rounded-xl font-medium border",
          size === "sm" ? "h-8 w-[140px] text-xs" : "h-10 w-full text-sm",
          statusTriggerClass[value],
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APPOINTMENT_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {t(`status.${s}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
