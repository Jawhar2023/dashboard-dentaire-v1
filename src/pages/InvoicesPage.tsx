import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  FileText, Download, Printer, Search, Eye, ExternalLink,
  DollarSign, Wallet, CheckCircle2, ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInvoices, useClinicSettings, useClinicLogos, usePayments } from "@/hooks/useData"
import {
  getPatient, getDoctor, getDefaultClinicLogo,
} from "@/lib/mockDataStore"
import { getNationalityCode } from "@/lib/constants"
import { STAFF_DEMO } from "@/lib/staffAuth"
import { cn, formatCurrency } from "@/lib/utils"
import { generateInvoicePdf } from "@/lib/invoicePdf"
import type { Invoice, Payment, PaymentStatus } from "@/lib/types"

type StatusFilter = "all" | PaymentStatus

type TableRow =
  | { kind: "item"; key: string; date: string; label: string; amount: number }
  | { kind: "payment"; key: string; date: string; label: string; amount: number; status: Payment["status"] }

function invoiceRef(inv: Invoice) {
  return `FAC-${format(new Date(inv.createdAt), "yyyy-MM")}-${inv.id.toUpperCase()}`
}

function paymentMethodLabel(method: Payment["method"]) {
  if (method === "cash") return "Espèces"
  if (method === "card") return "Carte"
  if (method === "transfer") return "Virement"
  return "PayPal"
}

function buildInvoiceRows(inv: Invoice, payments: Payment[]): TableRow[] {
  const items =
    inv.items.length > 0 ? inv.items : [{ name: "Soins dentaires", amount: inv.treatmentCost }]

  const itemRows: TableRow[] = items.map((item, idx) => ({
    kind: "item",
    key: `item-${idx}`,
    date: inv.createdAt,
    label: item.name,
    amount: item.amount,
  }))

  const paymentRows: TableRow[] = [...payments]
    .filter((p) => p.status !== "refunded")
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((pay) => ({
      kind: "payment" as const,
      key: pay.id,
      date: pay.date,
      label: `Paiement · ${paymentMethodLabel(pay.method)}`,
      amount: pay.amount,
      status: pay.status,
    }))

  return [...itemRows, ...paymentRows]
}

function InvoiceBlueTable({
  rows,
  patientName,
}: {
  rows: TableRow[]
  patientName: string
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-primary/20 shadow-sm">
      <div className="grid grid-cols-[88px_1fr_1.2fr_auto] gap-2 bg-[#17306e] text-white text-[10px] sm:text-[11px] uppercase tracking-wide px-3 py-2.5 font-semibold">
        <span>Date</span>
        <span>Patient</span>
        <span>Nature</span>
        <span className="text-right">Montant</span>
      </div>
      <div className="divide-y divide-border/40 bg-white dark:bg-card">
        {rows.map((row) => (
          <div
            key={row.key}
            className={cn(
              "grid grid-cols-[88px_1fr_1.2fr_auto] gap-2 px-3 py-2.5 text-sm items-center",
              row.kind === "payment" && "bg-sky-50/80 dark:bg-sky-950/20"
            )}
          >
            <span className="text-xs text-muted-foreground tabular-nums">
              {format(new Date(row.date), "dd/MM/yyyy")}
            </span>
            <span className="truncate text-xs sm:text-sm">{patientName}</span>
            <span className={cn("truncate text-xs sm:text-sm", row.kind === "payment" && "text-sky-800 dark:text-sky-300")}>
              {row.label}
            </span>
            <span
              className={cn(
                "tabular-nums font-semibold text-right whitespace-nowrap",
                row.kind === "payment" ? "text-emerald-600" : "text-foreground"
              )}
            >
              {formatCurrency(row.amount)}
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted-foreground">Aucune ligne</p>
        )}
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  const { t } = useTranslation()
  const { data: invoiceList = [], isLoading } = useInvoices()
  const { data: allPayments = [] } = usePayments()
  const { data: settings } = useClinicSettings()
  const { data: logos = [] } = useClinicLogos()
  const defaultLogo = getDefaultClinicLogo()

  const [selectedLogoId, setSelectedLogoId] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [preview, setPreview] = useState<Invoice | null>(null)

  const activeLogoId = selectedLogoId || defaultLogo?.id || logos[0]?.id || ""
  const activeLogo = logos.find((l) => l.id === activeLogoId) ?? defaultLogo ?? logos[0] ?? null

  const stats = useMemo(() => {
    const total = invoiceList.reduce((s, i) => s + i.treatmentCost, 0)
    const paid = invoiceList.reduce((s, i) => s + i.paid, 0)
    const remaining = invoiceList.reduce((s, i) => s + i.remainingBalance, 0)
    const unpaidCount = invoiceList.filter((i) => i.status === "unpaid" || i.status === "partial").length
    return { total, paid, remaining, unpaidCount, count: invoiceList.length }
  }, [invoiceList])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...invoiceList]
      .filter((inv) => {
        if (statusFilter !== "all" && inv.status !== statusFilter) return false
        if (!q) return true
        const patient = getPatient(inv.patientId)
        const name = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : ""
        const ref = invoiceRef(inv).toLowerCase()
        const items = inv.items.map((it) => it.name.toLowerCase()).join(" ")
        return (
          name.includes(q) ||
          ref.includes(q) ||
          inv.id.toLowerCase().includes(q) ||
          items.includes(q) ||
          (patient?.phone ?? "").toLowerCase().includes(q)
        )
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [invoiceList, query, statusFilter])

  const paymentsForInvoice = (invoiceId: string) =>
    allPayments
      .filter((p) => p.invoiceId === invoiceId)
      .sort((a, b) => b.date.localeCompare(a.date))

  const runPdf = async (inv: Invoice, mode: "download" | "print") => {
    const patient = getPatient(inv.patientId)
    const name = patient ? `${patient.firstName} ${patient.lastName}` : "Patient"
    const doctor = patient?.doctorId ? getDoctor(patient.doctorId) : undefined
    const invPayments = paymentsForInvoice(inv.id)

    setBusyId(`${inv.id}-${mode}`)
    try {
      await generateInvoicePdf({
        invoice: inv,
        patientName: name,
        doctorName: doctor?.name,
        settings: {
          clinicName: settings?.clinicName || "Dr. Khalil Ben Mustapha",
          phone: settings?.phone || "",
          address: settings?.address || "",
        },
        logo: activeLogo,
        email: STAFF_DEMO.email,
        mode,
        payments: invPayments,
      })
      toast.success(
        mode === "print"
          ? `Impression ouverte${activeLogo?.name ? ` · ${activeLogo.name}` : ""}`
          : `PDF téléchargé${activeLogo?.name ? ` · ${activeLogo.name}` : ""}`
      )
    } catch {
      toast.error("Impossible de générer la facture")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PageTransition>
      <PageHeader
        title={t("nav.invoices")}
        description="Factures professionnelles — traitements et paiements dans un seul tableau"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard title="Factures" value={stats.count} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Total facturé" value={formatCurrency(stats.total)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Encaissé" value={formatCurrency(stats.paid)} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard
          title="Reste à payer"
          value={formatCurrency(stats.remaining)}
          icon={<Wallet className="h-5 w-5" />}
          trend={stats.unpaidCount > 0 ? `${stats.unpaidCount} en attente` : "Tout réglé"}
          trendUp={stats.unpaidCount === 0}
        />
      </div>

      <Card className="p-5 mb-6 border-border/60 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-sky-500/[0.03] pointer-events-none" />
        <div className="relative space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2 flex-1 max-w-xl">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="rounded-xl pl-9 bg-background/80"
                  placeholder="Patient, n° facture, traitement…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 min-w-[150px]">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Statut</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="rounded-xl w-[160px] bg-background/80"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="partial">Partiel</SelectItem>
                  <SelectItem value="unpaid">Non payé</SelectItem>
                  <SelectItem value="refunded">Remboursé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                Logo facture (Settings)
              </Label>
              <Link to="/settings" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                Gérer les logos <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {logos.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-xl border border-dashed px-4 py-3">
                Aucun logo. Créez-en un dans Settings pour l’utiliser ici.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {logos.map((logo) => {
                  const selected = logo.id === activeLogoId
                  return (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => setSelectedLogoId(logo.id)}
                      className={cn(
                        "group relative h-16 w-[7.5rem] rounded-xl border-2 bg-white overflow-hidden transition-all",
                        selected
                          ? "border-primary ring-2 ring-primary/25 shadow-md scale-[1.02]"
                          : "border-border/60 hover:border-primary/40 hover:shadow-sm"
                      )}
                      title={logo.name}
                    >
                      {logo.imageUrl ? (
                        <img
                          src={logo.imageUrl}
                          alt={logo.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground p-2">{logo.name}</span>
                      )}
                      <span
                        className={cn(
                          "absolute bottom-0 inset-x-0 text-[9px] py-0.5 text-center truncate px-1",
                          selected ? "bg-primary text-primary-foreground" : "bg-black/55 text-white"
                        )}
                      >
                        {logo.name}{logo.isDefault ? " ★" : ""}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-[18px] bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucune facture"
          description={query || statusFilter !== "all" ? "Aucun résultat pour ces filtres." : "Les factures apparaîtront ici."}
        />
      ) : (
        <div className="space-y-5">
          {filtered.map((inv) => {
            const patient = getPatient(inv.patientId)
            const name = patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu"
            const doctor = patient?.doctorId ? getDoctor(patient.doctorId) : null
            const ref = invoiceRef(inv)
            const invPayments = paymentsForInvoice(inv.id)
            const rows = buildInvoiceRows(inv, invPayments)
            const downloading = busyId === `${inv.id}-download`
            const printing = busyId === `${inv.id}-print`
            const pct =
              inv.treatmentCost <= 0 ? 0 : Math.min(100, Math.round((inv.paid / inv.treatmentCost) * 100))

            return (
              <Card
                key={inv.id}
                className="overflow-hidden transition-all hover:shadow-card-hover border-border/60"
              >
                <div className="flex flex-col xl:flex-row">
                  <div className="flex-1 p-5 sm:p-6 space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {patient ? (
                          <Link to={`/patients/${patient.id}`}>
                            <PatientAvatar
                              name={name}
                              avatar={patient.avatar}
                              countryCode={getNationalityCode(patient.nationality)}
                              size="md"
                            />
                          </Link>
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold tracking-tight text-base">{ref}</p>
                            <StatusBadge status={inv.status} />
                          </div>
                          {patient ? (
                            <Link
                              to={`/patients/${patient.id}`}
                              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-0.5"
                            >
                              {name} {patient.nationalityFlag}
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </Link>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-0.5">{name}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(inv.createdAt), "dd MMMM yyyy", { locale: fr })}
                            {doctor ? ` · ${doctor.name}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-end gap-6 shrink-0">
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Payé</p>
                          <p className="text-lg font-semibold tabular-nums text-emerald-600">{formatCurrency(inv.paid)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Reste</p>
                          <p className="text-lg font-semibold tabular-nums text-amber-600">{formatCurrency(inv.remainingBalance)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</p>
                          <p className="text-xl font-semibold tabular-nums">{formatCurrency(inv.treatmentCost)}</p>
                        </div>
                      </div>
                    </div>

                    <InvoiceBlueTable rows={rows} patientName={name} />

                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pct >= 100 ? "bg-emerald-500" : pct > 0 ? "bg-[#17306e]" : "bg-muted-foreground/20"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground w-10 text-right">{pct}%</span>
                    </div>
                  </div>

                  <div className="xl:w-44 border-t xl:border-t-0 xl:border-l border-border/50 bg-muted/20 p-4 flex xl:flex-col gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5 flex-1 xl:flex-none"
                      onClick={() => setPreview(inv)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Aperçu
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl gap-1.5 flex-1 xl:flex-none"
                      disabled={!!busyId}
                      onClick={() => void runPdf(inv, "download")}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloading ? "…" : "PDF"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-xl gap-1.5 flex-1 xl:flex-none"
                      disabled={!!busyId}
                      onClick={() => void runPdf(inv, "print")}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      {printing ? "…" : "Imprimer"}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => { if (!open) setPreview(null) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {preview && (() => {
            const patient = getPatient(preview.patientId)
            const name = patient ? `${patient.firstName} ${patient.lastName}` : "Patient"
            const doctor = patient?.doctorId ? getDoctor(patient.doctorId) : null
            const rows = buildInvoiceRows(preview, paymentsForInvoice(preview.id))
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {invoiceRef(preview)}
                  </DialogTitle>
                  <DialogDescription>
                    Aperçu · logo {activeLogo?.name || "non sélectionné"}
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-2xl border border-border/60 overflow-hidden bg-gradient-to-b from-[#17306e]/[0.06] to-transparent">
                  <div className="px-5 py-4 border-b border-border/50 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#17306e] dark:text-sky-300 font-semibold">
                        {settings?.clinicName || "Cabinet dentaire"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{settings?.phone}</p>
                      <p className="text-xs text-muted-foreground">{settings?.address}</p>
                    </div>
                    {activeLogo?.imageUrl && (
                      <img src={activeLogo.imageUrl} alt={activeLogo.name} className="h-14 w-auto object-contain" />
                    )}
                  </div>

                  <div className="px-5 py-5 text-center">
                    <p className="text-lg font-semibold text-[#17306e] dark:text-sky-300 tracking-tight">
                      FACTURE — {format(new Date(preview.createdAt), "MMMM yyyy", { locale: fr }).toUpperCase()}
                    </p>
                    <p className="font-medium mt-1">{name}</p>
                    {doctor && <p className="text-xs text-muted-foreground mt-0.5">{doctor.name}</p>}
                    <div className="mt-2 flex justify-center"><StatusBadge status={preview.status} /></div>
                  </div>

                  <div className="px-5 pb-5 space-y-4">
                    <InvoiceBlueTable rows={rows} patientName={name} />

                    {(() => {
                      const itemsTotal =
                        preview.items.reduce((s, i) => s + i.amount, 0) || preview.treatmentCost
                      const paidSum = paymentsForInvoice(preview.id)
                        .filter((p) => p.status !== "refunded")
                        .reduce((s, p) => s + p.amount, 0)
                      const reste = Math.max(0, itemsTotal - paidSum)
                      return (
                        <div className="ml-auto max-w-[260px] rounded-xl border border-[#17306e]/30 bg-[#17306e]/5 px-4 py-3 text-sm space-y-1.5">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Total soins</span>
                            <span className="font-semibold tabular-nums">{formatCurrency(itemsTotal)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Payé</span>
                            <span className="tabular-nums text-emerald-600 font-medium">{formatCurrency(paidSum)}</span>
                          </div>
                          <div className="flex justify-between gap-4 border-t border-border/50 pt-1.5">
                            <span className="text-muted-foreground">Reste à payer</span>
                            <span className="font-semibold tabular-nums text-amber-600">{formatCurrency(reste)}</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => setPreview(null)}>
                    Fermer
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-xl gap-1.5"
                    disabled={!!busyId}
                    onClick={() => void runPdf(preview, "print")}
                  >
                    <Printer className="h-3.5 w-3.5" /> Imprimer
                  </Button>
                  <Button
                    className="rounded-xl gap-1.5"
                    disabled={!!busyId}
                    onClick={() => void runPdf(preview, "download")}
                  >
                    <Download className="h-3.5 w-3.5" /> Télécharger PDF
                  </Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
