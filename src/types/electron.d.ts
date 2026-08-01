export {}

declare global {
  interface Window {
    desktopApp?: {
      isElectron: boolean
      platform: string
    }
  }
}
