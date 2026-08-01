import { useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { LogOut, CalendarDays, Stethoscope, Wallet, FileText, CreditCard } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { usePortalSession } from "@/lib/patientAuth"
import {
  getDoctor,
  getTreatment,
  getAppointmentsByPatient,
  getInvoicesByPatient,
  getPaymentsByPatient,
} from "@/lib/mockDataStore"
import { getNationalityCode } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"

export default function PortalDashboardPage() {
  const navigate = useNavigate()
  const { patient, logout, isAuthenticated } = usePortalSession()

  useEffect(() => {
    if (!isAuthenticated) navigate("/portal/login", { replace: true })
  }, [isAuthenticated, navigate])

  const appointments = useMemo(
    () => (patient ? getAppointmentsByPatient(patient.id) : []),
    [patient]
  )
  const invoices = useMemo(
    () => (patient ? getInvoicesByPatient(patient.id) : []),
    [patient]
  )
  const payments = useMemo(
    () => (patient ? getPaymentsByPatient(patient.id) : []),
    [patient]
  )

  const totals = useMemo(() => {
    const treatmentTotal = invoices.reduce((sum, inv) => sum + inv.treatmentCost, 0)
    const paidTotal = invoices.reduce((sum, inv) => sum + inv.paid, 0)
    const remaining = invoices.reduce((sum, inv) => sum + inv.remainingBalance, 0)
    return { treatmentTotal, paidTotal, remaining }
  }, [invoices])

  const doctor = patient?.doctorId ? getDoctor(patient.doctorId) : null

  if (!patient) return null

  const upcoming = appointments
    .filter((a) => a.status !== "completed" && a.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  const history = appointments
    .filter((a) => a.status === "completed" || a.status === "cancelled")
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))

  const handleLogout = () => {
    logout()
    navigate("/portal/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <PatientAvatar
              name={`${patient.firstName} ${patient.lastName}`}
              avatar={patient.avatar}
              countryCode={getNationalityCode(patient.nationality)}
              size="md"
            />
            <div>
              <p className="font-semibold text-sm leading-tight">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-xs text-muted-foreground">Patient portal</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {patient.firstName}</h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s a summary of your care at our clinic.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total treatments</p>
                <p className="text-lg font-semibold">{formatCurrency(totals.treatmentTotal)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-lg font-semibold text-emerald-600">
                  {formatCurrency(totals.paidTotal)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining balance</p>
                <p className="text-lg font-semibold text-amber-600">
                  {formatCurrency(totals.remaining)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Upcoming appointments
              </h2>
              <span className="text-xs text-muted-foreground">{upcoming.length}</span>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No upcoming appointments.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => {
                  const tr = getTreatment(appt.treatmentId)
                  const doc = getDoctor(appt.doctorId)
                  return (
                    <div
                      key={appt.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border/50 p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {format(new Date(appt.date), "EEE dd MMM yyyy")} · {appt.time}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tr?.name ?? "Treatment"} · {doc?.name ?? "Doctor"}
                        </p>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" /> Care team
              </h2>
            </div>
            {doctor ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium">{doctor.name}</p>
                <p className="text-muted-foreground">{doctor.specialty}</p>
                <p className="text-muted-foreground">{doctor.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your care team will appear here once assigned.
              </p>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Invoices
          </h2>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No invoices yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border/50">
                    <th className="py-2 font-medium">Invoice</th>
                    <th className="py-2 font-medium">Treatment</th>
                    <th className="py-2 font-medium text-right">Total</th>
                    <th className="py-2 font-medium text-right">Paid</th>
                    <th className="py-2 font-medium text-right">Remaining</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border/30">
                      <td className="py-2.5 font-mono text-xs">{inv.id}</td>
                      <td className="py-2.5">{inv.items[0]?.name ?? "—"}</td>
                      <td className="py-2.5 text-right">{formatCurrency(inv.treatmentCost)}</td>
                      <td className="py-2.5 text-right text-emerald-600">
                        {formatCurrency(inv.paid)}
                      </td>
                      <td className="py-2.5 text-right text-amber-600">
                        {formatCurrency(inv.remainingBalance)}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Payment history
          </h2>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No payments recorded.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((pay) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between rounded-xl border border-border/40 p-3 text-sm"
                >
                  <div>
                    <p className="capitalize font-medium">{pay.method}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(pay.date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <p className="font-semibold text-emerald-600">{formatCurrency(pay.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {history.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Past appointments</h2>
            <div className="space-y-2">
              {history.slice(0, 8).map((appt) => {
                const tr = getTreatment(appt.treatmentId)
                return (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between text-sm border-b border-border/30 last:border-b-0 py-2"
                  >
                    <div>
                      <p className="font-medium">{format(new Date(appt.date), "dd MMM yyyy")} · {appt.time}</p>
                      <p className="text-xs text-muted-foreground">{tr?.name}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">
          Need help? Contact the clinic directly.{" "}
          <Link to="/" className="text-primary hover:underline">
            Back to clinic dashboard
          </Link>
        </p>
      </main>
    </div>
  )
}
