import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassPanelProps {
  children: ReactNode
  className?: string
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div className={cn("glass rounded-[18px]", className)}>
      {children}
    </div>
  )
}
