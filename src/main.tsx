import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "./lib/i18n"
import App from "./App"
import { QueryProvider } from "./providers/QueryProvider"
import { ThemeProvider } from "./providers/ThemeProvider"
import { AppProvider } from "./providers/AppProvider"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>
)
