import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, CreditCard, DollarSign, Search } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { PaymentFormDialog } from "@/components/payments/PaymentFormDialog"
import { DeletePaymentDialog } from "@/components/payments/DeletePaymentDialog"
import { usePayments, usePatients } from "@/hooks/useData"
import { getPatientPaymentSummary } from "@/lib/mockDataStore"
import { formatCurrency } from "@/lib/utils"
import { getNationalityCode } from "@/lib/constants"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Payment, Patient } from "@/lib/types"

type ClientRow = {
  patient: Patient
  payments: Payment[]
  totalPaid: number
  totalDue: number
  remaining: number
  status: string
}

export default function PaymentsPage() {
  const { t } = useTranslation()
  const { data: paymentList = [] } = usePayments()
  const { data: patients = [] } = usePatients()
  const [query, setQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [deleting, setDeleting] = useState<Payment | null>(null)
  const [fixedPatientId, setFixedPatientId] = useState<string | undefined>()

  const totalReceived = paymentList
    .filter((p) => p.status !== "refunded")
    .reduce((s, p) => s + p.amount, 0)

  const thisMonth = useMemo(() => {
    const now = new Date()
    return paymentList
      .filter((p) => {
        if (p.status === "refunded") return false
        const d = new Date(p.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((s, p) => s + p.amount, 0)
  }, [paymentList])

  const clients = useMemo(() => {
    const byPatient = new Map<string, Payment[]>()
    for (const pay of paymentList) {
      const list = byPatient.get(pay.patientId) ?? []
      list.push(pay)
      byPatient.set(pay.patientId, list)
    }

    // Include patients who have invoices / payment status even without payments yet
    const rows: ClientRow[] = patients.map((patient) => {
      const pays = (byPatient.get(patient.id) ?? []).sort((a, b) => b.date.localeCompare(a.date))
      const summary = getPatientPaymentSummary(patient.id)
      return {
        patient,
        payments: pays,
        totalPaid: summary.totalPaid,
        totalDue: summary.totalDue,
        remaining: summary.remaining,
        status: summary.status,
      }
    })

    const q = query.trim().toLowerCase()
    const filtered = q
      ? rows.filter(({ patient }) => {
          const name = `${patient.firstName} ${patient.lastName}`.toLowerCase()
          return (
            name.includes(q) ||
            patient.phone.toLowerCase().includes(q) ||
            patient.email.toLowerCase().includes(q)
          )
        })
      : rows

    return filtered.sort((a, b) => b.totalPaid - a.totalPaid || a.patient.lastName.localeCompare(b.patient.lastName))
  }, [paymentList, patients, query])

  const openAdd = (patientId?: string) => {
    setEditing(null)
    setFixedPatientId(patientId)
    setFormOpen(true)
  }

  const openEdit = (payment: Payment) => {
    setEditing(payment)
    setFixedPatientId(payment.patientId)
    setFormOpen(true)
  }

  return (
    <PageTransition>
      <PageHeader
        title={t("nav.payments")}
        description="Payments by client"
        action={
          <Button className="rounded-xl gap-2" onClick={() => openAdd()}>
            <Plus className="h-4 w-4" /> Add payment
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard title="Total Received" value={formatCurrency(totalReceived)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Transactions" value={paymentList.length} icon={<CreditCard className="h-5 w-5" />} />
        <StatCard title="This Month" value={formatCurrency(thisMonth)} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="rounded-xl pl-9"
          placeholder="Search client…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {clients.map(({ patient, payments: pays, totalPaid, totalDue, remaining, status }) => (
          <Card key={patient.id} className="p-5 transition-all hover:shadow-card-hover">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <Link to={`/patients/${patient.id}`} className="flex items-center gap-3 min-w-0 group">
                <PatientAvatar
                  name={`${patient.firstName} ${patient.lastName}`}
                  avatar={patient.avatar}
                  countryCode={getNationalityCode(patient.nationality)}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="font-semibold group-hover:text-primary">
                    {patient.firstName} {patient.lastName} {patient.nationalityFlag}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{patient.phone}</p>
                </div>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => openAdd(patient.id)}>
                  <Plus className="h-3.5 w-3.5" /> Payment
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-medium">{formatCurrency(totalDue)}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="font-medium text-emerald-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">Reste</p>
                <p className="font-medium text-amber-600">{formatCurrency(remaining)}</p>
              </div>
            </div>

            {pays.length > 0 ? (
              <div className="space-y-2">
                {pays.map((pay) => (
                  <div
                    key={pay.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium capitalize">{pay.method}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(pay.date), "dd MMM yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="outline" className="capitalize text-xs mr-1">{pay.status}</Badge>
                      <span className="font-semibold text-emerald-600 w-24 text-right">{formatCurrency(pay.amount)}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(pay)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                        onClick={() => setDeleting(pay)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payments recorded for this client.</p>
            )}
          </Card>
        ))}

        {clients.length === 0 && (
          <EmptyState icon={CreditCard} title="No clients found" description="Try another search." />
        )}
      </div>

      <PaymentFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            setEditing(null)
            setFixedPatientId(undefined)
          }
        }}
        payment={editing}
        fixedPatientId={fixedPatientId}
      />
      {deleting && (
        <DeletePaymentDialog
          open={!!deleting}
          onOpenChange={(open) => {
            if (!open) setDeleting(null)
          }}
          payment={deleting}
        />
      )}
    </PageTransition>
  )
}
