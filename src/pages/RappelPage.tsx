import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus, Pencil, Trash2, StickyNote } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { RappelFormDialog } from "@/components/rappels/RappelFormDialog"
import { DeleteRappelDialog } from "@/components/rappels/DeleteRappelDialog"
import { getRappelDesign } from "@/components/rappels/rappelDesigns"
import { useRappelNotes } from "@/hooks/useData"
import { cn } from "@/lib/utils"
import type { RappelNote } from "@/lib/types"

export default function RappelPage() {
  const { data: notes = [], isLoading } = useRappelNotes()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<RappelNote | undefined>()

  const openAdd = () => {
    setSelectedNote(undefined)
    setFormOpen(true)
  }

  const openEdit = (note: RappelNote) => {
    setSelectedNote(note)
    setFormOpen(true)
  }

  const openDelete = (note: RappelNote) => {
    setSelectedNote(note)
    setDeleteOpen(true)
  }

  return (
    <PageTransition>
      <PageHeader
        title="Rappel"
        description="Notes et rappels internes du cabinet"
        action={
          <Button className="rounded-xl gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Nouveau rappel
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-[18px] bg-muted animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-border py-20 text-center text-muted-foreground">
          <StickyNote className="h-8 w-8 opacity-50" />
          <p>Aucun rappel pour le moment</p>
          <Button variant="outline" className="rounded-xl gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Créer un rappel
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => {
            const design = getRappelDesign(note.design)
            return (
              <div
                key={note.id}
                className={cn(
                  "flex flex-col gap-3 rounded-[18px] border-2 p-5 shadow-card transition-transform hover:scale-[1.01]",
                  design.card
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn("text-xs font-semibold uppercase tracking-wide", design.accent)}>
                    {format(new Date(note.date), "EEEE dd MMMM yyyy", { locale: fr })}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-black/5"
                      onClick={() => openEdit(note)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-destructive hover:bg-black/5 hover:text-destructive"
                      onClick={() => openDelete(note)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{note.text}</p>
              </div>
            )
          })}
        </div>
      )}

      <RappelFormDialog open={formOpen} onOpenChange={setFormOpen} note={selectedNote} />
      {selectedNote && (
        <DeleteRappelDialog open={deleteOpen} onOpenChange={setDeleteOpen} note={selectedNote} />
      )}
    </PageTransition>
  )
}
