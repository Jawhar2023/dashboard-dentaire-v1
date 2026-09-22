import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Check } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useCreateRappelNote, useUpdateRappelNote } from "@/hooks/useData"
import { RAPPEL_DESIGNS } from "@/components/rappels/rappelDesigns"
import { toast } from "sonner"
import type { RappelDesign, RappelNote } from "@/lib/types"

interface RappelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: RappelNote
}

export function RappelFormDialog({ open, onOpenChange, note }: RappelFormDialogProps) {
  const isEdit = !!note
  const createNote = useCreateRappelNote()
  const updateNote = useUpdateRappelNote()
  const isPending = createNote.isPending || updateNote.isPending

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [text, setText] = useState("")
  const [design, setDesign] = useState<RappelDesign>("rose")

  useEffect(() => {
    if (open) {
      setDate(note?.date ?? format(new Date(), "yyyy-MM-dd"))
      setText(note?.text ?? "")
      setDesign(note?.design ?? "rose")
    }
  }, [open, note])

  const handleSubmit = async () => {
    if (!date) {
      toast.error("Choisissez une date")
      return
    }
    if (!text.trim()) {
      toast.error("Le texte du rappel est requis")
      return
    }

    if (isEdit && note) {
      await updateNote.mutateAsync({ id: note.id, data: { date, text: text.trim(), design } })
      toast.success("Rappel mis à jour")
    } else {
      await createNote.mutateAsync({ date, text: text.trim(), design })
      toast.success("Rappel créé")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le rappel" : "Nouveau rappel"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input
              className="rounded-xl"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Texte *</Label>
            <Textarea
              placeholder="Écrivez votre rappel..."
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Design</Label>
            <div className="flex flex-wrap gap-2">
              {RAPPEL_DESIGNS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDesign(d.key)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                    d.swatch,
                    design === d.key ? "border-foreground scale-110" : "border-transparent"
                  )}
                  title={d.label}
                  aria-label={d.label}
                >
                  {design === d.key && <Check className="h-4 w-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Aperçu</Label>
            <div className={cn("rounded-2xl border-2 p-4 shadow-card", RAPPEL_DESIGNS.find((d) => d.key === design)?.card)}>
              <p className="text-xs font-semibold opacity-70">
                {date ? format(new Date(date), "dd/MM/yyyy") : "—"}
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap break-words">
                {text || "Le texte de votre rappel s'affichera ici"}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="button" className="rounded-xl" disabled={isPending} onClick={() => void handleSubmit()}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
