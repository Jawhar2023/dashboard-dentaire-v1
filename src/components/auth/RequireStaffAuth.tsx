import { Navigate, useLocation } from "react-router-dom"
import { useStaffSession } from "@/lib/staffAuth"

export function RequireStaffAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStaffSession()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
