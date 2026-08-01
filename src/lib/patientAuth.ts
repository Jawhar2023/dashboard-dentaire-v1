import { useEffect, useState, useCallback } from "react"
import { authenticatePatient, getPatient } from "@/lib/mockDataStore"
import type { Patient } from "@/lib/types"

const STORAGE_KEY = "patientPortalSession"

interface PortalSession {
  patientId: string
  loggedInAt: string
}

function readSession(): PortalSession | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PortalSession
  } catch {
    return null
  }
}

export function usePortalSession() {
  const [patient, setPatient] = useState<Patient | null>(() => {
    const session = readSession()
    if (!session) return null
    return getPatient(session.patientId) ?? null
  })

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const session = readSession()
      setPatient(session ? getPatient(session.patientId) ?? null : null)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const login = useCallback((username: string, password: string) => {
    const found = authenticatePatient(username, password)
    if (!found) return null
    const session: PortalSession = {
      patientId: found.id,
      loggedInAt: new Date().toISOString(),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setPatient(found)
    return found
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setPatient(null)
  }, [])

  return { patient, login, logout, isAuthenticated: !!patient }
}
