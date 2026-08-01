import { useState, useMemo } from "react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAllAppointments } from "@/hooks/useData"
import { getPatient, getTreatment } from "@/lib/mockDataStore"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/lib/types"

type ViewMode = "day" | "week" | "month"

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: allAppointments = [] } = useAllAppointments()
  const [draggedAppt, setDraggedAppt] = useState<Appointment | null>(null)

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const hours = Array.from({ length: 11 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`)

  const getApptsForDay = (day: Date) =>
    allAppointments.filter((a) => isSameDay(new Date(a.date), day))

  return (
    <PageTransition>
      <PageHeader title="Calendar" description="Drag and drop appointments" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setCurrentDate(addDays(currentDate, view === "day" ? -1 : -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[180px] text-center">
            {format(currentDate, view === "month" ? "MMMM yyyy" : "dd MMM yyyy")}
          </span>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setCurrentDate(addDays(currentDate, view === "day" ? 1 : 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </div>
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((v) => (
            <Button key={v} variant={view === v ? "default" : "outline"} size="sm" className="rounded-xl capitalize" onClick={() => setView(v)}>
              {v}
            </Button>
          ))}
        </div>
      </div>

      {view === "week" && (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 text-xs text-muted-foreground" />
            {weekDays.map((day) => (
              <div key={day.toISOString()} className={cn("p-3 text-center border-l", isSameDay(day, new Date()) && "bg-primary/5")}>
                <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                <p className={cn("font-semibold", isSameDay(day, new Date()) && "text-primary")}>{format(day, "d")}</p>
              </div>
            ))}
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
                <div className="p-2 text-xs text-muted-foreground text-right pr-3">{hour}</div>
                {weekDays.map((day) => {
                  const dayAppts = getApptsForDay(day).filter((a) => a.time.startsWith(hour.slice(0, 2)))
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="border-l p-1 relative"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedAppt) {
                          // Mock drag-drop — would update store in real app
                          setDraggedAppt(null)
                        }
                      }}
                    >
                      {dayAppts.map((a) => {
                        const patient = getPatient(a.patientId)
                        const treatment = getTreatment(a.treatmentId)
                        return (
                          <div
                            key={a.id}
                            draggable
                            onDragStart={() => setDraggedAppt(a)}
                            className="rounded-lg bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-1 mb-0.5 cursor-grab active:cursor-grabbing truncate"
                            style={{ height: `${Math.max(1, a.duration / 30) * 28}px` }}
                          >
                            {patient?.firstName} · {treatment?.name}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </Card>
      )}

      {view === "day" && (
        <Card className="p-6 space-y-3">
          {getApptsForDay(currentDate).map((a) => {
            const patient = getPatient(a.patientId)
            const treatment = getTreatment(a.treatmentId)
            return (
              <div key={a.id} className="flex gap-4 items-center rounded-xl bg-muted/50 p-4">
                <span className="font-semibold text-primary w-16">{a.time}</span>
                <div>
                  <p className="font-medium">{patient?.firstName} {patient?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{treatment?.name} · {a.duration} min</p>
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {view === "month" && (
        <Card className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {eachDayOfInterval({
              start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
              end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
            }).map((day) => {
              const count = getApptsForDay(day).length
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "rounded-xl border p-2 min-h-[80px] text-center",
                    isSameDay(day, new Date()) && "border-primary bg-primary/5"
                  )}
                >
                  <p className="text-sm font-medium">{format(day, "d")}</p>
                  {count > 0 && (
                    <span className="inline-block mt-1 text-[10px] bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                      {count}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </PageTransition>
  )
}
