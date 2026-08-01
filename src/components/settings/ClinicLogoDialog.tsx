import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useCreateClinicLogo, useUpdateClinicLogo } from "@/hooks/useData"
import { toast } from "sonner"
import type { ClinicLogo } from "@/lib/types"
import { ImagePlus } from "lucide-react"

interface ClinicLogoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logo?: ClinicLogo | null
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsDataURL(file)
  })
}

export function ClinicLogoDialog({ open, onOpenChange, logo }: ClinicLogoDialogProps) {
  const isEdit = !!logo
  const createLogo = useCreateClinicLogo()
  const updateLogo = useUpdateClinicLogo()
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(logo?.name ?? "")
    setWebsite(logo?.website ?? "")
    setImageUrl(logo?.imageUrl ?? "")
    setIsDefault(logo?.isDefault ?? false)
  }, [open, logo])

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image (PNG, JPG, WebP…)")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB")
      return
    }
    try {
      setImageUrl(await readFileAsDataUrl(file))
    } catch {
      toast.error("Could not load image")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Logo name is required (e.g. website brand)")
      return
    }
    if (!imageUrl) {
      toast.error("Upload a logo image")
      return
    }

    setSaving(true)
    try {
      if (isEdit && logo) {
        await updateLogo.mutateAsync({
          id: logo.id,
          data: {
            name: name.trim(),
            website: website.trim() || undefined,
            imageUrl,
            isDefault,
          },
        })
        toast.success("Logo updated")
      } else {
        await createLogo.mutateAsync({
          name: name.trim(),
          website: website.trim() || undefined,
          imageUrl,
          isDefault,
        })
        toast.success("Logo added")
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit logo" : "Add logo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name / brand *</Label>
            <Input
              className="rounded-xl"
              placeholder="e.g. Clinique Khalil, Cabinet Dentaire…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Website (optional)</Label>
            <Input
              className="rounded-xl"
              placeholder="www.example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo image *</Label>
            <label className="relative flex aspect-[3/1] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 hover:bg-muted/70 transition-colors">
              {imageUrl ? (
                <img src={imageUrl} alt="Logo preview" className="h-full w-full object-contain p-3" />
              ) : (
                <>
                  <ImagePlus className="mb-1 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload logo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
            </label>
            {imageUrl && (
              <Button type="button" variant="ghost" size="sm" className="h-7 rounded-lg text-xs" onClick={() => setImageUrl("")}>
                Remove image
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={isDefault} onCheckedChange={(c) => setIsDefault(!!c)} id="logoDefault" />
            <label htmlFor="logoDefault" className="text-sm">Use as default on invoices</label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
