import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Users, CalendarCheck, Clock, CheckCircle, XCircle, DollarSign, TrendingUp,
  Stethoscope, CreditCard, Activity, AlertCircle,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { PageTransition } from "@/components/shared/PageTransition"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import {
  useDashboardStats,
  useDoctors,
  usePayments,
  useAnalytics,
  useAllAppointments,
} from "@/hooks/useData"
import { getPatient, getTreatment, getDoctor } from "@/lib/mockDataStore"
import { formatCurrency, formatAppointmentTime } from "@/lib/utils"

const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899"]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 18) return "afternoon"
  return "evening"
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data: stats } = useDashboardStats()
  const { data: analytics } = useAnalytics()
  const { data: doctorList = [] } = useDoctors()
  const { data: paymentList = [] } = usePayments()
  const { data: allAppointments = [] } = useAllAppointments()

  const todayStr = format(new Date(), "yyyy-MM-dd")

  const recentPayments = useMemo(
    () =>
      [...paymentList]
        .filter((p) => p.status !== "refunded")
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [paymentList]
  )

  const todayAgenda = useMemo(
    () =>
      allAppointments
        .filter((a) => a.date === todayStr && a.status !== "cancelled")
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 6),
    [allAppointments, todayStr]
  )

  const availableDoctors = doctorList.filter((d) => d.available)
  const monthlyTrend = stats?.monthlyTrendPct
  const hasRevenueChart = (analytics?.revenueByMonth ?? []).some((m) => m.revenue > 0)
  const hasPatientsChart = (analytics?.patientsByMonth ?? []).some((m) => m.count > 0)

  return (
    <PageTransition>
      <Card className="mb-8 overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 shadow-card">
        <CardContent className="p-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {t(`welcome.${getGreeting()}`)}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">{t("welcome.overview")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(), "EEEE d MMMM yyyy")} · {stats?.todayPatients ?? 0} RDV aujourd’hui
            </p>
          </div>
          <Button asChild className="rounded-xl">
            <Link to="/appointments">Voir les rendez-vous</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 mb-8">
        <StatCard title="Patients aujourd’hui" value={stats?.todayPatients ?? "—"} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Confirmés" value={stats?.confirmed ?? "—"} icon={<CalendarCheck className="h-5 w-5" />} />
        <StatCard title="En attente" value={stats?.waiting ?? "—"} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Terminés" value={stats?.completed ?? "—"} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard title="Arrivés / Soins" value={`${stats?.arrived ?? 0} / ${stats?.treatment ?? 0}`} icon={<Activity className="h-5 w-5" />} />
        <StatCard title="Annulés" value={stats?.cancelled ?? "—"} icon={<XCircle className="h-5 w-5" />} />
        <StatCard
          title="Revenus du jour"
          value={stats ? formatCurrency(stats.revenueToday) : "—"}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Revenus du mois"
          value={stats ? formatCurrency(stats.monthlyRevenue) : "—"}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={
            monthlyTrend === null || monthlyTrend === undefined
              ? undefined
              : `${monthlyTrend > 0 ? "+" : ""}${monthlyTrend}% vs mois dernier`
          }
          trendUp={monthlyTrend !== null && monthlyTrend !== undefined ? monthlyTrend >= 0 : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Patients total</p>
          <p className="text-2xl font-semibold mt-1">{stats?.totalPatients ?? 0}</p>
          <Link to="/patients" className="text-xs text-primary mt-2 inline-block hover:underline">Voir patients</Link>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Impayés / partiels</p>
          <p className="text-2xl font-semibold mt-1 text-amber-600">{stats?.unpaidPatients ?? 0}</p>
          <Link to="/payments" className="text-xs text-primary mt-2 inline-block hover:underline">Voir paiements</Link>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Taux de paiement</p>
          <p className="text-2xl font-semibold mt-1 text-primary">{analytics?.conversionRate ?? 0}%</p>
          <p className="text-xs text-muted-foreground mt-1">Patients payés ou partiels</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Revenus (7 derniers mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasRevenueChart ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analytics?.revenueByMonth}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-16 text-center">Aucun paiement enregistré sur cette période.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Patients actifs par mois</CardTitle></CardHeader>
          <CardContent>
            {hasPatientsChart ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics?.patientsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-16 text-center">Pas encore d’activité mensuelle.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader><CardTitle>Patients par pays</CardTitle></CardHeader>
          <CardContent>
            {(analytics?.patientsByCountry.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics?.patientsByCountry}
                    dataKey="count"
                    nameKey="country"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props) => {
                      const entry = props.payload as { flag?: string; count?: number }
                      return `${entry.flag ?? ""} ${entry.count ?? ""}`
                    }}
                  >
                    {analytics?.patientsByCountry.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">Aucun patient</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top traitements</CardTitle></CardHeader>
          <CardContent>
            {(analytics?.topTreatments.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics?.topTreatments} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">Aucun rendez-vous</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rappels</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Succès rappels</span>
                <span className="font-semibold">{analytics?.reminderSuccessRate ?? 0}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all"
                  style={{ width: `${analytics?.reminderSuccessRate ?? 0}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="font-semibold text-lg">{analytics?.whatsappLeads ?? 0}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-semibold text-lg">{analytics?.websiteLeads ?? 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {analytics?.cancelledAppointments ?? 0} RDV annulés (tous)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Agenda du jour</CardTitle>
            <Button variant="ghost" size="sm" className="rounded-lg" asChild>
              <Link to="/appointments">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayAgenda.map((a) => {
              const p = getPatient(a.patientId)
              const tr = getTreatment(a.treatmentId)
              const doc = getDoctor(a.doctorId)
              return (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {formatAppointmentTime(a.time)} · {p?.firstName} {p?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tr?.name} · {doc?.name}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0 capitalize">
                    {a.status}
                  </span>
                </div>
              )
            })}
            {todayAgenda.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Aucun rendez-vous aujourd’hui.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" /> Derniers paiements
            </CardTitle>
            <Button variant="ghost" size="sm" className="rounded-lg" asChild>
              <Link to="/payments">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPayments.map((pay) => {
              const p = getPatient(pay.patientId)
              return (
                <div key={pay.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{p?.firstName} {p?.lastName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {pay.method} · {format(new Date(pay.date), "dd MMM")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(pay.amount)}</span>
                </div>
              )
            })}
            {recentPayments.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Aucun paiement.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Stethoscope className="h-4 w-4" /> Médecins disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableDoctors.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                <PatientAvatar name={d.name} avatar={d.avatar} size="sm" />
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.specialty}</p>
                </div>
              </div>
            ))}
            {availableDoctors.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun médecin disponible.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
