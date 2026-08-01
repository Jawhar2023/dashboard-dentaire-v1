import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Phone, Mail, Pencil, Trash2, Copy, Eye, EyeOff, KeyRound, ExternalLink, Plus, ImageIcon, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { PageTransition } from "@/components/shared/PageTransition"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientFormDialog } from "@/components/patients/PatientFormDialog"
import { DeletePatientDialog } from "@/components/patients/DeletePatientDialog"
import { BeforeAfterPhotoDialog } from "@/components/patients/BeforeAfterPhotoDialog"
import { DeleteBeforeAfterDialog } from "@/components/patients/DeleteBeforeAfterDialog"
import { PaymentFormDialog } from "@/components/payments/PaymentFormDialog"
import { DeletePaymentDialog } from "@/components/payments/DeletePaymentDialog"
import {
  usePatient,
  usePatientAppointments,
  usePatientBeforeAfter,
  usePatientPayments,
  usePatientPaymentSummary,
  useInvoices,
} from "@/hooks/useData"
import {
  getDoctor, getTreatment, getTimeline,
} from "@/lib/mockDataStore"
import { getNationalityCode } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { EmptyState } from "@/components/shared/EmptyState"
import { FileText } from "lucide-react"
import type { BeforeAfterPhoto, Payment } from "@/lib/types"

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: patient } = usePatient(id ?? "")
  const { data: appointments = [] } = usePatientAppointments(id ?? "")
  const { data: photos = [] } = usePatientBeforeAfter(id ?? "")
  const { data: payments = [] } = usePatientPayments(id ?? "")
  const { data: paymentSummary } = usePatientPaymentSummary(id ?? "")
  const { data: allInvoices = [] } = useInvoices()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<BeforeAfterPhoto | null>(null)
  const [deletingPhoto, setDeletingPhoto] = useState<BeforeAfterPhoto | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null)

  const copyPortalCredentials = async () => {
    if (!patient?.portalUsername || !patient?.portalPassword) return
    try {
      const origin =
        typeof window !== "undefined" && window.location.protocol !== "file:"
          ? window.location.origin
          : "http://localhost:5173"
      const text = `Patient Portal
URL: ${origin}/portal/login
Username: ${patient.portalUsername}
Password: ${patient.portalPassword}`
      await navigator.clipboard.writeText(text)
      toast.success("Portal credentials copied")
    } catch {
      toast.error("Could not copy — please copy manually")
    }
  }

  if (!patient) {
    return <div className="text-center py-16 text-muted-foreground">Patient not found</div>
  }

  const doctor = patient.doctorId ? getDoctor(patient.doctorId) : null
  const treatment = patient.treatmentId ? getTreatment(patient.treatmentId) : null
  const invoices = allInvoices.filter((i) => i.patientId === patient.id)
  const timeline = getTimeline(patient.id)

  const openAddPhoto = () => {
    setEditingPhoto(null)
    setPhotoDialogOpen(true)
  }

  const openEditPhoto = (ph: BeforeAfterPhoto) => {
    setEditingPhoto(ph)
    setPhotoDialogOpen(true)
  }

  const openAddPayment = () => {
    setEditingPayment(null)
    setPaymentDialogOpen(true)
  }

  const openEditPayment = (pay: Payment) => {
    setEditingPayment(pay)
    setPaymentDialogOpen(true)
  }

  return (
    <PageTransition>
      <Link to="/patients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to patients
      </Link>

      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <PatientAvatar
              name={`${patient.firstName} ${patient.lastName}`}
              avatar={patient.avatar}
              countryCode={getNationalityCode(patient.nationality)}
              size="lg"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">
                    {patient.firstName} {patient.lastName} {patient.nationalityFlag}
                  </h1>
                  <p className="text-muted-foreground">{patient.nationality}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setEditOpen(true)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{patient.phone}</span>
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{patient.email}</span>
                {patient.passport && <span>Passport: {patient.passport}</span>}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <StatusBadge status={patient.paymentStatus} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {patient.portalUsername && patient.portalPassword && (
        <Card className="mb-8 p-5 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Patient portal access</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share these credentials — the patient can log in to view their treatments and payments.
                </p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Username</p>
                    <p className="font-mono font-medium">{patient.portalUsername}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Password</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium">
                        {showPassword ? patient.portalPassword : "•".repeat(patient.portalPassword.length)}
                      </p>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={copyPortalCredentials}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button size="sm" className="rounded-xl gap-1.5" asChild>
                <Link to="/portal/login">
                  <ExternalLink className="h-3.5 w-3.5" /> Open portal
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {timeline.length > 0 && (
        <Card className="mb-8 p-6">
          <h3 className="font-semibold mb-4">Timeline</h3>
          <div className="space-y-0">
            {timeline.map((event, i) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${event.completed ? "bg-primary" : "bg-muted border-2 border-muted-foreground/30"}`} />
                  {i < timeline.length - 1 && <div className="w-px h-8 bg-border" />}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium ${event.completed ? "" : "text-muted-foreground"}`}>{event.label}</p>
                  {event.date && <p className="text-xs text-muted-foreground">{format(new Date(event.date), "dd MMM yyyy HH:mm")}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex-wrap h-auto">
          {["overview", "appointments", "medical", "invoices", "payments", "photos", "notes"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg">{tab === "medical" ? "Medical Files" : tab === "photos" ? "Before/After" : tab}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h4 className="font-medium mb-2">Doctor</h4>
              <p>{doctor?.name ?? "—"}</p>
              <h4 className="font-medium mt-4 mb-2">Treatment</h4>
              <p>{treatment?.name ?? "—"}</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="space-y-3">
            {appointments.map((a) => (
              <Card key={a.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.date} at {a.time}</p>
                  <p className="text-sm text-muted-foreground">{getTreatment(a.treatmentId)?.name}</p>
                </div>
                <StatusBadge status={a.status} />
              </Card>
            ))}
            {appointments.length === 0 && <EmptyState icon={FileText} title="No appointments" />}
          </div>
        </TabsContent>

        <TabsContent value="medical">
          <EmptyState icon={FileText} title="Medical Files" description="X-rays, scans, and documents will appear here." />
        </TabsContent>

        <TabsContent value="invoices">
          <div className="space-y-3">
            {invoices.map((inv) => {
              const invPayments = payments.filter((p) => p.invoiceId === inv.id)
              return (
                <Card key={inv.id} className="p-4">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">
                      FAC-{format(new Date(inv.createdAt), "yyyy-MM")}-{inv.id.toUpperCase()}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {formatCurrency(inv.treatmentCost)} · Payé: {formatCurrency(inv.paid)} · Reste: {formatCurrency(inv.remainingBalance)}
                  </p>
                  {invPayments.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-border/50 pt-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Règlements</p>
                      {invPayments.map((pay) => (
                        <div key={pay.id} className="flex justify-between text-sm gap-3">
                          <span className="text-muted-foreground capitalize">
                            {format(new Date(pay.date), "dd MMM yyyy")} · {pay.method}
                          </span>
                          <span className="font-medium text-emerald-600 tabular-nums">{formatCurrency(pay.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
            {invoices.length === 0 && (
              <EmptyState
                icon={FileText}
                title="Aucune facture"
                description="Ajoutez un paiement pour créer automatiquement une facture."
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={paymentSummary?.status ?? patient.paymentStatus} />
              <span className="text-sm text-muted-foreground">Payment status</span>
            </div>
            <Button size="sm" className="rounded-xl gap-1.5" onClick={openAddPayment}>
              <Plus className="h-3.5 w-3.5" /> Add payment
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Total due</p>
              <p className="text-xl font-semibold mt-1">{formatCurrency(paymentSummary?.totalDue ?? 0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-xl font-semibold mt-1 text-emerald-600">{formatCurrency(paymentSummary?.totalPaid ?? 0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-xl font-semibold mt-1 text-amber-600">{formatCurrency(paymentSummary?.remaining ?? 0)}</p>
            </Card>
          </div>

          <div className="space-y-3">
            {payments.map((pay) => (
              <Card key={pay.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium capitalize">{pay.method}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(pay.date), "dd MMM yyyy")} · {pay.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-semibold text-emerald-600 mr-2">{formatCurrency(pay.amount)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditPayment(pay)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                    onClick={() => setDeletingPayment(pay)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
            {payments.length === 0 && (
              <EmptyState
                icon={CreditCard}
                title="No payments yet"
                description="Record a payment for this patient."
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Before & after photos for this patient
            </p>
            <Button size="sm" className="rounded-xl gap-1.5" onClick={openAddPhoto}>
              <Plus className="h-3.5 w-3.5" /> Add photo
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {photos.map((ph) => (
              <Card key={ph.id} className="overflow-hidden p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{ph.treatment}</p>
                    {ph.date && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ph.date), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0"
                      title="Edit / rename"
                      onClick={() => openEditPhoto(ph)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => setDeletingPhoto(ph)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                      <img src={ph.beforeUrl} alt={`${ph.treatment} before`} className="h-full w-full object-cover" />
                    </div>
                    <p className="text-center text-xs text-muted-foreground">Before</p>
                  </div>
                  <div className="space-y-1">
                    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                      <img src={ph.afterUrl} alt={`${ph.treatment} after`} className="h-full w-full object-cover" />
                    </div>
                    <p className="text-center text-xs text-muted-foreground">After</p>
                  </div>
                </div>
              </Card>
            ))}
            {photos.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={ImageIcon}
                  title="No photos yet"
                  description="Add before and after photos for this patient."
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="p-6">
            <p className="text-sm">{patient.notes ?? "No notes for this patient."}</p>
          </Card>
        </TabsContent>
      </Tabs>

      <PatientFormDialog open={editOpen} onOpenChange={setEditOpen} patient={patient} />
      <DeletePatientDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        patient={patient}
        onDeleted={() => navigate("/patients")}
      />
      <BeforeAfterPhotoDialog
        open={photoDialogOpen}
        onOpenChange={(open) => {
          setPhotoDialogOpen(open)
          if (!open) setEditingPhoto(null)
        }}
        patientId={patient.id}
        photo={editingPhoto}
      />
      {deletingPhoto && (
        <DeleteBeforeAfterDialog
          open={!!deletingPhoto}
          onOpenChange={(open) => {
            if (!open) setDeletingPhoto(null)
          }}
          photo={deletingPhoto}
        />
      )}
      <PaymentFormDialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          setPaymentDialogOpen(open)
          if (!open) setEditingPayment(null)
        }}
        payment={editingPayment}
        fixedPatientId={patient.id}
      />
      {deletingPayment && (
        <DeletePaymentDialog
          open={!!deletingPayment}
          onOpenChange={(open) => {
            if (!open) setDeletingPayment(null)
          }}
          payment={deletingPayment}
        />
      )}
    </PageTransition>
  )
}
