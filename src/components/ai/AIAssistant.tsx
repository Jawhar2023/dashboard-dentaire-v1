import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, X, Send, Calendar, Wallet, Plane, FileText,
  Users, HelpCircle, RotateCcw, Stethoscope,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslation } from "react-i18next"
import { useAIQuery } from "@/hooks/useData"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Msg = { role: "user" | "assistant"; content: string }

type Suggestion = {
  id: string
  label: string
  prompt: string
  icon: LucideIcon
  group: string
}

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([])
  const { t, i18n } = useTranslation()
  const aiQuery = useAIQuery()
  const isFr = i18n.language?.startsWith("fr")

  const suggestions: Suggestion[] = useMemo(
    () => [
      {
        id: "arrivals",
        group: isFr ? "Aujourd'hui" : "Today",
        label: isFr ? "Qui arrive aujourd'hui ?" : "Who arrives today?",
        prompt: isFr ? "Qui arrive aujourd'hui ?" : "Who arrives today?",
        icon: Plane,
      },
      {
        id: "appts",
        group: isFr ? "Aujourd'hui" : "Today",
        label: isFr ? "Rendez-vous du jour" : "Today's appointments",
        prompt: isFr ? "Quels sont les rendez-vous d'aujourd'hui ?" : "What are today's appointments?",
        icon: Calendar,
      },
      {
        id: "waiting",
        group: isFr ? "Aujourd'hui" : "Today",
        label: isFr ? "Patients en attente" : "Patients waiting",
        prompt: isFr ? "Qui est en salle d'attente ?" : "Who is waiting in the clinic?",
        icon: Users,
      },
      {
        id: "unpaid",
        group: isFr ? "Paiements" : "Payments",
        label: isFr ? "Qui n'a pas payé ?" : "Who hasn't paid?",
        prompt: isFr ? "Qui n'a pas payé ?" : "Who hasn't paid?",
        icon: Wallet,
      },
      {
        id: "revenue",
        group: isFr ? "Paiements" : "Payments",
        label: isFr ? "Recettes du mois" : "This month's revenue",
        prompt: isFr ? "Combien avons-nous encaissé ce mois ?" : "How much revenue this month?",
        icon: Wallet,
      },
      {
        id: "reste",
        group: isFr ? "Paiements" : "Payments",
        label: isFr ? "Reste à payer total" : "Total remaining balance",
        prompt: isFr ? "Quel est le reste à payer total ?" : "What is the total remaining balance?",
        icon: Wallet,
      },
      {
        id: "invoice",
        group: isFr ? "Factures" : "Invoices",
        label: isFr ? "Comment faire une facture ?" : "How do I create an invoice?",
        prompt: isFr ? "Comment générer une facture ?" : "How do I generate an invoice?",
        icon: FileText,
      },
      {
        id: "factures",
        group: isFr ? "Factures" : "Invoices",
        label: isFr ? "Factures non payées" : "Unpaid invoices",
        prompt: isFr ? "Quelles factures ne sont pas payées ?" : "Which invoices are unpaid?",
        icon: FileText,
      },
      {
        id: "treatments",
        group: isFr ? "Cabinet" : "Clinic",
        label: isFr ? "Catalogue traitements" : "Treatment catalog",
        prompt: isFr ? "Quels traitements proposons-nous ?" : "What treatments do we offer?",
        icon: Stethoscope,
      },
      {
        id: "help",
        group: isFr ? "Aide" : "Help",
        label: isFr ? "Que peux-tu faire ?" : "What can you do?",
        prompt: isFr ? "Que peux-tu faire ?" : "What can you do?",
        icon: HelpCircle,
      },
      {
        id: "sms",
        group: isFr ? "Aide" : "Help",
        label: isFr ? "Modèle SMS rappel" : "Reminder SMS template",
        prompt: isFr ? "Donne-moi un modèle de SMS de rappel" : "Give me a reminder SMS template",
        icon: Calendar,
      },
      {
        id: "translateFr",
        group: isFr ? "Aide" : "Help",
        label: isFr ? "Message confirmation (FR)" : "Confirmation message (FR)",
        prompt: isFr ? "Traduire un message de confirmation en français" : "Translate confirmation message to French",
        icon: Sparkles,
      },
    ],
    [isFr]
  )

  const grouped = useMemo(() => {
    const map = new Map<string, Suggestion[]>()
    for (const s of suggestions) {
      const list = map.get(s.group) ?? []
      list.push(s)
      map.set(s.group, list)
    }
    return [...map.entries()]
  }, [suggestions])

  const handleSend = async (text?: string) => {
    const prompt = (text ?? input).trim()
    if (!prompt) return
    setMessages((m) => [...m, { role: "user", content: prompt }])
    setInput("")
    try {
      const response = await aiQuery.mutateAsync(prompt)
      setMessages((m) => [...m, { role: "assistant", content: response }])
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: isFr
            ? "Désolé, une erreur est survenue. Réessayez ou choisissez une suggestion."
            : "Sorry, something went wrong. Try again or pick a suggestion.",
        },
      ])
    }
  }

  const resetChat = () => {
    setMessages([])
    setInput("")
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-card-hover",
          open && "hidden"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t("ai.title")}
      >
        <Sparkles className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex w-[400px] max-w-[calc(100vw-2rem)] max-h-[min(640px,calc(100vh-3rem))] flex-col rounded-[18px] border border-border/50 bg-card shadow-card-hover overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b bg-primary/5 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{t("ai.title")}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {isFr ? "Questions intelligentes · données du cabinet" : "Smart questions · clinic data"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {messages.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={resetChat} title={isFr ? "Nouveau chat" : "New chat"}>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 h-[380px]">
              <div className="p-4 space-y-4">
                {messages.length === 0 ? (
                  <>
                    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] to-transparent p-4 space-y-2">
                      <p className="text-sm font-medium">
                        {isFr ? "Bonjour — comment puis-je vous aider ?" : "Hi — how can I help?"}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isFr
                          ? "Je lis les données du dashboard : rendez-vous, paiements, factures, traitements. Cliquez une question ou écrivez la vôtre."
                          : "I use your dashboard data: appointments, payments, invoices, treatments. Click a question or type your own."}
                      </p>
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {(isFr
                          ? ["Arrivées", "Impayés", "RDV", "Factures", "Aide"]
                          : ["Arrivals", "Unpaid", "Appts", "Invoices", "Help"]
                        ).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-wide rounded-md bg-background/80 border border-border/60 px-2 py-0.5 text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {grouped.map(([group, items]) => (
                      <div key={group} className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-0.5">
                          {group}
                        </p>
                        <div className="space-y-1.5">
                          {items.map((s) => {
                            const Icon = s.icon
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => void handleSend(s.prompt)}
                                disabled={aiQuery.isPending}
                                className="w-full text-left rounded-xl border border-border/50 px-3 py-2.5 text-sm hover:bg-accent hover:border-primary/30 transition-colors flex items-start gap-2.5"
                              >
                                <span className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Icon className="h-3.5 w-3.5 text-primary" />
                                </span>
                                <span className="leading-snug pt-1">{s.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-xl px-3 py-2.5 text-sm max-w-[92%] whitespace-pre-wrap leading-relaxed",
                          m.role === "user"
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {m.content}
                      </div>
                    ))}
                    {aiQuery.isPending && (
                      <div className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground animate-pulse">
                        {isFr ? "Analyse en cours…" : "Thinking…"}
                      </div>
                    )}

                    {!aiQuery.isPending && (
                      <div className="pt-2 space-y-2 border-t border-border/40">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                          {isFr ? "Continuer avec" : "Ask next"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestions.slice(0, 6).map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => void handleSend(s.prompt)}
                              className="text-xs rounded-full border border-border/60 px-2.5 py-1 hover:bg-accent hover:border-primary/40 transition-colors"
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 p-4 border-t shrink-0 bg-card">
              <Input
                placeholder={
                  isFr
                    ? "Ex: Qui n'a pas payé ? RDV du jour…"
                    : "e.g. Who hasn't paid? Today's appts…"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSend()
                }}
                className="rounded-xl"
              />
              <Button
                size="icon"
                className="rounded-xl shrink-0"
                onClick={() => void handleSend()}
                disabled={aiQuery.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
