import { useCallback, useEffect, useState } from "react"

const SESSION_KEY = "staffDashboardSession"
const PROFILE_KEY = "staffDashboardProfile"

/** Demo clinic staff account (mock auth — no backend) */
export const STAFF_DEMO = {
  email: "admin@it2lab.tn",
  password: "it2lab2026",
  defaultName: "Admin",
  role: "Administrateur",
} as const

export interface StaffSession {
  email: string
  role: string
  loggedInAt: string
}

export interface StaffProfile {
  name: string
}

function readSession(): StaffSession | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StaffSession
  } catch {
    return null
  }
}

function readProfile(): StaffProfile {
  if (typeof window === "undefined") return { name: STAFF_DEMO.defaultName }
  const raw = window.localStorage.getItem(PROFILE_KEY)
  if (!raw) return { name: STAFF_DEMO.defaultName }
  try {
    const parsed = JSON.parse(raw) as StaffProfile
    return { name: parsed.name?.trim() || STAFF_DEMO.defaultName }
  } catch {
    return { name: STAFF_DEMO.defaultName }
  }
}

function writeProfile(profile: StaffProfile) {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function authenticateStaff(email: string, password: string): StaffSession | null {
  const normalized = email.trim().toLowerCase()
  if (normalized !== STAFF_DEMO.email || password !== STAFF_DEMO.password) {
    return null
  }
  return {
    email: STAFF_DEMO.email,
    role: STAFF_DEMO.role,
    loggedInAt: new Date().toISOString(),
  }
}

export function getStaffProfile(): StaffProfile {
  return readProfile()
}

export function updateStaffProfile(data: Partial<StaffProfile>): StaffProfile {
  const next: StaffProfile = {
    name: data.name?.trim() || readProfile().name,
  }
  writeProfile(next)
  return next
}

export function useStaffSession() {
  const [session, setSession] = useState<StaffSession | null>(() => readSession())
  const [profile, setProfile] = useState<StaffProfile>(() => readProfile())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) setSession(readSession())
      if (e.key === PROFILE_KEY) setProfile(readProfile())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const login = useCallback((email: string, password: string) => {
    const found = authenticateStaff(email, password)
    if (!found) return null
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(found))
    setSession(found)
    setProfile(readProfile())
    return found
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  const saveProfile = useCallback((data: Partial<StaffProfile>) => {
    const next = updateStaffProfile(data)
    setProfile(next)
    return next
  }, [])

  return {
    session,
    profile,
    login,
    logout,
    saveProfile,
    isAuthenticated: !!session,
    displayName: profile.name,
    email: session?.email ?? STAFF_DEMO.email,
  }
}
