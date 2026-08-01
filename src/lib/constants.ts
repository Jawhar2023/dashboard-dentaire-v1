export const NATIONALITIES = [
  { name: "Tunisia", flag: "🇹🇳", code: "TN" },
  { name: "France", flag: "🇫🇷", code: "FR" },
  { name: "Germany", flag: "🇩🇪", code: "DE" },
  { name: "UK", flag: "🇬🇧", code: "GB" },
  { name: "Italy", flag: "🇮🇹", code: "IT" },
  { name: "Spain", flag: "🇪🇸", code: "ES" },
  { name: "USA", flag: "🇺🇸", code: "US" },
  { name: "UAE", flag: "🇦🇪", code: "AE" },
  { name: "Poland", flag: "🇵🇱", code: "PL" },
  { name: "Canada", flag: "🇨🇦", code: "CA" },
  { name: "Belgium", flag: "🇧🇪", code: "BE" },
  { name: "Switzerland", flag: "🇨🇭", code: "CH" },
] as const

export function getNationalityFlag(nationality: string) {
  return NATIONALITIES.find((n) => n.name.toLowerCase() === nationality.toLowerCase())?.flag ?? "🌍"
}

export function getNationalityCode(nationality: string) {
  return NATIONALITIES.find((n) => n.name.toLowerCase() === nationality.toLowerCase())?.code ?? "INT"
}

export function getDicebearAvatar(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

export const DOCTOR_SPECIALTIES = [
  "Implantologie",
  "Esthétique dentaire",
  "Orthodontie",
  "Endodontie",
  "Chirurgie orale",
  "Parodontologie",
  "Pédodontie",
  "Prothèse dentaire",
] as const

export const TREATMENT_CATEGORIES = [
  "Endodontie",
  "Implantologie",
  "Esthétique",
  "Prothèse",
  "Orthodontie",
  "Chirurgie",
  "Parodontologie",
  "Pédodontie",
] as const

export const DOCTOR_PROFILE_EMOJIS = [
  "👨‍⚕️", "👩‍⚕️", "🧑‍⚕️", "🦷", "😊", "🤓", "😎", "🧔",
  "👨", "👩", "🧑", "💙", "✨", "🌟", "💎", "🩺",
] as const

export const DEFAULT_DOCTOR_EMOJI = "👨‍⚕️"
