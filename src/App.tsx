import { HashRouter, Route, Routes } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { RequireStaffAuth } from "@/components/auth/RequireStaffAuth"
import LoginPage from "@/pages/LoginPage"

const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const PatientsPage = lazy(() => import("@/pages/PatientsPage"))
const PatientProfilePage = lazy(() => import("@/pages/PatientProfilePage"))
const AppointmentsPage = lazy(() => import("@/pages/AppointmentsPage"))
const CalendarPage = lazy(() => import("@/pages/CalendarPage"))
const DoctorsPage = lazy(() => import("@/pages/DoctorsPage"))
const TreatmentsPage = lazy(() => import("@/pages/TreatmentsPage"))
const TreatmentGlobalePage = lazy(() => import("@/pages/TreatmentGlobalePage"))
const PaymentsPage = lazy(() => import("@/pages/PaymentsPage"))
const InvoicesPage = lazy(() => import("@/pages/InvoicesPage"))
const RappelPage = lazy(() => import("@/pages/RappelPage"))
const SettingsPage = lazy(() => import("@/pages/SettingsPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))

const WithLayout = ({ children }: { children: React.ReactNode }) => (
  <RequireStaffAuth>
    <DashboardLayout>{children}</DashboardLayout>
  </RequireStaffAuth>
)

export default function App() {
  return (
    <TooltipProvider>
      <Toaster position="top-right" richColors />
      <HashRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<WithLayout><DashboardPage /></WithLayout>} />
            <Route path="/patients" element={<WithLayout><PatientsPage /></WithLayout>} />
            <Route path="/patients/:id" element={<WithLayout><PatientProfilePage /></WithLayout>} />
            <Route path="/appointments" element={<WithLayout><AppointmentsPage /></WithLayout>} />
            <Route path="/calendar" element={<WithLayout><CalendarPage /></WithLayout>} />
            <Route path="/doctors" element={<WithLayout><DoctorsPage /></WithLayout>} />
            <Route path="/treatments" element={<WithLayout><TreatmentsPage /></WithLayout>} />
            <Route path="/treatment-globale" element={<WithLayout><TreatmentGlobalePage /></WithLayout>} />
            <Route path="/payments" element={<WithLayout><PaymentsPage /></WithLayout>} />
            <Route path="/invoices" element={<WithLayout><InvoicesPage /></WithLayout>} />
            <Route path="/rappel" element={<WithLayout><RappelPage /></WithLayout>} />
            <Route path="/settings" element={<WithLayout><SettingsPage /></WithLayout>} />
            <Route path="*" element={<WithLayout><NotFoundPage /></WithLayout>} />
          </Routes>
        </Suspense>
      </HashRouter>
    </TooltipProvider>
  )
}
