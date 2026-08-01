import { HashRouter, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { RequireStaffAuth } from "@/components/auth/RequireStaffAuth"
import DashboardPage from "@/pages/DashboardPage"
import PatientsPage from "@/pages/PatientsPage"
import PatientProfilePage from "@/pages/PatientProfilePage"
import AppointmentsPage from "@/pages/AppointmentsPage"
import CalendarPage from "@/pages/CalendarPage"
import DoctorsPage from "@/pages/DoctorsPage"
import TreatmentsPage from "@/pages/TreatmentsPage"
import PaymentsPage from "@/pages/PaymentsPage"
import InvoicesPage from "@/pages/InvoicesPage"
import SettingsPage from "@/pages/SettingsPage"
import LoginPage from "@/pages/LoginPage"
import PortalLoginPage from "@/pages/portal/PortalLoginPage"
import PortalDashboardPage from "@/pages/portal/PortalDashboardPage"
import NotFoundPage from "@/pages/NotFoundPage"

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
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<WithLayout><DashboardPage /></WithLayout>} />
          <Route path="/patients" element={<WithLayout><PatientsPage /></WithLayout>} />
          <Route path="/patients/:id" element={<WithLayout><PatientProfilePage /></WithLayout>} />
          <Route path="/appointments" element={<WithLayout><AppointmentsPage /></WithLayout>} />
          <Route path="/calendar" element={<WithLayout><CalendarPage /></WithLayout>} />
          <Route path="/doctors" element={<WithLayout><DoctorsPage /></WithLayout>} />
          <Route path="/treatments" element={<WithLayout><TreatmentsPage /></WithLayout>} />
          <Route path="/payments" element={<WithLayout><PaymentsPage /></WithLayout>} />
          <Route path="/invoices" element={<WithLayout><InvoicesPage /></WithLayout>} />
          <Route path="/settings" element={<WithLayout><SettingsPage /></WithLayout>} />
          <Route path="/portal/login" element={<PortalLoginPage />} />
          <Route path="/portal" element={<PortalDashboardPage />} />
          <Route path="*" element={<WithLayout><NotFoundPage /></WithLayout>} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  )
}
