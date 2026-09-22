export type AppointmentStatus =
  | "confirmed"
  | "arrived"
  | "waiting"
  | "completed"
  | "cancelled"
  | "treatment"

export type PaymentStatus = "paid" | "partial" | "unpaid" | "refunded"
export type ReminderStatus = "delivered" | "read" | "failed" | "pending" | "none"
export type ArrivalStatus = "not_arrived" | "in_transit" | "arrived" | "departed"
export type ReminderChannel = "sms" | "whatsapp" | "email"
export type TourismStatus =
  | "lead"
  | "quote"
  | "accepted"
  | "flight_booked"
  | "airport_pickup"
  | "hotel_checkin"
  | "consultation"
  | "treatment"
  | "recovery"
  | "tourism"
  | "final_check"
  | "airport_drop"
  | "completed"

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  avatar?: string
  profileEmoji?: string
  phone: string
  available: boolean
}

export interface Treatment {
  id: string
  name: string
  duration: number
  price: number
  category: string
}

export interface Patient {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  nationality: string
  nationalityFlag: string
  passport?: string
  avatar?: string
  arrival?: string
  departure?: string
  hotelId?: string
  driverId?: string
  doctorId?: string
  treatmentId?: string
  paymentStatus: PaymentStatus
  isInternational: boolean
  emergencyContact?: string
  visaNotes?: string
  notes?: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  treatmentId: string
  date: string
  time: string
  duration: number
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  /** Amount already paid for this appointment (TND) */
  amountPaid?: number
  /** Per-appointment override of the treatment's base price (TND) */
  customPrice?: number
  reminderStatus: ReminderStatus
  arrivalStatus: ArrivalStatus
  notes?: string
  hotelId?: string
  driverId?: string
  flightId?: string
  airportPickupIncluded?: boolean
  smsReminder: boolean
  whatsappReminder: boolean
  emailReminder: boolean
  autoReminder24h: boolean
  autoReminder3h: boolean
  autoReminder1h: boolean
}

export type RappelDesign = "rose" | "amber" | "emerald" | "sky" | "violet" | "slate"

export interface RappelNote {
  id: string
  date: string
  text: string
  design: RappelDesign
  createdAt: string
}

export interface Flight {
  id: string
  patientId: string
  flightNumber: string
  airline: string
  arrivalTime: string
  departureTime?: string
  terminal: string
  isReturn: boolean
  status: "scheduled" | "delayed" | "landed" | "departed"
}

export interface Driver {
  id: string
  name: string
  phone: string
  vehicle: string
  plateNumber: string
  available: boolean
  avatar?: string
}

export interface Hotel {
  id: string
  name: string
  roomNumber: string
  patientId?: string
  checkIn: string
  checkOut: string
  breakfast: boolean
  transportation: boolean
  status: "booked" | "checked_in" | "checked_out"
}

export interface AirportTransfer {
  id: string
  patientId: string
  flightId: string
  driverId: string
  pickupTime: string
  terminal: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  type: "pickup" | "dropoff"
}

export interface Invoice {
  id: string
  patientId: string
  treatmentCost: number
  deposit: number
  remainingBalance: number
  paid: number
  status: PaymentStatus
  createdAt: string
  items: { name: string; amount: number }[]
}

export interface Payment {
  id: string
  patientId: string
  invoiceId: string
  amount: number
  method: "cash" | "card" | "transfer" | "paypal"
  date: string
  status: "completed" | "pending" | "refunded"
}

export interface Message {
  id: string
  patientId: string
  channel: "sms" | "whatsapp" | "email"
  content: string
  sentAt: string
  status: ReminderStatus
  direction: "inbound" | "outbound"
}

export interface ReminderLog {
  id: string
  appointmentId: string
  patientId: string
  channel: ReminderChannel
  content: string
  sentAt: string
  status: ReminderStatus
  scheduledFor?: string
}

export interface MedicalTourismCase {
  id: string
  patientId: string
  status: TourismStatus
  flightId?: string
  hotelId?: string
  driverId?: string
  translator?: string
  treatmentPlan: string
  touristActivities: string[]
  emergencyContact: string
  visaNotes?: string
  quoteAmount: number
}

export interface Notification {
  id: string
  type:
    | "patient_arriving"
    | "reminder_failed"
    | "flight_delayed"
    | "payment_received"
    | "appointment_cancelled"
    | "doctor_unavailable"
    | "patient_no_appointment"
  title: string
  message: string
  createdAt: string
  read: boolean
  link?: string
}

export interface DashboardStats {
  todayPatients: number
  confirmed: number
  waiting: number
  arrived: number
  treatment: number
  completed: number
  cancelled: number
  revenueToday: number
  monthlyRevenue: number
  previousMonthRevenue: number
  monthlyTrendPct: number | null
  totalPatients: number
  unpaidPatients: number
}

export interface AnalyticsData {
  revenueByMonth: { month: string; revenue: number }[]
  patientsByMonth: { month: string; count: number }[]
  patientsByCountry: { country: string; count: number; flag: string }[]
  topTreatments: { name: string; count: number }[]
  conversionRate: number
  reminderSuccessRate: number
  cancelledAppointments: number
  websiteLeads: number
  whatsappLeads: number
}

export interface PatientTimelineEvent {
  id: string
  patientId: string
  type: string
  label: string
  date: string
  completed: boolean
}

export interface ClinicLogo {
  id: string
  name: string
  website?: string
  imageUrl: string
  isDefault: boolean
}

export interface ClinicSettings {
  clinicName: string
  phone: string
  address: string
  logos: ClinicLogo[]
}

export interface BeforeAfterPhoto {
  id: string
  patientId: string
  beforeUrl: string
  afterUrl: string
  treatment: string
  date: string
}
