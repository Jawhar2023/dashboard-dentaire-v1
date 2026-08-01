import type { ReactNode } from "react"
import { AppSidebar } from "./AppSidebar"
import { TopNavBar } from "./TopNavBar"
import { CommandPalette } from "@/components/search/CommandPalette"
import { AIAssistant } from "@/components/ai/AIAssistant"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-[240px]">
        <TopNavBar />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
      <CommandPalette />
      <AIAssistant />
    </div>
  )
}
