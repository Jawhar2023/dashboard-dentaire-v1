import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: string
  trendUp?: boolean
  className?: string
}

export function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <Card className={cn("p-6 transition-all duration-200 hover:shadow-card-hover", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          {trend && (
            <p className={cn("text-xs font-medium", trendUp ? "text-emerald-600" : "text-red-500")}>
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
