import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { delay } from "@/lib/utils"
import {
  patients,
  appointments,
  doctors,
  treatments,
  getDashboardStats,
  getAppointmentsByDate,
  getAppointmentsByPatient,
  updateAppointmentStatus,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  addPatient,
  updatePatient,
  deletePatient,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  doctorSpecialties,
  addDoctorSpecialty,
  addTreatment,
  updateTreatment,
  deleteTreatment,
  treatmentCategories,
  addTreatmentCategory,
  searchAll,
  notifications,
  markNotificationRead,
  addReminderLog,
  getAIResponse,
  flights,
  airportTransfers,
  hotels,
  drivers,
  invoices,
  payments,
  messages,
  reminderLogs,
  tourismCases,
  getAnalyticsData,
  currentUser,
  getBeforeAfter,
  addBeforeAfter,
  updateBeforeAfter,
  deleteBeforeAfter,
  updateTourismCaseStatus,
  addHotel,
  updateHotel,
  deleteHotel,
  addDriver,
  updateDriver,
  deleteDriver,
  addFlight,
  updateFlight,
  addAirportTransfer,
  updateAirportTransfer,
  deleteAirportTransfer,
  getPaymentsByPatient,
  getPatientPaymentSummary,
  addPayment,
  updatePayment,
  deletePayment,
  getClinicSettings,
  updateClinicSettings,
  getClinicLogos,
  addClinicLogo,
  updateClinicLogo,
  deleteClinicLogo,
  setDefaultClinicLogo,
} from "@/lib/mockDataStore"
import type {
  Appointment,
  Patient,
  Doctor,
  Treatment,
  BeforeAfterPhoto,
  TourismStatus,
  Hotel,
  Driver,
  AirportTransfer,
  Flight,
  Payment,
  ClinicLogo,
  ClinicSettings,
} from "@/lib/types"
import type { QueryClient } from "@tanstack/react-query"

function invalidateDashboard(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
  void qc.invalidateQueries({ queryKey: ["analytics"] })
}
import { format } from "date-fns"

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => { await delay(); return patients },
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: async () => {
      await delay()
      return patients.find((p) => p.id === id)
    },
    enabled: !!id,
  })
}

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => { await delay(); return doctors },
  })
}

export function useDoctorSpecialties() {
  return useQuery({
    queryKey: ["doctor-specialties"],
    queryFn: async () => { await delay(); return doctorSpecialties },
  })
}

export function useAddDoctorSpecialty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      await delay(100)
      const added = addDoctorSpecialty(name)
      if (!added) throw new Error("Specialty name is required")
      return added
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctor-specialties"] }),
  })
}

export function useCreateDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Doctor, "id">) => {
      await delay(200)
      return addDoctor(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctors"] })
      qc.invalidateQueries({ queryKey: ["doctor-specialties"] })
    },
  })
}

export function useUpdateDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Doctor> }) => {
      await delay(200)
      const updated = updateDoctor(id, data)
      if (!updated) throw new Error("Doctor not found")
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctors"] })
      qc.invalidateQueries({ queryKey: ["doctor-specialties"] })
    },
  })
}

export function useDeleteDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(200)
      deleteDoctor(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctors"] })
      qc.invalidateQueries({ queryKey: ["patients"] })
      qc.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

export function useTreatments() {
  return useQuery({
    queryKey: ["treatments"],
    queryFn: async () => { await delay(); return treatments },
  })
}

export function useTreatmentCategories() {
  return useQuery({
    queryKey: ["treatment-categories"],
    queryFn: async () => { await delay(); return treatmentCategories },
  })
}

export function useAddTreatmentCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      await delay(100)
      const added = addTreatmentCategory(name)
      if (!added) throw new Error("Category name is required")
      return added
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treatment-categories"] }),
  })
}

export function useCreateTreatment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Treatment, "id">) => {
      await delay(200)
      return addTreatment(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treatments"] })
      qc.invalidateQueries({ queryKey: ["treatment-categories"] })
    },
  })
}

export function useUpdateTreatment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Treatment> }) => {
      await delay(200)
      const updated = updateTreatment(id, data)
      if (!updated) throw new Error("Treatment not found")
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treatments"] })
      qc.invalidateQueries({ queryKey: ["treatment-categories"] })
      qc.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

export function useDeleteTreatment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(200)
      deleteTreatment(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treatments"] })
      qc.invalidateQueries({ queryKey: ["patients"] })
      qc.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

export function useAppointments(date?: string) {
  const d = date ?? format(new Date(), "yyyy-MM-dd")
  return useQuery({
    queryKey: ["appointments", d],
    queryFn: async () => { await delay(); return getAppointmentsByDate(d) },
  })
}

export function useAllAppointments() {
  return useQuery({
    queryKey: ["appointments", "all"],
    queryFn: async () => { await delay(); return appointments },
  })
}

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: ["appointments", "patient", patientId],
    queryFn: async () => { await delay(); return getAppointmentsByPatient(patientId) },
    enabled: !!patientId,
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      await delay()
      return getDashboardStats()
    },
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => { await delay(); return notifications },
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { await delay(100); markNotificationRead(id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Appointment["status"] }) => {
      await delay(150)
      updateAppointmentStatus(id, status)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] })
      invalidateDashboard(qc)
    },
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Appointment, "id">) => {
      await delay(200)
      return addAppointment(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] })
      invalidateDashboard(qc)
    },
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      await delay(200)
      const updated = updateAppointment(id, data)
      if (!updated) throw new Error("Appointment not found")
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] })
      invalidateDashboard(qc)
    },
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(200)
      deleteAppointment(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] })
      qc.invalidateQueries({ queryKey: ["reminder-logs"] })
      invalidateDashboard(qc)
    },
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Patient, "id">) => {
      await delay(200)
      return addPatient(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] })
      invalidateDashboard(qc)
    },
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Patient> }) => {
      await delay(200)
      const updated = updatePatient(id, data)
      if (!updated) throw new Error("Patient not found")
      return updated
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["patients"] })
      qc.invalidateQueries({ queryKey: ["patients", id] })
      invalidateDashboard(qc)
    },
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(200)
      deletePatient(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] })
      qc.invalidateQueries({ queryKey: ["appointments"] })
      invalidateDashboard(qc)
    },
  })
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => { await delay(100); return searchAll(query) },
    enabled: query.length >= 2,
  })
}

export function useFlights() {
  return useQuery({
    queryKey: ["flights"],
    queryFn: async () => { await delay(); return flights },
  })
}

export function useAirportTransfers() {
  return useQuery({
    queryKey: ["airport-transfers"],
    queryFn: async () => { await delay(); return airportTransfers },
  })
}

export function useCreateAirportTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<AirportTransfer, "id">) => {
      await delay(200)
      return addAirportTransfer(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["airport-transfers"] })
      qc.invalidateQueries({ queryKey: ["flights"] })
    },
  })
}

export function useUpdateAirportTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AirportTransfer> }) => {
      await delay(200)
      const updated = updateAirportTransfer(id, data)
      if (!updated) throw new Error("Transfer not found")
      return updated
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["airport-transfers"] }),
  })
}

export function useDeleteAirportTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(200)
      deleteAirportTransfer(id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["airport-transfers"] }),
  })
}

export function useCreateFlight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Flight, "id">) => {
      await delay(100)
      return addFlight(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flights"] }),
  })
}

export function useUpdateFlight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Flight> }) => {
      await delay(100)
      const updated = updateFlight(id, data)
      if (!updated) throw new Error("Flight not found")
      return updated
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flights"] }),
  })
}

export function useHotels() {
  return useQuery({
    queryKey: ["hotels"],
    queryFn: async () => { await delay(); return hotels },
  })
}

export function useCreateHotel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Hotel, "id">) => {
      await delay(200)
      return addHotel(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hotels"] })
      qc.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}

export function useUpdateHotel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Hotel> }) => {
      await delay(200)
      const updated = updateHotel(id, data)
      if (!updated) throw new Error("Hotel not found")
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hotels"] })
      qc.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}

export function useDeleteHotel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(200)
      deleteHotel(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hotels"] })
      qc.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async () => { await delay(); return drivers },
  })
}

export function useCreateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Driver, "id">) => {
      await delay(200)
      return addDriver(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  })
}

export function useUpdateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Driver> }) => {
      await delay(200)
      const updated = updateDriver(id, data)
      if (!updated) throw new Error("Driver not found")
      return updated
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  })
}

export function useDeleteDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(200)
      deleteDriver(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drivers"] })
      qc.invalidateQueries({ queryKey: ["patients"] })
      qc.invalidateQueries({ queryKey: ["airport-transfers"] })
    },
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      await delay()
      return [...invoices]
    },
  })
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      await delay()
      return [...payments]
    },
  })
}

export function usePatientPayments(patientId: string) {
  return useQuery({
    queryKey: ["payments", patientId],
    queryFn: async () => {
      await delay()
      return getPaymentsByPatient(patientId)
    },
    enabled: !!patientId,
  })
}

export function usePatientPaymentSummary(patientId: string) {
  return useQuery({
    queryKey: ["payment-summary", patientId],
    queryFn: async () => {
      await delay()
      return getPatientPaymentSummary(patientId)
    },
    enabled: !!patientId,
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      data: Omit<Payment, "id" | "invoiceId"> & { invoiceId?: string; treatmentId?: string }
    ) => {
      await delay(200)
      return addPayment(data)
    },
    onSuccess: (payment) => {
      qc.invalidateQueries({ queryKey: ["payments"] })
      qc.invalidateQueries({ queryKey: ["payments", payment.patientId] })
      qc.invalidateQueries({ queryKey: ["payment-summary", payment.patientId] })
      qc.invalidateQueries({ queryKey: ["invoices"] })
      qc.invalidateQueries({ queryKey: ["patients"] })
      qc.invalidateQueries({ queryKey: ["patients", payment.patientId] })
      invalidateDashboard(qc)
    },
  })
}

export function useUpdatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Payment> }) => {
      await delay(200)
      const updated = updatePayment(id, data)
      if (!updated) throw new Error("Payment not found")
      return updated
    },
    onSuccess: (payment) => {
      qc.invalidateQueries({ queryKey: ["payments"] })
      qc.invalidateQueries({ queryKey: ["payments", payment.patientId] })
      qc.invalidateQueries({ queryKey: ["payment-summary", payment.patientId] })
      qc.invalidateQueries({ queryKey: ["invoices"] })
      qc.invalidateQueries({ queryKey: ["patients"] })
      qc.invalidateQueries({ queryKey: ["patients", payment.patientId] })
      invalidateDashboard(qc)
    },
  })
}

export function useDeletePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      await delay(200)
      deletePayment(id)
      return patientId
    },
    onSuccess: (patientId) => {
      qc.invalidateQueries({ queryKey: ["payments"] })
      qc.invalidateQueries({ queryKey: ["payments", patientId] })
      qc.invalidateQueries({ queryKey: ["payment-summary", patientId] })
      qc.invalidateQueries({ queryKey: ["invoices"] })
      qc.invalidateQueries({ queryKey: ["patients"] })
      qc.invalidateQueries({ queryKey: ["patients", patientId] })
      invalidateDashboard(qc)
    },
  })
}

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => { await delay(); return messages },
  })
}

export function useReminderLogs() {
  return useQuery({
    queryKey: ["reminder-logs"],
    queryFn: async () => { await delay(); return reminderLogs },
  })
}

export function useTourismCases() {
  return useQuery({
    queryKey: ["tourism-cases"],
    queryFn: async () => { await delay(); return tourismCases },
  })
}

export function useUpdateTourismStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TourismStatus }) => {
      await delay(150)
      const updated = updateTourismCaseStatus(id, status)
      if (!updated) throw new Error("Tourism case not found")
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tourism-cases"] })
    },
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      await delay()
      return getAnalyticsData()
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => { await delay(50); return currentUser },
  })
}

export function useSendReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { appointmentId: string; patientId: string; channel: "sms" | "whatsapp" | "email"; content: string }) => {
      await delay(300)
      return addReminderLog({ ...data, sentAt: new Date().toISOString(), status: "delivered" })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminder-logs"] }),
  })
}

export function useAIQuery() {
  return useMutation({
    mutationFn: async (prompt: string) => {
      await delay(500)
      return getAIResponse(prompt)
    },
  })
}

export function usePatientBeforeAfter(patientId: string) {
  return useQuery({
    queryKey: ["before-after", patientId],
    queryFn: async () => {
      await delay()
      return getBeforeAfter(patientId)
    },
    enabled: !!patientId,
  })
}

export function useCreateBeforeAfter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<BeforeAfterPhoto, "id">) => {
      await delay(200)
      return addBeforeAfter(data)
    },
    onSuccess: (photo) => {
      qc.invalidateQueries({ queryKey: ["before-after", photo.patientId] })
    },
  })
}

export function useUpdateBeforeAfter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BeforeAfterPhoto> }) => {
      await delay(200)
      const updated = updateBeforeAfter(id, data)
      if (!updated) throw new Error("Photo not found")
      return updated
    },
    onSuccess: (photo) => {
      qc.invalidateQueries({ queryKey: ["before-after", photo.patientId] })
    },
  })
}

export function useDeleteBeforeAfter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      await delay(200)
      deleteBeforeAfter(id)
      return patientId
    },
    onSuccess: (patientId) => {
      qc.invalidateQueries({ queryKey: ["before-after", patientId] })
    },
  })
}

export function useClinicSettings() {
  return useQuery({
    queryKey: ["clinic-settings"],
    queryFn: async () => {
      await delay()
      return getClinicSettings()
    },
  })
}

export function useUpdateClinicSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Omit<ClinicSettings, "logos">>) => {
      await delay(150)
      return updateClinicSettings(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic-settings"] }),
  })
}

export function useClinicLogos() {
  return useQuery({
    queryKey: ["clinic-logos"],
    queryFn: async () => {
      await delay()
      return [...getClinicLogos()]
    },
  })
}

export function useCreateClinicLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<ClinicLogo, "id" | "isDefault"> & { isDefault?: boolean }) => {
      await delay(200)
      return addClinicLogo(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinic-logos"] })
      qc.invalidateQueries({ queryKey: ["clinic-settings"] })
    },
  })
}

export function useUpdateClinicLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<ClinicLogo, "id">> }) => {
      await delay(200)
      const updated = updateClinicLogo(id, data)
      if (!updated) throw new Error("Logo not found")
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinic-logos"] })
      qc.invalidateQueries({ queryKey: ["clinic-settings"] })
    },
  })
}

export function useDeleteClinicLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(200)
      deleteClinicLogo(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinic-logos"] })
      qc.invalidateQueries({ queryKey: ["clinic-settings"] })
    },
  })
}

export function useSetDefaultClinicLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(100)
      const updated = setDefaultClinicLogo(id)
      if (!updated) throw new Error("Logo not found")
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinic-logos"] })
      qc.invalidateQueries({ queryKey: ["clinic-settings"] })
    },
  })
}
