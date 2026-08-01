import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface AppContextType {
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  toggleSearch: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const toggleSearch = useCallback(() => setSearchOpen((o) => !o), [])

  return (
    <AppContext.Provider value={{ searchOpen, setSearchOpen, toggleSearch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
