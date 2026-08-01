import { useMemo, useState } from "react"
import { Check, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { getNationalityCode } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Patient } from "@/lib/types"

interface PatientSearchSelectProps {
  patients: Patient[]
  value?: string
  onChange: (patientId: string) => void
  placeholder?: string
}

export function PatientSearchSelect({
  patients,
  value,
  onChange,
  placeholder = "Search by name, phone, email…",
}: PatientSearchSelectProps) {
  const [query, setQuery] = useState("")

  const selected = useMemo(
    () => patients.find((p) => p.id === value),
    [patients, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase()
      return (
        fullName.includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.nationality.toLowerCase().includes(q) ||
        (p.passport?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [patients, query])

  return (
    <div className="space-y-2">
      {selected && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
          <PatientAvatar
            name={`${selected.firstName} ${selected.lastName}`}
            avatar={selected.avatar}
            countryCode={getNationalityCode(selected.nationality)}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {selected.firstName} {selected.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{selected.phone}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg shrink-0"
            onClick={() => {
              onChange("")
              setQuery("")
            }}
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-input bg-background overflow-hidden">
        <div className="relative border-b border-border/50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="rounded-none border-0 shadow-none pl-9 focus-visible:ring-0"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No patient found
            </p>
          ) : (
            filtered.map((p) => {
              const isSelected = p.id === value
              return (
                <button
                  key={p.id}
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                    isSelected && "bg-primary/10"
                  )}
                  onClick={() => {
                    onChange(p.id)
                    setQuery("")
                  }}
                >
                  <PatientAvatar
                    name={`${p.firstName} ${p.lastName}`}
                    avatar={p.avatar}
                    countryCode={getNationalityCode(p.nationality)}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.phone} · {p.nationality}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
