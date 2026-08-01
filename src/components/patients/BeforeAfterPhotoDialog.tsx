import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateBeforeAfter, useUpdateBeforeAfter } from "@/hooks/useData"
import { toast } from "sonner"
import type { BeforeAfterPhoto } from "@/lib/types"
import { ImagePlus } from "lucide-react"

interface BeforeAfterPhotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  photo?: BeforeAfterPhoto | null
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsDataURL(file)
  })
}

export function BeforeAfterPhotoDialog({
  open,
  onOpenChange,
  patientId,
  photo,
}: BeforeAfterPhotoDialogProps) {
  const isEdit = !!photo
  const createPhoto = useCreateBeforeAfter()
  const updatePhoto = useUpdateBeforeAfter()
  const [treatment, setTreatment] = useState("")
  const [beforeUrl, setBeforeUrl] = useState("")
  const [afterUrl, setAfterUrl] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTreatment(photo?.treatment ?? "")
    setBeforeUrl(photo?.beforeUrl ?? "")
    setAfterUrl(photo?.afterUrl ?? "")
  }, [open, photo])

  const handleFile = async (
    file: File | undefined,
    setter: (url: string) => void
  ) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }
    try {
      setter(await readFileAsDataUrl(file))
    } catch {
      toast.error("Could not load image")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = treatment.trim()
    if (!name) {
      toast.error("Name / treatment is required")
      return
    }
    if (!beforeUrl || !afterUrl) {
      toast.error("Before and After photos are required")
      return
    }

    setSaving(true)
    try {
      if (isEdit && photo) {
        await updatePhoto.mutateAsync({
          id: photo.id,
          data: { treatment: name, beforeUrl, afterUrl },
        })
        toast.success("Photo updated")
      } else {
        await createPhoto.mutateAsync({
          patientId,
          treatment: name,
          beforeUrl,
          afterUrl,
          date: new Date().toISOString(),
        })
        toast.success("Photo added")
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit before/after" : "Add before/after"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ba-treatment">Name / treatment</Label>
            <Input
              id="ba-treatment"
              className="rounded-xl"
              placeholder="e.g. Veneers, Whitening…"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PhotoPicker
              label="Before"
              url={beforeUrl}
              onFile={(file) => void handleFile(file, setBeforeUrl)}
              onClear={() => setBeforeUrl("")}
            />
            <PhotoPicker
              label="After"
              url={afterUrl}
              onFile={(file) => void handleFile(file, setAfterUrl)}
              onClear={() => setAfterUrl("")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add photo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PhotoPicker({
  label,
  url,
  onFile,
  onClear,
}: {
  label: string
  url: string
  onFile: (file: File | undefined) => void
  onClear: () => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 transition-colors hover:bg-muted/70">
        {url ? (
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <>
            <ImagePlus className="mb-1 h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Upload</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>
      {url && (
        <Button type="button" variant="ghost" size="sm" className="h-7 w-full rounded-lg text-xs" onClick={onClear}>
          Remove
        </Button>
      )}
    </div>
  )
}
