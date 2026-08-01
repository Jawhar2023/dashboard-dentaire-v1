import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && <p className="text-muted-foreground mt-2 max-w-sm">{description}</p>}
      </CardContent>
    </Card>
  )
}
