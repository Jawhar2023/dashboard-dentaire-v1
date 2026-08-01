const { app, BrowserWindow, shell, Menu } = require("electron")
const path = require("path")

const isDev = !app.isPackaged
const VITE_DEV_SERVER = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173"

/** @type {BrowserWindow | null} */
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: "#f8fafc",
    title: "Khalil Dental CRM",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  })

  // Minimal File menu so users can reload / quit on Windows
  const menu = Menu.buildFromTemplate([
    {
      label: "Fichier",
      submenu: [
        { role: "reload", label: "Actualiser" },
        { role: "forceReload", label: "Forcer l'actualisation" },
        { type: "separator" },
        { role: "toggleDevTools", label: "Outils développeur", visible: isDev },
        { type: "separator" },
        { role: "quit", label: "Quitter" },
      ],
    },
    {
      label: "Affichage",
      submenu: [
        { role: "zoomIn", label: "Zoom +" },
        { role: "zoomOut", label: "Zoom -" },
        { role: "resetZoom", label: "Zoom normal" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Plein écran" },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show()
    if (isDev) mainWindow?.webContents.openDevTools({ mode: "detach" })
  })

  // Open http(s) links in the system browser; allow blob/print windows in-app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("blob:") || url.startsWith("about:blank")) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
          },
        },
      }
    }
    if (url.startsWith("http:") || url.startsWith("https:") || url.startsWith("mailto:")) {
      void shell.openExternal(url)
      return { action: "deny" }
    }
    return { action: "deny" }
  })

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const allowed =
      url.startsWith(VITE_DEV_SERVER) ||
      url.startsWith("file:") ||
      url.startsWith("blob:")
    if (!allowed) {
      event.preventDefault()
      void shell.openExternal(url)
    }
  })

  if (isDev) {
    void mainWindow.loadURL(VITE_DEV_SERVER)
  } else {
    void mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"))
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
