import type { RappelDesign } from "@/lib/types"

export const RAPPEL_DESIGNS: { key: RappelDesign; label: string; card: string; swatch: string; accent: string }[] = [
  {
    key: "rose",
    label: "Rose",
    card: "bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-50",
    swatch: "bg-rose-400",
    accent: "text-rose-600 dark:text-rose-300",
  },
  {
    key: "amber",
    label: "Ambre",
    card: "bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-50",
    swatch: "bg-amber-400",
    accent: "text-amber-600 dark:text-amber-300",
  },
  {
    key: "emerald",
    label: "Émeraude",
    card: "bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-50",
    swatch: "bg-emerald-400",
    accent: "text-emerald-600 dark:text-emerald-300",
  },
  {
    key: "sky",
    label: "Ciel",
    card: "bg-sky-50 border-sky-200 text-sky-950 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-50",
    swatch: "bg-sky-400",
    accent: "text-sky-600 dark:text-sky-300",
  },
  {
    key: "violet",
    label: "Violet",
    card: "bg-violet-50 border-violet-200 text-violet-950 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-50",
    swatch: "bg-violet-400",
    accent: "text-violet-600 dark:text-violet-300",
  },
  {
    key: "slate",
    label: "Ardoise",
    card: "bg-slate-50 border-slate-200 text-slate-950 dark:bg-slate-900/40 dark:border-slate-700 dark:text-slate-50",
    swatch: "bg-slate-400",
    accent: "text-slate-600 dark:text-slate-300",
  },
]

export function getRappelDesign(key: RappelDesign) {
  return RAPPEL_DESIGNS.find((d) => d.key === key) ?? RAPPEL_DESIGNS[0]
}
