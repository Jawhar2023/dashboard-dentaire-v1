import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { MessageSquare, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"

interface BulkActionBarProps {
  selectedCount: number
  allSelected: boolean
  onSelectAll: () => void
  onSendSMS: () => void
  onSendWhatsApp: () => void
  onSendEmail: () => void
  onClear: () => void
  sending: boolean
  sendProgress: number
  sendTotal: number
  confirmOpen: boolean
  onConfirmOpenChange: (open: boolean) => void
  onConfirmSend: () => void
  sendChannel: string
}

export function BulkActionBar({
  selectedCount,
  allSelected,
  onSelectAll,
  onSendSMS,
  onSendWhatsApp,
  onSendEmail,
  onClear,
  sending,
  sendProgress,
  sendTotal,
  confirmOpen,
  onConfirmOpenChange,
  onConfirmSend,
  sendChannel,
}: BulkActionBarProps) {
  const { t } = useTranslation()

  if (selectedCount === 0) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-5 py-3 shadow-card-hover"
        >
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <div className="flex items-center gap-2">
            <Checkbox checked={allSelected} onCheckedChange={onSelectAll} id="select-all" />
            <label htmlFor="select-all" className="text-sm cursor-pointer">{t("common.selectAll")}</label>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={onSendSMS}>
            <MessageSquare className="h-3.5 w-3.5" /> SMS
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={onSendWhatsApp}>
            <Phone className="h-3.5 w-3.5" /> WhatsApp
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={onSendEmail}>
            <Mail className="h-3.5 w-3.5" /> Email
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>{t("common.cancel")}</Button>
        </motion.div>
      </AnimatePresence>

      <Dialog open={confirmOpen} onOpenChange={onConfirmOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Send {sendChannel} reminders?</DialogTitle>
            <DialogDescription>
              Send to {selectedCount} patient{selectedCount > 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>
          {sending ? (
            <div className="space-y-3 py-4">
              <p className="text-sm text-muted-foreground">{t("reminder.sending")}</p>
              <Progress value={(sendProgress / sendTotal) * 100} />
              <p className="text-sm font-medium text-center">{sendProgress} / {sendTotal}</p>
            </div>
          ) : (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onConfirmOpenChange(false)}>{t("common.cancel")}</Button>
              <Button onClick={onConfirmSend}>{t("common.send")}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
