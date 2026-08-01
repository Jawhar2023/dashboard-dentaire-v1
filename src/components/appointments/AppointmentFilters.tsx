import { useTranslation } from "react-i18next"
import { LayoutList, Table2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { doctors, treatments, patients } from "@/lib/mockDataStore"
import type { AppointmentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface AppointmentFilters {
  dateRange: "today" | "tomorrow" | "week"
  status: AppointmentStatus | "all"
  doctorId: string
  treatmentId: string
  nationality: string
  search: string
}

export type AppointmentViewMode = "timeline" | "table"

interface AppointmentFiltersBarProps {
  filters: AppointmentFilters
  onChange: (filters: AppointmentFilters) => void
  viewMode?: AppointmentViewMode
  onViewModeChange?: (mode: AppointmentViewMode) => void
}

const statuses: (AppointmentStatus | "all")[] = ["all", "confirmed", "waiting", "arrived", "completed", "cancelled"]

const nationalities = ["all", ...new Set(patients.map((p) => p.nationality))]

export function AppointmentFiltersBar({ filters, onChange, viewMode, onViewModeChange }: AppointmentFiltersBarProps) {
  const { t } = useTranslation()

  const set = (partial: Partial<AppointmentFilters>) => onChange({ ...filters, ...partial })

  return (
    <div className="space-y-3 mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="rounded-xl pl-9 pr-9 h-10"
          placeholder="Search patient or doctor…"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
        />
        {filters.search && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => set({ search: "" })}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onViewModeChange && (
          <div className="flex rounded-xl border border-border/60 p-0.5 bg-muted/30">
            <Button
              variant={viewMode === "timeline" ? "default" : "ghost"}
              size="sm"
              className="rounded-lg gap-1.5 h-8"
              onClick={() => onViewModeChange("timeline")}
            >
              <LayoutList className="h-3.5 w-3.5" /> Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-lg gap-1.5 h-8"
              onClick={() => onViewModeChange("table")}
            >
              <Table2 className="h-3.5 w-3.5" /> Table
            </Button>
          </div>
        )}

        {(["today", "tomorrow", "week"] as const).map((range) => (
          <Button
            key={range}
            variant={filters.dateRange === range ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => set({ dateRange: range })}
          >
            {range === "today" ? t("common.today") : range === "tomorrow" ? t("common.tomorrow") : t("common.thisWeek")}
          </Button>
        ))}

        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set({ status: s })}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filters.status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s === "all" ? "All" : t(`status.${s}`)}
            </button>
          ))}
        </div>

        <Select value={filters.doctorId} onValueChange={(v) => set({ doctorId: v })}>
          <SelectTrigger className="w-[160px] rounded-xl h-9">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.treatmentId} onValueChange={(v) => set({ treatmentId: v })}>
          <SelectTrigger className="w-[160px] rounded-xl h-9">
            <SelectValue placeholder="Treatment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Treatments</SelectItem>
            {treatments.map((tr) => (
              <SelectItem key={tr.id} value={tr.id}>{tr.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.nationality} onValueChange={(v) => set({ nationality: v })}>
          <SelectTrigger className="w-[140px] rounded-xl h-9">
            <SelectValue placeholder="Nationality" />
          </SelectTrigger>
          <SelectContent>
            {nationalities.map((n) => (
              <SelectItem key={n} value={n}>{n === "all" ? "All" : n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
