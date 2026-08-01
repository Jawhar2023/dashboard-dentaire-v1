import { format, addDays, subDays } from "date-fns"
import { getNationalityFlag, getDicebearAvatar, DOCTOR_SPECIALTIES, TREATMENT_CATEGORIES } from "@/lib/constants"
import type {
  Patient,
  Doctor,
  Treatment,
  Appointment,
  Flight,
  Driver,
  Hotel,
  AirportTransfer,
  Invoice,
  Payment,
  PaymentStatus,
  Message,
  ReminderLog,
  MedicalTourismCase,
  Notification,
  User,
  DashboardStats,
  AnalyticsData,
  PatientTimelineEvent,
  BeforeAfterPhoto,
  ClinicSettings,
  ClinicLogo,
} from "./types"

const today = format(new Date(), "yyyy-MM-dd")
const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd")

export const currentUser: User = {
  id: "u1",
  name: "Sarah",
  email: "sarah@clinique-khalil.tn",
  role: "Réceptionniste",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
}

export let doctors: Doctor[] = [
  { id: "d1", name: "Dr. Ben Mustapha Khalil", specialty: "Implantologie", phone: "+216 71 000 001", available: true, avatar: getDicebearAvatar("Khalil") },
  { id: "d2", name: "Dr. Amira Trabelsi", specialty: "Esthétique dentaire", phone: "+216 71 000 002", available: true, avatar: getDicebearAvatar("Amira") },
  { id: "d3", name: "Dr. Youssef Mansouri", specialty: "Orthodontie", phone: "+216 71 000 003", available: false, avatar: getDicebearAvatar("Youssef") },
  { id: "d4", name: "Dr. Leila Gharbi", specialty: "Endodontie", phone: "+216 71 000 004", available: true, avatar: getDicebearAvatar("Leila") },
  { id: "d5", name: "Dr. Karim Bouazizi", specialty: "Chirurgie orale", phone: "+216 71 000 005", available: true, avatar: getDicebearAvatar("Karim") },
]

function uniqueSpecialties(...lists: string[][]) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const list of lists) {
    for (const item of list) {
      const trimmed = item.trim()
      const key = trimmed.toLowerCase()
      if (key && !seen.has(key)) {
        seen.add(key)
        result.push(trimmed)
      }
    }
  }
  return result
}

export let doctorSpecialties: string[] = uniqueSpecialties(
  [...DOCTOR_SPECIALTIES],
  doctors.map((d) => d.specialty)
)

export function addDoctorSpecialty(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return null
  const existing = doctorSpecialties.find((s) => s.toLowerCase() === trimmed.toLowerCase())
  if (existing) return existing
  doctorSpecialties = [...doctorSpecialties, trimmed]
  return trimmed
}

export let treatments: Treatment[] = [
  { id: "t1", name: "Root Canal", duration: 30, price: 450, category: "Endodontie" },
  { id: "t2", name: "Implant Consultation", duration: 45, price: 150, category: "Implantologie" },
  { id: "t3", name: "Dental Implant", duration: 90, price: 2500, category: "Implantologie" },
  { id: "t4", name: "Teeth Whitening", duration: 60, price: 350, category: "Esthétique" },
  { id: "t5", name: "Veneers", duration: 120, price: 1800, category: "Esthétique" },
  { id: "t6", name: "Crown", duration: 60, price: 600, category: "Prothèse" },
  { id: "t7", name: "Orthodontic Check", duration: 30, price: 100, category: "Orthodontie" },
  { id: "t8", name: "Full Mouth Restoration", duration: 180, price: 8000, category: "Chirurgie" },
]

export let treatmentCategories: string[] = uniqueSpecialties(
  [...TREATMENT_CATEGORIES],
  treatments.map((t) => t.category)
)

export function addTreatmentCategory(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return null
  const existing = treatmentCategories.find((c) => c.toLowerCase() === trimmed.toLowerCase())
  if (existing) return existing
  treatmentCategories = [...treatmentCategories, trimmed]
  return trimmed
}

export let drivers: Driver[] = [
  { id: "dr1", name: "Ali Ben Salem", phone: "+216 98 111 222", vehicle: "Mercedes Vito", plateNumber: "123 TU 4567", available: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali" },
  { id: "dr2", name: "Mohamed Haddad", phone: "+216 98 333 444", vehicle: "Toyota Hiace", plateNumber: "789 TU 1234", available: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed" },
  { id: "dr3", name: "Sami Karray", phone: "+216 98 555 666", vehicle: "BMW X5", plateNumber: "456 TU 7890", available: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sami" },
]

export let hotels: Hotel[] = [
  { id: "h1", name: "Marhaba Palace", roomNumber: "412", patientId: "p2", checkIn: today, checkOut: format(addDays(new Date(), 7), "yyyy-MM-dd"), breakfast: true, transportation: true, status: "checked_in" },
  { id: "h2", name: "Mövenpick Gammarth", roomNumber: "305", patientId: "p4", checkIn: tomorrow, checkOut: format(addDays(new Date(), 10), "yyyy-MM-dd"), breakfast: true, transportation: true, status: "booked" },
  { id: "h3", name: "Radisson Blu", roomNumber: "718", patientId: "p7", checkIn: subDays(new Date(), 2).toISOString().split("T")[0], checkOut: format(addDays(new Date(), 5), "yyyy-MM-dd"), breakfast: false, transportation: true, status: "checked_in" },
]

export let patients: Patient[] = [
  { id: "p1", firstName: "Ahmed", lastName: "Ben Ali", phone: "+216 22 111 333", email: "ahmed@email.com", nationality: "Tunisia", nationalityFlag: "🇹🇳", passport: "TN123456", avatar: getDicebearAvatar("Ahmed"), paymentStatus: "paid", isInternational: false, doctorId: "d1", treatmentId: "t1", notes: "Allergie à la pénicilline", portalUsername: "ahmed.benali42", portalPassword: "Ahmed2026" },
  { id: "p2", firstName: "Sarah", lastName: "Martin", phone: "+33 6 12 34 56 78", email: "sarah.martin@email.fr", nationality: "France", nationalityFlag: "🇫🇷", passport: "FR789012", avatar: getDicebearAvatar("SarahM"), arrival: today, departure: format(addDays(new Date(), 7), "yyyy-MM-dd"), hotelId: "h1", driverId: "dr1", doctorId: "d1", treatmentId: "t2", paymentStatus: "partial", isInternational: true, emergencyContact: "+33 6 99 88 77 66", visaNotes: "Visa touriste valide", portalUsername: "sarah.martin17", portalPassword: "Sarah2026" },
  { id: "p3", firstName: "Marco", lastName: "Rossi", phone: "+39 333 444 5555", email: "marco@email.it", nationality: "Italy", nationalityFlag: "🇮🇹", passport: "IT345678", avatar: getDicebearAvatar("Marco"), arrival: tomorrow, paymentStatus: "unpaid", isInternational: true, doctorId: "d2", treatmentId: "t3" },
  { id: "p4", firstName: "Emma", lastName: "Wilson", phone: "+44 7700 900123", email: "emma@email.co.uk", nationality: "UK", nationalityFlag: "🇬🇧", passport: "GB901234", avatar: getDicebearAvatar("Emma"), arrival: tomorrow, hotelId: "h2", driverId: "dr3", paymentStatus: "partial", isInternational: true, doctorId: "d1", treatmentId: "t8" },
  { id: "p5", firstName: "Fatma", lastName: "Trabelsi", phone: "+216 98 765 432", email: "fatma@email.tn", nationality: "Tunisia", nationalityFlag: "🇹🇳", avatar: getDicebearAvatar("Fatma"), paymentStatus: "paid", isInternational: false, doctorId: "d4", treatmentId: "t1" },
  { id: "p6", firstName: "Hans", lastName: "Mueller", phone: "+49 170 1234567", email: "hans@email.de", nationality: "Germany", nationalityFlag: "🇩🇪", passport: "DE567890", avatar: getDicebearAvatar("Hans"), paymentStatus: "paid", isInternational: true, doctorId: "d2", treatmentId: "t4" },
  { id: "p7", firstName: "Layla", lastName: "Al-Rashid", phone: "+971 50 123 4567", email: "layla@email.ae", nationality: "UAE", nationalityFlag: "🇦🇪", passport: "AE234567", avatar: getDicebearAvatar("Layla"), arrival: subDays(new Date(), 2).toISOString().split("T")[0], hotelId: "h3", driverId: "dr1", paymentStatus: "paid", isInternational: true, doctorId: "d1", treatmentId: "t5" },
  { id: "p8", firstName: "Pierre", lastName: "Dubois", phone: "+33 6 55 44 33 22", email: "pierre@email.fr", nationality: "France", nationalityFlag: "🇫🇷", passport: "FR456789", avatar: getDicebearAvatar("Pierre"), paymentStatus: "unpaid", isInternational: true, doctorId: "d3", treatmentId: "t7" },
  { id: "p9", firstName: "Yasmine", lastName: "Bouazizi", phone: "+216 55 666 777", email: "yasmine@email.tn", nationality: "Tunisia", nationalityFlag: "🇹🇳", avatar: getDicebearAvatar("Yasmine"), paymentStatus: "paid", isInternational: false, doctorId: "d2", treatmentId: "t4" },
  { id: "p10", firstName: "James", lastName: "Thompson", phone: "+1 555 123 4567", email: "james@email.com", nationality: "USA", nationalityFlag: "🇺🇸", passport: "US678901", avatar: getDicebearAvatar("James"), paymentStatus: "partial", isInternational: true, doctorId: "d5", treatmentId: "t8" },
  { id: "p11", firstName: "Sofia", lastName: "Garcia", phone: "+34 612 345 678", email: "sofia@email.es", nationality: "Spain", nationalityFlag: "🇪🇸", passport: "ES123789", avatar: getDicebearAvatar("Sofia"), paymentStatus: "unpaid", isInternational: true, doctorId: "d1", treatmentId: "t3" },
  { id: "p12", firstName: "Karim", lastName: "Jebali", phone: "+216 22 888 999", email: "karim@email.tn", nationality: "Tunisia", nationalityFlag: "🇹🇳", avatar: getDicebearAvatar("Karim"), paymentStatus: "paid", isInternational: false, doctorId: "d4", treatmentId: "t6" },
  { id: "p13", firstName: "Anna", lastName: "Kowalski", phone: "+48 501 234 567", email: "anna@email.pl", nationality: "Poland", nationalityFlag: "🇵🇱", passport: "PL890123", avatar: getDicebearAvatar("Anna"), paymentStatus: "partial", isInternational: true, doctorId: "d2", treatmentId: "t5" },
  { id: "p14", firstName: "Mohamed", lastName: "Saidi", phone: "+216 99 111 222", email: "mohamed@email.tn", nationality: "Tunisia", nationalityFlag: "🇹🇳", avatar: getDicebearAvatar("MohamedS"), paymentStatus: "paid", isInternational: false, doctorId: "d3", treatmentId: "t7" },
  { id: "p15", firstName: "Claire", lastName: "Bernard", phone: "+33 6 77 88 99 00", email: "claire@email.fr", nationality: "France", nationalityFlag: "🇫🇷", passport: "FR234890", avatar: getDicebearAvatar("Claire"), paymentStatus: "unpaid", isInternational: true, doctorId: "d1", treatmentId: "t2" },
]

const times = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"]
const statuses: Appointment["status"][] = ["confirmed", "waiting", "arrived", "treatment", "completed", "cancelled"]

export let appointments: Appointment[] = Array.from({ length: 18 }, (_, i) => {
  const patient = patients[i % patients.length]
  const doctor = doctors[i % doctors.length]
  const treatment = treatments[i % treatments.length]
  const status = statuses[i % statuses.length]
  const paymentStatus = patient.paymentStatus
  const amountPaid =
    paymentStatus === "paid"
      ? treatment.price
      : paymentStatus === "partial"
        ? Math.round(treatment.price * 0.3)
        : 0
  return {
    id: `a${i + 1}`,
    patientId: patient.id,
    doctorId: doctor.id,
    treatmentId: treatment.id,
    date: i < 14 ? today : tomorrow,
    time: times[i % times.length],
    duration: treatment.duration,
    status,
    paymentStatus,
    amountPaid,
    reminderStatus: i % 4 === 0 ? "delivered" : i % 4 === 1 ? "read" : i % 4 === 2 ? "pending" : "none",
    arrivalStatus: patient.isInternational ? (i % 3 === 0 ? "arrived" : i % 3 === 1 ? "in_transit" : "not_arrived") : "arrived",
    notes: i % 3 === 0 ? "Patient VIP - accueil spécial" : undefined,
    hotelId: patient.hotelId,
    driverId: patient.driverId,
    flightId: patient.isInternational ? `f${(i % 5) + 1}` : undefined,
    airportPickupIncluded: patient.isInternational && i % 2 === 0,
    smsReminder: true,
    whatsappReminder: true,
    emailReminder: patient.isInternational,
    autoReminder24h: true,
    autoReminder3h: true,
    autoReminder1h: true,
  }
})

export let flights: Flight[] = [
  { id: "f1", patientId: "p2", flightNumber: "AF 1234", airline: "Air France", arrivalTime: `${today}T10:30:00`, terminal: "T1", isReturn: false, status: "landed" },
  { id: "f2", patientId: "p4", flightNumber: "BA 567", airline: "British Airways", arrivalTime: `${tomorrow}T14:15:00`, terminal: "T2", isReturn: false, status: "scheduled" },
  { id: "f3", patientId: "p3", flightNumber: "AZ 890", airline: "ITA Airways", arrivalTime: `${tomorrow}T09:00:00`, terminal: "T1", isReturn: false, status: "scheduled" },
  { id: "f4", patientId: "p7", flightNumber: "EK 701", airline: "Emirates", arrivalTime: `${subDays(new Date(), 2).toISOString().split("T")[0]}T16:00:00`, terminal: "T1", isReturn: false, status: "landed" },
  { id: "f5", patientId: "p2", flightNumber: "AF 5678", airline: "Air France", arrivalTime: `${format(addDays(new Date(), 7), "yyyy-MM-dd")}T18:00:00`, terminal: "T1", isReturn: true, status: "scheduled" },
]

export let airportTransfers: AirportTransfer[] = [
  { id: "at1", patientId: "p2", flightId: "f1", driverId: "dr1", pickupTime: `${today}T10:45:00`, terminal: "T1", status: "completed", type: "pickup" },
  { id: "at2", patientId: "p4", flightId: "f2", driverId: "dr3", pickupTime: `${tomorrow}T14:30:00`, terminal: "T2", status: "scheduled", type: "pickup" },
  { id: "at3", patientId: "p3", flightId: "f3", driverId: "dr1", pickupTime: `${tomorrow}T09:15:00`, terminal: "T1", status: "scheduled", type: "pickup" },
  { id: "at4", patientId: "p7", flightId: "f4", driverId: "dr1", pickupTime: `${subDays(new Date(), 2).toISOString().split("T")[0]}T16:30:00`, terminal: "T1", status: "completed", type: "pickup" },
]

export let invoices: Invoice[] = patients.slice(0, 10).map((p, i) => {
  const treatment = treatments[i % treatments.length]
  const deposit = Math.round(treatment.price * 0.3)
  const paid = p.paymentStatus === "paid" ? treatment.price : p.paymentStatus === "partial" ? deposit : 0
  return {
    id: `inv${i + 1}`,
    patientId: p.id,
    treatmentCost: treatment.price,
    deposit,
    remainingBalance: treatment.price - paid,
    paid,
    status: p.paymentStatus,
    createdAt: subDays(new Date(), i).toISOString(),
    items: [{ name: treatment.name, amount: treatment.price }],
  }
})

export let payments: Payment[] = invoices.filter((inv) => inv.paid > 0).map((inv, i) => ({
  id: `pay${i + 1}`,
  patientId: inv.patientId,
  invoiceId: inv.id,
  amount: inv.paid,
  method: (["card", "cash", "transfer", "paypal"] as const)[i % 4],
  date: inv.createdAt,
  status: "completed" as const,
}))

export const messages: Message[] = [
  { id: "m1", patientId: "p2", channel: "whatsapp", content: "Bonjour, je confirme mon RDV de demain.", sentAt: subDays(new Date(), 1).toISOString(), status: "read", direction: "inbound" },
  { id: "m2", patientId: "p2", channel: "whatsapp", content: "Rappel: RDV demain à 08:30. Merci d'arriver 10 min avant.", sentAt: subDays(new Date(), 1).toISOString(), status: "delivered", direction: "outbound" },
  { id: "m3", patientId: "p4", channel: "sms", content: "Votre transfert aéroport est confirmé.", sentAt: new Date().toISOString(), status: "delivered", direction: "outbound" },
  { id: "m4", patientId: "p6", channel: "email", content: "Devis pour blanchiment dentaire joint.", sentAt: subDays(new Date(), 2).toISOString(), status: "read", direction: "outbound" },
  { id: "m5", patientId: "p10", channel: "whatsapp", content: "Question sur le plan de traitement.", sentAt: new Date().toISOString(), status: "pending", direction: "inbound" },
]

export let reminderLogs: ReminderLog[] = appointments.slice(0, 8).map((a, i) => ({
  id: `rl${i + 1}`,
  appointmentId: a.id,
  patientId: a.patientId,
  channel: (["sms", "whatsapp", "email"] as const)[i % 3],
  content: "Rappel de rendez-vous",
  sentAt: subDays(new Date(), i % 3).toISOString(),
  status: (["delivered", "read", "failed", "pending"] as const)[i % 4],
}))

export let tourismCases: MedicalTourismCase[] = patients.filter((p) => p.isInternational).map((p, i) => ({
  id: `tc${i + 1}`,
  patientId: p.id,
  status: (["lead", "quote", "accepted", "flight_booked", "airport_pickup", "hotel_checkin", "consultation", "treatment", "recovery", "tourism", "final_check", "airport_drop", "completed"] as const)[i % 13],
  flightId: p.arrival ? flights.find((f) => f.patientId === p.id)?.id : undefined,
  hotelId: p.hotelId,
  driverId: p.driverId,
  translator: i % 2 === 0 ? "Nadia Ferchichi" : undefined,
  treatmentPlan: treatments.find((t) => t.id === p.treatmentId)?.name ?? "Consultation",
  touristActivities: i % 2 === 0 ? ["Visite Carthage", "Spa Hammam"] : ["Shopping Medina"],
  emergencyContact: p.emergencyContact ?? p.phone,
  visaNotes: p.visaNotes,
  quoteAmount: treatments.find((t) => t.id === p.treatmentId)?.price ?? 500,
}))

export let notifications: Notification[] = [
  { id: "n1", type: "patient_arriving", title: "Patient arriving soon", message: "Sarah Martin arrives in 30 minutes", createdAt: new Date().toISOString(), read: false, link: "/patients/p2" },
  { id: "n2", type: "reminder_failed", title: "Reminder failed", message: "SMS to Pierre Dubois could not be delivered", createdAt: subDays(new Date(), 0).toISOString(), read: false, link: "/appointments" },
  { id: "n3", type: "payment_received", title: "Payment received", message: "Advance payment from Sarah Martin", createdAt: new Date().toISOString(), read: true, link: "/payments" },
  { id: "n4", type: "payment_received", title: "Payment received", message: "2,500 TND from Layla Al-Rashid", createdAt: subDays(new Date(), 1).toISOString(), read: true, link: "/payments" },
  { id: "n5", type: "appointment_cancelled", title: "Appointment cancelled", message: "Marco Rossi cancelled tomorrow's visit", createdAt: new Date().toISOString(), read: false, link: "/appointments" },
  { id: "n6", type: "doctor_unavailable", title: "Doctor unavailable", message: "Dr. Youssef Mansouri is on leave today", createdAt: new Date().toISOString(), read: false, link: "/doctors" },
]

export const patientTimelines: PatientTimelineEvent[] = [
  { id: "pt1", patientId: "p2", type: "created", label: "Appointment Created", date: subDays(new Date(), 14).toISOString(), completed: true },
  { id: "pt2", patientId: "p2", type: "reminder", label: "Reminder Sent", date: subDays(new Date(), 1).toISOString(), completed: true },
  { id: "pt3", patientId: "p2", type: "confirmed", label: "Confirmed", date: subDays(new Date(), 7).toISOString(), completed: true },
  { id: "pt4", patientId: "p2", type: "arrived", label: "Arrived", date: today, completed: true },
  { id: "pt5", patientId: "p2", type: "treatment_started", label: "Treatment Started", date: today, completed: false },
  { id: "pt6", patientId: "p2", type: "treatment_finished", label: "Treatment Finished", date: "", completed: false },
  { id: "pt7", patientId: "p2", type: "payment", label: "Payment Completed", date: "", completed: false },
  { id: "pt8", patientId: "p2", type: "review", label: "Review Received", date: "", completed: false },
]

export let beforeAfterPhotos: BeforeAfterPhoto[] = [
  { id: "ba1", patientId: "p7", beforeUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=before1", afterUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=after1", treatment: "Veneers", date: subDays(new Date(), 5).toISOString() },
  { id: "ba2", patientId: "p6", beforeUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=before2", afterUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=after2", treatment: "Teeth Whitening", date: subDays(new Date(), 10).toISOString() },
]

export function getDashboardStats(): DashboardStats {
  const todayStr = format(new Date(), "yyyy-MM-dd")
  const todayAppts = appointments.filter((a) => a.date === todayStr)
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const prevMonthDate = new Date(thisYear, thisMonth - 1, 1)
  const prevMonth = prevMonthDate.getMonth()
  const prevYear = prevMonthDate.getFullYear()

  const activePayments = payments.filter((p) => p.status !== "refunded")

  const revenueToday = activePayments
    .filter((p) => format(new Date(p.date), "yyyy-MM-dd") === todayStr)
    .reduce((s, p) => s + p.amount, 0)

  const monthlyRevenue = activePayments
    .filter((p) => {
      const d = new Date(p.date)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    .reduce((s, p) => s + p.amount, 0)

  const previousMonthRevenue = activePayments
    .filter((p) => {
      const d = new Date(p.date)
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear
    })
    .reduce((s, p) => s + p.amount, 0)

  const monthlyTrendPct =
    previousMonthRevenue > 0
      ? Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
      : monthlyRevenue > 0
        ? 100
        : null

  return {
    todayPatients: todayAppts.length,
    confirmed: todayAppts.filter((a) => a.status === "confirmed").length,
    waiting: todayAppts.filter((a) => a.status === "waiting").length,
    arrived: todayAppts.filter((a) => a.status === "arrived").length,
    treatment: todayAppts.filter((a) => a.status === "treatment").length,
    completed: todayAppts.filter((a) => a.status === "completed").length,
    cancelled: todayAppts.filter((a) => a.status === "cancelled").length,
    revenueToday,
    monthlyRevenue,
    previousMonthRevenue,
    monthlyTrendPct,
    totalPatients: patients.length,
    unpaidPatients: patients.filter((p) => p.paymentStatus === "unpaid" || p.paymentStatus === "partial").length,
  }
}

export function getAnalyticsData(): AnalyticsData {
  const now = new Date()
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const months: { key: string; month: string; year: number; monthIndex: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: monthLabels[d.getMonth()],
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    })
  }

  const activePayments = payments.filter((p) => p.status !== "refunded")

  const revenueByMonth = months.map(({ month, year, monthIndex }) => ({
    month,
    revenue: activePayments
      .filter((p) => {
        const d = new Date(p.date)
        return d.getMonth() === monthIndex && d.getFullYear() === year
      })
      .reduce((s, p) => s + p.amount, 0),
  }))

  const patientsByMonth = months.map(({ month, year, monthIndex }) => {
    const ids = new Set<string>()
    appointments.forEach((a) => {
      const d = new Date(a.date)
      if (d.getMonth() === monthIndex && d.getFullYear() === year) ids.add(a.patientId)
    })
    activePayments.forEach((p) => {
      const d = new Date(p.date)
      if (d.getMonth() === monthIndex && d.getFullYear() === year) ids.add(p.patientId)
    })
    return { month, count: ids.size }
  })

  const countryMap = new Map<string, { country: string; count: number; flag: string }>()
  patients.forEach((p) => {
    const existing = countryMap.get(p.nationality)
    if (existing) existing.count += 1
    else countryMap.set(p.nationality, { country: p.nationality, count: 1, flag: p.nationalityFlag })
  })
  const patientsByCountry = [...countryMap.values()].sort((a, b) => b.count - a.count)

  const treatmentCounts = new Map<string, number>()
  appointments.forEach((a) => {
    const name = treatments.find((t) => t.id === a.treatmentId)?.name ?? "Other"
    treatmentCounts.set(name, (treatmentCounts.get(name) ?? 0) + 1)
  })
  const topTreatments = [...treatmentCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const paidOrPartial = patients.filter((p) => p.paymentStatus === "paid" || p.paymentStatus === "partial").length
  const conversionRate =
    patients.length > 0 ? Math.round((paidOrPartial / patients.length) * 100) : 0

  const reminderOk = reminderLogs.filter((r) => r.status === "delivered" || r.status === "read").length
  const reminderSuccessRate =
    reminderLogs.length > 0 ? Math.round((reminderOk / reminderLogs.length) * 100) : 0

  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled").length
  const websiteLeads = messages.filter((m) => m.channel === "email").length
  const whatsappLeads = messages.filter((m) => m.channel === "whatsapp").length

  return {
    revenueByMonth,
    patientsByMonth,
    patientsByCountry,
    topTreatments,
    conversionRate,
    reminderSuccessRate,
    cancelledAppointments,
    websiteLeads,
    whatsappLeads,
  }
}

export function generatePortalUsername(firstName: string, lastName: string) {
  const base = `${firstName}.${lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
  if (!base) return `patient${Math.floor(Math.random() * 900 + 100)}`
  const suffix = Math.floor(Math.random() * 90 + 10)
  return `${base}${suffix}`
}

export function generatePortalPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
  let pwd = ""
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
  return pwd
}

export function authenticatePatient(username: string, password: string) {
  const uname = username.trim().toLowerCase()
  return patients.find(
    (p) => p.portalUsername?.toLowerCase() === uname && p.portalPassword === password
  )
}

// CRUD helpers
export function getPatient(id: string) {
  return patients.find((p) => p.id === id)
}

export function getDoctor(id: string) {
  return doctors.find((d) => d.id === id)
}

export function getTreatment(id: string) {
  return treatments.find((t) => t.id === id)
}

export function getHotel(id: string) {
  return hotels.find((h) => h.id === id)
}

export function getDriver(id: string) {
  return drivers.find((d) => d.id === id)
}

export function getFlight(id: string) {
  return flights.find((f) => f.id === id)
}

export function getAppointmentsByDate(date: string) {
  return appointments.filter((a) => a.date === date).sort((a, b) => a.time.localeCompare(b.time))
}

export function getAppointmentsByPatient(patientId: string) {
  return appointments.filter((a) => a.patientId === patientId)
}

export function getInvoicesByPatient(patientId: string) {
  return invoices.filter((i) => i.patientId === patientId)
}

export function getPaymentsByPatient(patientId: string) {
  return payments.filter((p) => p.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date))
}

export function getPaymentsByInvoice(invoiceId: string) {
  return payments
    .filter((p) => p.invoiceId === invoiceId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPatientPaymentSummary(patientId: string) {
  const patientInvoices = invoices.filter((i) => i.patientId === patientId)
  const patientPayments = payments.filter((p) => p.patientId === patientId && p.status !== "refunded")
  const totalDue =
    patientInvoices.length > 0
      ? patientInvoices.reduce((s, i) => s + i.treatmentCost, 0)
      : (() => {
          const patient = patients.find((p) => p.id === patientId)
          const treatment = patient?.treatmentId ? treatments.find((t) => t.id === patient.treatmentId) : undefined
          return treatment?.price ?? 0
        })()
  const totalPaid = patientPayments.reduce((s, p) => s + p.amount, 0)
  const remaining = Math.max(0, totalDue - totalPaid)
  const status: PaymentStatus =
    totalDue <= 0 && totalPaid <= 0
      ? (patients.find((p) => p.id === patientId)?.paymentStatus ?? "unpaid")
      : totalPaid <= 0
        ? "unpaid"
        : totalPaid >= totalDue
          ? "paid"
          : "partial"
  return { totalDue, totalPaid, remaining, status, invoiceCount: patientInvoices.length, paymentCount: patientPayments.length }
}

function ensureInvoiceForPatient(patientId: string): Invoice {
  const existing = invoices.find((i) => i.patientId === patientId)
  if (existing) return existing

  const patient = patients.find((p) => p.id === patientId)
  const treatment = patient?.treatmentId ? treatments.find((t) => t.id === patient.treatmentId) : treatments[0]
  const cost = treatment?.price ?? 500
  const invoice: Invoice = {
    id: `inv${Date.now()}`,
    patientId,
    treatmentCost: cost,
    deposit: Math.round(cost * 0.3),
    remainingBalance: cost,
    paid: 0,
    status: "unpaid",
    createdAt: new Date().toISOString(),
    items: [{ name: treatment?.name ?? "Treatment", amount: cost }],
  }
  invoices = [...invoices, invoice]
  return invoice
}

/** Assign catalog treatment to patient and sync invoice line items / total. */
export function applyPatientTreatment(patientId: string, treatmentId: string) {
  const treatment = treatments.find((t) => t.id === treatmentId)
  if (!treatment) return undefined

  patients = patients.map((p) => (p.id === patientId ? { ...p, treatmentId } : p))

  const invoice = ensureInvoiceForPatient(patientId)
  const cost = treatment.price
  invoices = invoices.map((i) =>
    i.id === invoice.id
      ? {
          ...i,
          treatmentCost: cost,
          deposit: Math.round(cost * 0.3),
          items: [{ name: treatment.name, amount: cost }],
        }
      : i
  )
  recalculateInvoiceFromPayments(invoice.id)
  syncPatientPaymentFromInvoices(patientId)
  return getTreatment(treatmentId)
}

function recalculateInvoiceFromPayments(invoiceId: string) {
  const inv = invoices.find((i) => i.id === invoiceId)
  if (!inv) return
  const paidSum = payments
    .filter((p) => p.invoiceId === invoiceId && p.status !== "refunded")
    .reduce((s, p) => s + p.amount, 0)
  const paid = Math.min(inv.treatmentCost, Math.max(0, paidSum))
  const remainingBalance = Math.max(0, inv.treatmentCost - paid)
  const status: Invoice["status"] =
    paid <= 0 ? "unpaid" : paid >= inv.treatmentCost ? "paid" : "partial"
  invoices = invoices.map((i) =>
    i.id === invoiceId ? { ...i, paid, remainingBalance, status } : i
  )
}

function syncPatientPaymentFromInvoices(patientId: string) {
  const summary = getPatientPaymentSummary(patientId)
  const paymentStatus =
    summary.totalPaid <= 0
      ? "unpaid"
      : summary.totalPaid >= summary.totalDue && summary.totalDue > 0
        ? "paid"
        : summary.totalPaid > 0
          ? "partial"
          : "unpaid"
  patients = patients.map((p) =>
    p.id === patientId ? { ...p, paymentStatus } : p
  )
}

export function addPayment(
  data: Omit<Payment, "id" | "invoiceId"> & { invoiceId?: string; treatmentId?: string }
) {
  if (data.treatmentId) {
    applyPatientTreatment(data.patientId, data.treatmentId)
  }

  const invoice = data.invoiceId
    ? invoices.find((i) => i.id === data.invoiceId) ?? ensureInvoiceForPatient(data.patientId)
    : ensureInvoiceForPatient(data.patientId)

  const payment: Payment = {
    id: `pay${Date.now()}`,
    patientId: data.patientId,
    invoiceId: invoice.id,
    amount: data.amount,
    method: data.method,
    date: data.date,
    status: data.status,
  }
  payments = [...payments, payment]
  recalculateInvoiceFromPayments(invoice.id)
  syncPatientPaymentFromInvoices(data.patientId)
  return payment
}

export function updatePayment(id: string, data: Partial<Payment>) {
  const idx = payments.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  const prev = payments[idx]
  const updated: Payment = { ...prev, ...data, id }
  payments = payments.map((p) => (p.id === id ? updated : p))
  recalculateInvoiceFromPayments(updated.invoiceId)
  if (prev.invoiceId !== updated.invoiceId) {
    recalculateInvoiceFromPayments(prev.invoiceId)
  }
  syncPatientPaymentFromInvoices(updated.patientId)
  if (prev.patientId !== updated.patientId) {
    syncPatientPaymentFromInvoices(prev.patientId)
  }
  return updated
}

export function deletePayment(id: string) {
  const payment = payments.find((p) => p.id === id)
  if (!payment) return
  payments = payments.filter((p) => p.id !== id)
  recalculateInvoiceFromPayments(payment.invoiceId)
  syncPatientPaymentFromInvoices(payment.patientId)
}

export function getMessagesByPatient(patientId: string) {
  return messages.filter((m) => m.patientId === patientId)
}

export function getTourismCase(patientId: string) {
  return tourismCases.find((t) => t.patientId === patientId)
}

export function updateTourismCaseStatus(id: string, status: MedicalTourismCase["status"]) {
  const idx = tourismCases.findIndex((t) => t.id === id)
  if (idx < 0) return undefined
  const updated: MedicalTourismCase = { ...tourismCases[idx], status }
  tourismCases = tourismCases.map((t) => (t.id === id ? updated : t))
  return updated
}

export function addHotel(data: Omit<Hotel, "id">) {
  const id = `h${Date.now()}`
  const hotel: Hotel = { ...data, id }
  hotels = [...hotels, hotel]
  if (hotel.patientId) {
    patients = patients.map((p) =>
      p.id === hotel.patientId ? { ...p, hotelId: hotel.id } : p
    )
  }
  return hotel
}

export function updateHotel(id: string, data: Partial<Hotel>) {
  const idx = hotels.findIndex((h) => h.id === id)
  if (idx < 0) return undefined
  const prev = hotels[idx]
  const updated: Hotel = { ...prev, ...data, id }
  hotels = hotels.map((h) => (h.id === id ? updated : h))
  if (prev.patientId && prev.patientId !== updated.patientId) {
    patients = patients.map((p) =>
      p.id === prev.patientId ? { ...p, hotelId: undefined } : p
    )
  }
  if (updated.patientId) {
    patients = patients.map((p) =>
      p.id === updated.patientId ? { ...p, hotelId: updated.id } : p
    )
  }
  return updated
}

export function deleteHotel(id: string) {
  const hotel = hotels.find((h) => h.id === id)
  hotels = hotels.filter((h) => h.id !== id)
  if (hotel?.patientId) {
    patients = patients.map((p) =>
      p.id === hotel.patientId ? { ...p, hotelId: undefined } : p
    )
  }
  appointments = appointments.map((a) =>
    a.hotelId === id ? { ...a, hotelId: undefined } : a
  )
}

export function addDriver(data: Omit<Driver, "id">) {
  const id = `dr${Date.now()}`
  const driver: Driver = { ...data, id }
  drivers = [...drivers, driver]
  return driver
}

export function updateDriver(id: string, data: Partial<Driver>) {
  const idx = drivers.findIndex((d) => d.id === id)
  if (idx < 0) return undefined
  const updated: Driver = { ...drivers[idx], ...data, id }
  drivers = drivers.map((d) => (d.id === id ? updated : d))
  return updated
}

export function deleteDriver(id: string) {
  drivers = drivers.filter((d) => d.id !== id)
  patients = patients.map((p) => (p.driverId === id ? { ...p, driverId: undefined } : p))
  const fallback = drivers[0]?.id
  airportTransfers = airportTransfers.map((t) =>
    t.driverId === id && fallback ? { ...t, driverId: fallback } : t
  )
  appointments = appointments.map((a) =>
    a.driverId === id ? { ...a, driverId: undefined } : a
  )
}

export function addFlight(data: Omit<Flight, "id">) {
  const id = `f${Date.now()}`
  const flight: Flight = { ...data, id }
  flights = [...flights, flight]
  return flight
}

export function updateFlight(id: string, data: Partial<Flight>) {
  const idx = flights.findIndex((f) => f.id === id)
  if (idx < 0) return undefined
  const updated: Flight = { ...flights[idx], ...data, id }
  flights = flights.map((f) => (f.id === id ? updated : f))
  return updated
}

export function addAirportTransfer(data: Omit<AirportTransfer, "id">) {
  const id = `at${Date.now()}`
  const transfer: AirportTransfer = { ...data, id }
  airportTransfers = [...airportTransfers, transfer]
  return transfer
}

export function updateAirportTransfer(id: string, data: Partial<AirportTransfer>) {
  const idx = airportTransfers.findIndex((t) => t.id === id)
  if (idx < 0) return undefined
  const updated: AirportTransfer = { ...airportTransfers[idx], ...data, id }
  airportTransfers = airportTransfers.map((t) => (t.id === id ? updated : t))
  return updated
}

export function deleteAirportTransfer(id: string) {
  airportTransfers = airportTransfers.filter((t) => t.id !== id)
}

export function getTimeline(patientId: string) {
  return patientTimelines.filter((t) => t.patientId === patientId)
}

export function getBeforeAfter(patientId: string) {
  return beforeAfterPhotos.filter((p) => p.patientId === patientId)
}

export function addBeforeAfter(data: Omit<BeforeAfterPhoto, "id">) {
  const id = `ba${Date.now()}`
  const photo: BeforeAfterPhoto = { ...data, id }
  beforeAfterPhotos = [...beforeAfterPhotos, photo]
  return photo
}

export function updateBeforeAfter(id: string, data: Partial<BeforeAfterPhoto>) {
  const idx = beforeAfterPhotos.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  const updated: BeforeAfterPhoto = { ...beforeAfterPhotos[idx], ...data, id }
  beforeAfterPhotos = beforeAfterPhotos.map((p) => (p.id === id ? updated : p))
  return updated
}

export function deleteBeforeAfter(id: string) {
  beforeAfterPhotos = beforeAfterPhotos.filter((p) => p.id !== id)
}

export function searchAll(query: string) {
  const q = query.toLowerCase()
  const results: { type: string; id: string; label: string; sublabel?: string; path: string }[] = []

  patients.forEach((p) => {
    if (
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.passport?.toLowerCase().includes(q) ||
      p.nationality.toLowerCase().includes(q)
    ) {
      results.push({ type: "patient", id: p.id, label: `${p.firstName} ${p.lastName}`, sublabel: p.phone, path: `/patients/${p.id}` })
    }
  })

  treatments.forEach((t) => {
    if (t.name.toLowerCase().includes(q)) {
      results.push({ type: "treatment", id: t.id, label: t.name, sublabel: t.category, path: "/treatments" })
    }
  })

  doctors.forEach((d) => {
    if (d.name.toLowerCase().includes(q)) {
      results.push({ type: "doctor", id: d.id, label: d.name, sublabel: d.specialty, path: "/doctors" })
    }
  })

  invoices.forEach((inv) => {
    if (inv.id.toLowerCase().includes(q)) {
      const patient = getPatient(inv.patientId)
      results.push({ type: "invoice", id: inv.id, label: `Invoice ${inv.id}`, sublabel: patient ? `${patient.firstName} ${patient.lastName}` : "", path: "/invoices" })
    }
  })

  return results
}

export function updateAppointmentStatus(id: string, status: Appointment["status"]) {
  const idx = appointments.findIndex((a) => a.id === id)
  if (idx >= 0) appointments[idx] = { ...appointments[idx], status }
}

export function addAppointment(data: Omit<Appointment, "id">) {
  const id = `a${appointments.length + 1}`
  const appt = { ...data, id }
  appointments = [...appointments, appt]
  return appt
}

export function updateAppointment(id: string, data: Partial<Appointment>) {
  const idx = appointments.findIndex((a) => a.id === id)
  if (idx < 0) return undefined
  const updated: Appointment = { ...appointments[idx], ...data, id }
  appointments = appointments.map((a) => (a.id === id ? updated : a))
  return updated
}

export function deleteAppointment(id: string) {
  appointments = appointments.filter((a) => a.id !== id)
  reminderLogs = reminderLogs.filter((r) => r.appointmentId !== id)
}

export function addPatient(data: Omit<Patient, "id">) {
  const id = `p${patients.length + 1}`
  const patient = { ...data, id }
  patients = [...patients, patient]
  return patient
}

export function updatePatient(id: string, data: Partial<Patient>) {
  const idx = patients.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  const updated: Patient = {
    ...patients[idx],
    ...data,
    id,
    nationalityFlag: data.nationality
      ? getNationalityFlag(data.nationality)
      : patients[idx].nationalityFlag,
  }
  patients = patients.map((p) => (p.id === id ? updated : p))
  return updated
}

export function deletePatient(id: string) {
  patients = patients.filter((p) => p.id !== id)
  appointments = appointments.filter((a) => a.patientId !== id)
}

export function addDoctor(data: Omit<Doctor, "id">) {
  const specialty = addDoctorSpecialty(data.specialty) ?? data.specialty.trim()
  const id = `d${doctors.length + 1}`
  const doctor = { ...data, specialty, id }
  doctors = [...doctors, doctor]
  return doctor
}

export function updateDoctor(id: string, data: Partial<Doctor>) {
  const idx = doctors.findIndex((d) => d.id === id)
  if (idx < 0) return undefined
  const specialty = data.specialty ? addDoctorSpecialty(data.specialty) ?? data.specialty.trim() : doctors[idx].specialty
  const updated: Doctor = { ...doctors[idx], ...data, specialty, id }
  doctors = doctors.map((d) => (d.id === id ? updated : d))
  return updated
}

export function deleteDoctor(id: string) {
  doctors = doctors.filter((d) => d.id !== id)
  patients = patients.map((p) => (p.doctorId === id ? { ...p, doctorId: undefined } : p))
  appointments = appointments.map((a) =>
    a.doctorId === id ? { ...a, doctorId: doctors[0]?.id ?? a.doctorId } : a
  )
}

export function addTreatment(data: Omit<Treatment, "id">) {
  const category = addTreatmentCategory(data.category) ?? data.category.trim()
  const id = `t${treatments.length + 1}`
  const treatment = { ...data, category, id }
  treatments = [...treatments, treatment]
  return treatment
}

export function updateTreatment(id: string, data: Partial<Treatment>) {
  const idx = treatments.findIndex((t) => t.id === id)
  if (idx < 0) return undefined
  const category = data.category
    ? addTreatmentCategory(data.category) ?? data.category.trim()
    : treatments[idx].category
  const updated: Treatment = { ...treatments[idx], ...data, category, id }
  treatments = treatments.map((t) => (t.id === id ? updated : t))
  if (data.duration !== undefined) {
    appointments = appointments.map((a) =>
      a.treatmentId === id ? { ...a, duration: updated.duration } : a
    )
  }
  return updated
}

export function deleteTreatment(id: string) {
  treatments = treatments.filter((t) => t.id !== id)
  patients = patients.map((p) => (p.treatmentId === id ? { ...p, treatmentId: undefined } : p))
  const fallback = treatments[0]
  appointments = appointments.map((a) =>
    a.treatmentId === id
      ? {
          ...a,
          treatmentId: fallback?.id ?? a.treatmentId,
          duration: fallback?.duration ?? a.duration,
        }
      : a
  )
}

export function markNotificationRead(id: string) {
  notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
}

export function addReminderLog(log: Omit<ReminderLog, "id">) {
  const entry = { ...log, id: `rl${reminderLogs.length + 1}` }
  reminderLogs = [...reminderLogs, entry]
  return entry
}

export function getAIResponse(prompt: string): string {
  const p = prompt.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
  const todayStr = format(new Date(), "yyyy-MM-dd")
  const stats = getDashboardStats()
  const money = (n: number) =>
    `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} TND`

  // Capabilities / help
  if (
    p.includes("que peux") ||
    p.includes("que peux-tu") ||
    p.includes("what can you") ||
    p.includes("aide") ||
    p.includes("help") ||
    p.includes("capacite") ||
    p.includes("capability")
  ) {
    return [
      "Voici ce que je peux faire pour vous :",
      "",
      "1. Aujourd'hui — arrivées, rendez-vous, patients en attente / en soins",
      "2. Paiements — qui n'a pas payé, recettes du jour/mois, reste à payer",
      "3. Factures — factures impayées, comment générer un PDF",
      "4. Catalogue — traitements et prix du cabinet",
      "5. Rappels — modèles SMS / confirmation FR-EN",
      "",
      "Astuce : cliquez une suggestion ou posez une question simple, ex. « Qui n'a pas payé ? »",
    ].join("\n")
  }

  // Arrivals
  if (p.includes("arrival") || p.includes("arrive") || p.includes("arriv")) {
    const arrivals = patients.filter((pt) => pt.arrival === todayStr)
    if (!arrivals.length) return "Aucune arrivée prévue aujourd'hui."
    return [
      `Arrivées aujourd'hui (${arrivals.length}) :`,
      ...arrivals.map(
        (a) =>
          `• ${a.firstName} ${a.lastName} ${a.nationalityFlag}`
      ),
      "",
      "Vous pouvez les retrouver dans Patients.",
    ].join("\n")
  }

  // Waiting room / statuses today
  if (p.includes("attente") || p.includes("waiting") || p.includes("salle")) {
    const waiting = appointments.filter((a) => a.date === todayStr && a.status === "waiting")
    if (!waiting.length) return "Personne en salle d'attente pour le moment."
    return [
      `En attente (${waiting.length}) :`,
      ...waiting.map((a) => {
        const pt = patients.find((x) => x.id === a.patientId)
        return `• ${pt ? `${pt.firstName} ${pt.lastName}` : a.patientId} — ${a.time}`
      }),
    ].join("\n")
  }

  // Today's appointments
  if (
    p.includes("rendez-vous") ||
    p.includes("rendez vous") ||
    p.includes("rdv") ||
    p.includes("appointment") ||
    (p.includes("aujourd") && (p.includes("jour") || p.includes("today")))
  ) {
    const todayAppts = appointments
      .filter((a) => a.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time))
    if (!todayAppts.length) {
      return `Aucun rendez-vous aujourd'hui.\nRésumé cabinet : ${stats.totalPatients} patients, ${stats.unpaidPatients} avec paiement en attente.`
    }
    return [
      `Rendez-vous du ${format(new Date(), "dd/MM/yyyy")} (${todayAppts.length}) :`,
      ...todayAppts.slice(0, 12).map((a) => {
        const pt = patients.find((x) => x.id === a.patientId)
        const tr = treatments.find((t) => t.id === a.treatmentId)
        return `• ${a.time} — ${pt ? `${pt.firstName} ${pt.lastName}` : "Patient"} — ${tr?.name ?? "Soin"} (${a.status})`
      }),
      todayAppts.length > 12 ? `… et ${todayAppts.length - 12} autres` : "",
      "",
      `Confirmés : ${stats.confirmed} · En attente : ${stats.waiting} · Terminés : ${stats.completed}`,
    ]
      .filter(Boolean)
      .join("\n")
  }

  // Unpaid patients
  if (
    p.includes("pas pay") ||
    p.includes("unpaid") ||
    p.includes("impay") ||
    (p.includes("pay") && (p.includes("qui") || p.includes("who") || p.includes("n'a") || p.includes("hasnt") || p.includes("haven't")))
  ) {
    const unpaid = patients.filter((pt) => pt.paymentStatus === "unpaid" || pt.paymentStatus === "partial")
    if (!unpaid.length) return "Tous les patients sont à jour sur leurs paiements."
    return [
      `Patients non payés / partiels (${unpaid.length}) :`,
      ...unpaid.slice(0, 15).map((u) => {
        const sum = getPatientPaymentSummary(u.id)
        return `• ${u.firstName} ${u.lastName} — ${u.paymentStatus} — reste ${money(sum.remaining)}`
      }),
      "",
      "Allez dans Paiements pour enregistrer un règlement, puis Factures pour le PDF.",
    ].join("\n")
  }

  // Revenue
  if (
    p.includes("recette") ||
    p.includes("revenue") ||
    p.includes("encaisse") ||
    p.includes("ca ") ||
    p.includes("chiffre") ||
    (p.includes("mois") && p.includes("combien"))
  ) {
    return [
      "Recettes (données live) :",
      `• Aujourd'hui : ${money(stats.revenueToday)}`,
      `• Ce mois : ${money(stats.monthlyRevenue)}`,
      stats.monthlyTrendPct != null
        ? `• Tendance vs mois précédent : ${stats.monthlyTrendPct > 0 ? "+" : ""}${stats.monthlyTrendPct}%`
        : null,
      "",
      "Détail des encaissements : page Paiements.",
    ]
      .filter(Boolean)
      .join("\n")
  }

  // Remaining balance total
  if (p.includes("reste") || p.includes("remaining") || p.includes("balance")) {
    const totalRemaining = invoices.reduce((s, i) => s + i.remainingBalance, 0)
    const openInvoices = invoices.filter((i) => i.status === "unpaid" || i.status === "partial")
    return [
      `Reste à payer total : ${money(totalRemaining)}`,
      `Factures ouvertes : ${openInvoices.length}`,
      "",
      openInvoices.length
        ? openInvoices
            .slice(0, 8)
            .map((inv) => {
              const pt = patients.find((x) => x.id === inv.patientId)
              return `• ${pt ? `${pt.firstName} ${pt.lastName}` : inv.patientId} — reste ${money(inv.remainingBalance)}`
            })
            .join("\n")
        : "Aucune facture en attente.",
    ].join("\n")
  }

  // Unpaid invoices
  if (
    (p.includes("facture") || p.includes("invoice")) &&
    (p.includes("non pay") || p.includes("unpaid") || p.includes("impay") || p.includes("quelles") || p.includes("which"))
  ) {
    const open = invoices.filter((i) => i.status !== "paid")
    if (!open.length) return "Toutes les factures sont payées."
    return [
      `Factures non soldées (${open.length}) :`,
      ...open.slice(0, 10).map((inv) => {
        const pt = patients.find((x) => x.id === inv.patientId)
        return `• ${pt ? `${pt.firstName} ${pt.lastName}` : inv.id} — total ${money(inv.treatmentCost)}, payé ${money(inv.paid)}, reste ${money(inv.remainingBalance)} (${inv.status})`
      }),
      "",
      "Ouvrez Factures → choisissez le logo → PDF / Imprimer.",
    ].join("\n")
  }

  // How to invoice
  if (p.includes("facture") || p.includes("invoice") || p.includes("generer") || p.includes("generate")) {
    return [
      "Comment générer une facture :",
      "1. Ajoutez un paiement (Paiements) et choisissez le traitement",
      "2. La facture se met à jour automatiquement (payé / reste)",
      "3. Allez dans Factures",
      "4. Sélectionnez un logo créé dans Settings",
      "5. Aperçu → PDF ou Imprimer",
      "",
      `Actuellement : ${invoices.length} facture(s), ${invoices.filter((i) => i.status !== "paid").length} non soldée(s).`,
    ].join("\n")
  }

  // International patients
  if (
    p.includes("international") ||
    p.includes("etranger")
  ) {
    const intl = patients.filter((pt) => pt.isInternational)
    return [
      `Patients internationaux : ${intl.length}`,
      ...intl.slice(0, 8).map((pt) => `• ${pt.firstName} ${pt.lastName} ${pt.nationalityFlag}`),
      "",
      "Consultez la liste dans Patients.",
    ].join("\n")
  }

  // Treatments catalog
  if (p.includes("traitement") || p.includes("treatment") || p.includes("catalogue") || p.includes("soin")) {
    return [
      `Catalogue traitements (${treatments.length}) — géré dans Traitements :`,
      ...treatments.map((tr) => `• ${tr.name} (${tr.category}) — ${money(tr.price)} — ${tr.duration} min`),
      "",
      "Ces prix alimentent les factures quand vous choisissez un traitement au paiement.",
    ].join("\n")
  }

  // Patient summary
  if (p.includes("summar") || p.includes("resum") || p.includes("historique")) {
    const sample = patients.find((pt) => pt.paymentStatus === "partial") ?? patients[0]
    if (!sample) return "Aucun patient dans le système."
    const appts = getAppointmentsByPatient(sample.id)
    const sum = getPatientPaymentSummary(sample.id)
    const tr = sample.treatmentId ? getTreatment(sample.treatmentId) : undefined
    return [
      `Exemple — ${sample.firstName} ${sample.lastName} ${sample.nationalityFlag} :`,
      `• Traitement : ${tr?.name ?? "—"}`,
      `• RDV : ${appts.length}`,
      `• Paiement : ${sample.paymentStatus} — dû ${money(sum.totalDue)}, payé ${money(sum.totalPaid)}, reste ${money(sum.remaining)}`,
      "",
      "Ouvrez un patient pour voir factures, photos, notes et paiements.",
    ].join("\n")
  }

  // SMS template
  if (p.includes("sms") || p.includes("rappel") || p.includes("reminder")) {
    return [
      "Modèle SMS de rappel :",
      "",
      "Bonjour {{name}},",
      "Rappel : votre rendez-vous est aujourd'hui à {{time}}.",
      "Merci d'arriver 10 minutes avant.",
      "Cabinet Dr Ben Mustapha Khalil",
      "",
      "Disponible aussi depuis un rendez-vous → rappel WhatsApp / Gmail.",
    ].join("\n")
  }

  // Translations
  if (p.includes("francais") || p.includes("french") || (p.includes("traduire") && p.includes("fr"))) {
    return [
      "Message de confirmation (FR) :",
      "",
      "Bonjour, votre rendez-vous est confirmé.",
      "Merci de votre confiance.",
      "Cabinet Dr Ben Mustapha Khalil",
    ].join("\n")
  }
  if (p.includes("anglais") || p.includes("english") || (p.includes("traduire") && p.includes("en"))) {
    return [
      "Confirmation message (EN) :",
      "",
      "Hello, your appointment is confirmed.",
      "Thank you for your trust.",
      "Dr Ben Mustapha Khalil Clinic",
    ].join("\n")
  }

  // Dashboard overview fallback for vague "resume" of clinic
  if (p.includes("dashboard") || p.includes("overview") || p.includes("statistique") || p.includes("combien de patient")) {
    return [
      "Aperçu du cabinet :",
      `• Patients : ${stats.totalPatients}`,
      `• RDV aujourd'hui : ${stats.todayPatients}`,
      `• Impayés / partiels : ${stats.unpaidPatients}`,
      `• Recettes du mois : ${money(stats.monthlyRevenue)}`,
      "",
      "Demandez aussi : « Qui n'a pas payé ? » ou « Que peux-tu faire ? »",
    ].join("\n")
  }

  return [
    "Je n'ai pas bien saisi — essayez une question plus précise.",
    "",
    "Exemples utiles :",
    "• Qui arrive aujourd'hui ?",
    "• Qui n'a pas payé ?",
    "• Quels sont les rendez-vous d'aujourd'hui ?",
    "• Combien avons-nous encaissé ce mois ?",
    "• Comment générer une facture ?",
    "• Que peux-tu faire ?",
    "",
    "Ou cliquez une suggestion dans le panneau.",
  ].join("\n")
}

const CLINIC_SETTINGS_KEY = "dashboard-dentaire-clinic-settings"

const defaultClinicSettings: ClinicSettings = {
  clinicName: "Dr. Khalil Ben Mustapha",
  phone: "+216 71 000 000",
  address: "Monastir, Tunisie",
  logos: [],
}

function loadClinicSettings(): ClinicSettings {
  try {
    if (typeof localStorage === "undefined") return { ...defaultClinicSettings, logos: [] }
    const raw = localStorage.getItem(CLINIC_SETTINGS_KEY)
    if (!raw) return { ...defaultClinicSettings, logos: [] }
    const parsed = JSON.parse(raw) as ClinicSettings
    const logos = Array.isArray(parsed.logos) ? parsed.logos : []
    // Drop the old built-in default ("Clinique principale" / logo1) — keep only logos created in Settings
    const cleaned = logos.filter(
      (l) =>
        l.id !== "logo1" &&
        l.name?.trim().toLowerCase() !== "clinique principale" &&
        l.name?.trim().toLowerCase() !== "smile care"
    )
    const withDefault =
      cleaned.length > 0 && !cleaned.some((l) => l.isDefault)
        ? cleaned.map((l, i) => ({ ...l, isDefault: i === 0 }))
        : cleaned
    const next: ClinicSettings = {
      clinicName: parsed.clinicName || defaultClinicSettings.clinicName,
      phone: parsed.phone || defaultClinicSettings.phone,
      address: parsed.address || defaultClinicSettings.address,
      logos: withDefault,
    }
    // Persist cleanup so the old logo disappears immediately
    if (withDefault.length !== logos.length) {
      try {
        localStorage.setItem(CLINIC_SETTINGS_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
    }
    return next
  } catch {
    return { ...defaultClinicSettings, logos: [] }
  }
}

function persistClinicSettings(settings: ClinicSettings) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CLINIC_SETTINGS_KEY, JSON.stringify(settings))
    }
  } catch {
    // ignore quota errors for large images
  }
}

export let clinicSettings: ClinicSettings = loadClinicSettings()

export function getClinicSettings() {
  return clinicSettings
}

export function updateClinicSettings(data: Partial<Omit<ClinicSettings, "logos">>) {
  clinicSettings = { ...clinicSettings, ...data }
  persistClinicSettings(clinicSettings)
  return clinicSettings
}

export function getClinicLogos() {
  return clinicSettings.logos
}

export function getDefaultClinicLogo() {
  return clinicSettings.logos.find((l) => l.isDefault) ?? clinicSettings.logos[0]
}

export function getClinicLogo(id: string) {
  return clinicSettings.logos.find((l) => l.id === id)
}

export function addClinicLogo(data: Omit<ClinicLogo, "id" | "isDefault"> & { isDefault?: boolean }) {
  const makeDefault = data.isDefault === true || clinicSettings.logos.length === 0
  const logos = makeDefault
    ? clinicSettings.logos.map((l) => ({ ...l, isDefault: false }))
    : [...clinicSettings.logos]
  const logo: ClinicLogo = {
    id: `logo${Date.now()}`,
    name: data.name.trim(),
    website: data.website?.trim() || undefined,
    imageUrl: data.imageUrl,
    isDefault: makeDefault,
  }
  clinicSettings = { ...clinicSettings, logos: [...logos, logo] }
  persistClinicSettings(clinicSettings)
  return logo
}

export function updateClinicLogo(id: string, data: Partial<Omit<ClinicLogo, "id">>) {
  const idx = clinicSettings.logos.findIndex((l) => l.id === id)
  if (idx < 0) return undefined
  let logos = clinicSettings.logos.map((l) => (l.id === id ? { ...l, ...data, id } : l))
  if (data.isDefault === true) {
    logos = logos.map((l) => ({ ...l, isDefault: l.id === id }))
  }
  clinicSettings = { ...clinicSettings, logos }
  persistClinicSettings(clinicSettings)
  return logos.find((l) => l.id === id)
}

export function deleteClinicLogo(id: string) {
  const wasDefault = clinicSettings.logos.find((l) => l.id === id)?.isDefault
  let logos = clinicSettings.logos.filter((l) => l.id !== id)
  if (wasDefault && logos.length > 0 && !logos.some((l) => l.isDefault)) {
    logos = logos.map((l, i) => ({ ...l, isDefault: i === 0 }))
  }
  clinicSettings = { ...clinicSettings, logos }
  persistClinicSettings(clinicSettings)
}

export function setDefaultClinicLogo(id: string) {
  return updateClinicLogo(id, { isDefault: true })
}
