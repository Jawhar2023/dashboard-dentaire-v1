import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useApp } from "@/providers/AppProvider"
import { searchAll } from "@/lib/mockDataStore"
import { Users, Stethoscope, Sparkles, FileText } from "lucide-react"

const typeIcons: Record<string, typeof Users> = {
  patient: Users,
  doctor: Stethoscope,
  treatment: Sparkles,
  invoice: FileText,
}

export function CommandPalette() {
  const { searchOpen, setSearchOpen } = useApp()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ReturnType<typeof searchAll>>([])
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [setSearchOpen])

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchAll(query))
    } else {
      setResults([])
    }
  }, [query])

  const handleSelect = (path: string) => {
    setSearchOpen(false)
    setQuery("")
    navigate(path)
  }

  return (
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
      <CommandInput placeholder={t("common.search")} value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>{t("common.noResults")}</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((r) => {
              const Icon = typeIcons[r.type] ?? Users
              return (
                <CommandItem key={`${r.type}-${r.id}`} onSelect={() => handleSelect(r.path)}>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span>{r.label}</span>
                    {r.sublabel && <span className="ml-2 text-xs text-muted-foreground">{r.sublabel}</span>}
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
