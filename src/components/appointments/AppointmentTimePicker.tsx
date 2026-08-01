import { useEffect, useMemo, useRef } from "react"
import { Clock } from "lucide-react"
import { cn, formatAppointmentTime } from "@/lib/utils"

interface AppointmentTimePickerProps {
  value: string
  onChange: (time: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

const ITEM_H = 44
const VISIBLE = 5
const PAD = Math.floor(VISIBLE / 2)

function parseValue(value: string) {
  const [h = "09", m = "00"] = (value || "09:00").split(":")
  return {
    hour: HOURS.includes(h) ? h : "09",
    minute: MINUTES.includes(m) ? m : "00",
  }
}

function WheelColumn({
  options,
  value,
  onChange,
  label,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const settleTimer = useRef<number | undefined>(undefined)
  const syncing = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || syncing.current) return
    const idx = Math.max(0, options.indexOf(value))
    const top = idx * ITEM_H
    if (Math.abs(el.scrollTop - top) > 2) {
      el.scrollTop = top
    }
  }, [value, options])

  const settle = () => {
    const el = ref.current
    if (!el) return
    const idx = Math.min(options.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_H)))
    const top = idx * ITEM_H
    syncing.current = true
    el.scrollTo({ top, behavior: "smooth" })
    const next = options[idx]
    if (next && next !== value) onChange(next)
    window.setTimeout(() => {
      syncing.current = false
    }, 180)
  }

  const scheduleSettle = () => {
    window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(settle, 90)
  }

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-center mb-1.5">
        {label}
      </p>
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30" style={{ height: ITEM_H * VISIBLE }}>
        <div
          className="pointer-events-none absolute inset-x-1.5 z-10 rounded-xl border border-primary/35 bg-primary/10"
          style={{ top: ITEM_H * PAD, height: ITEM_H }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-14 bg-gradient-to-b from-card via-card/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-gradient-to-t from-card via-card/85 to-transparent" />

        <div
          ref={ref}
          className="h-full overflow-y-auto overscroll-contain snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingTop: PAD * ITEM_H, paddingBottom: PAD * ITEM_H }}
          onScroll={scheduleSettle}
        >
          {options.map((opt) => {
            const selected = opt === value
            return (
              <button
                key={opt}
                type="button"
                className={cn(
                  "w-full snap-center flex items-center justify-center text-2xl tabular-nums transition-colors",
                  selected ? "font-semibold text-primary" : "font-medium text-muted-foreground/55"
                )}
                style={{ height: ITEM_H }}
                onClick={() => {
                  onChange(opt)
                  const el = ref.current
                  const idx = options.indexOf(opt)
                  if (el && idx >= 0) {
                    syncing.current = true
                    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" })
                    window.setTimeout(() => {
                      syncing.current = false
                    }, 180)
                  }
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function AppointmentTimePicker({ value, onChange }: AppointmentTimePickerProps) {
  const { hour, minute } = useMemo(() => parseValue(value), [value])

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-primary/10 p-2">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Selected</p>
            <p className="text-2xl font-semibold text-primary tabular-nums leading-none">
              {formatAppointmentTime(`${hour}:${minute}`)}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-right max-w-[9rem]">
          Scroll like a phone alarm
        </p>
      </div>

      <div className="flex items-center gap-2">
        <WheelColumn
          options={HOURS}
          value={hour}
          onChange={(h) => onChange(`${h}:${minute}`)}
          label="Hour"
        />
        <span className="pt-5 text-3xl font-semibold text-muted-foreground/80 select-none">:</span>
        <WheelColumn
          options={MINUTES}
          value={minute}
          onChange={(m) => onChange(`${hour}:${m}`)}
          label="Minute"
        />
      </div>
    </div>
  )
}
