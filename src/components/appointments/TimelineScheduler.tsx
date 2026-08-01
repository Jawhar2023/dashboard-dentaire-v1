import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef, useMemo } from "react"
import { AppointmentCard } from "./AppointmentCard"
import type { Appointment, ReminderChannel } from "@/lib/types"

interface TimelineSchedulerProps {
  appointments: Appointment[]
  selectedIds: Set<string>
  onSelect: (id: string, checked: boolean) => void
  onReminder: (appointment: Appointment, channel: ReminderChannel) => void
  onEdit?: (appointment: Appointment) => void
  onDelete?: (appointment: Appointment) => void
}

export function TimelineScheduler({ appointments, selectedIds, onSelect, onReminder, onEdit, onDelete }: TimelineSchedulerProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    appointments.forEach((a) => {
      const list = map.get(a.time) ?? []
      list.push(a)
      map.set(a.time, list)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [appointments])

  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: grouped.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320,
    overscan: 3,
  })

  if (grouped.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No appointments for this date
      </div>
    )
  }

  return (
    <div ref={parentRef} className="max-h-[calc(100vh-280px)] overflow-auto pr-2">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const [time, appts] = grouped[virtualRow.index]
          return (
            <div
              key={time}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="pb-6"
            >
              <div className="flex gap-6">
                <div className="w-16 shrink-0 pt-5">
                  <span className="text-lg font-semibold text-primary">{time}</span>
                </div>
                <div className="flex-1 space-y-4">
                  {appts.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      selected={selectedIds.has(appt.id)}
                      onSelect={onSelect}
                      onReminder={onReminder}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
