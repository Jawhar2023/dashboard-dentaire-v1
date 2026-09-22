import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Search, FileText, Users } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/PageHeader"
import { PageTransition } from "@/components/shared/PageTransition"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PatientAvatar } from "@/components/shared/PatientAvatar"
import { usePatients } from "@/hooks/useData"
import { getNationalityCode } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Patient } from "@/lib/types"

export default function TreatmentGlobalePage() {
  const { t } = useTranslation()
  const { data: patientList = [], isLoading } = usePatients()
  const [search, setSearch] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [treatmentText, setTreatmentText] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const filtered = patientList.filter((p) => {
    const q = search.toLowerCase()
    return (
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.passport?.toLowerCase().includes(q)
    )
  })

  const handleSave = async () => {
    if (!selectedPatient || !treatmentText.trim() || isSaving) return
    
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem(`treatment_${selectedPatient.id}`, treatmentText)
      
      // Also save metadata for tracking
      const metadata = {
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        lastUpdated: new Date().toISOString(),
        text: treatmentText
      }
      
      // Get all saved treatments
      const allTreatmentsKey = 'all_treatments'
      const allTreatments = JSON.parse(localStorage.getItem(allTreatmentsKey) || '{}')
      allTreatments[selectedPatient.id] = metadata
      localStorage.setItem(allTreatmentsKey, JSON.stringify(allTreatments))
      
      console.log("Treatment saved to localStorage:", metadata)
      
      toast.success(`Treatment saved for ${selectedPatient.firstName} ${selectedPatient.lastName}`, {
        description: "Global treatment notes have been saved successfully"
      })
      
      // Simulate delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      toast.error("Failed to save treatment", {
        description: "Please try again later"
      })
      console.error("Error saving treatment:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Enter to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Enter is pressed in the textarea
      if (e.key === "Enter" && (e.target as HTMLElement).id === "treatment-text") {
        // Allow Shift+Enter for new lines
        if (e.shiftKey) return
        
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedPatient, treatmentText, isSaving])

  // Load treatment from localStorage when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      const saved = localStorage.getItem(`treatment_${selectedPatient.id}`)
      if (saved) {
        setTreatmentText(saved)
      }
    }
  }, [selectedPatient])

  return (
    <PageTransition>
      <PageHeader
        title="Treatment Globale"
        description="Manage global treatment records for patients"
        action={
          <Button 
            className="rounded-xl gap-2" 
            onClick={handleSave}
            disabled={!selectedPatient || !treatmentText.trim() || isSaving}
          >
            <FileText className="h-4 w-4" /> 
            {isSaving ? "Saving..." : "Save Treatment"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Patient Selection */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Select Patient</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              className="pl-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No patients found</p>
              </div>
            ) : (
              filtered.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    setSelectedPatient(patient)
                    // Treatment will be loaded automatically by useEffect
                  }}
                  className={cn(
                    "w-full p-4 rounded-xl border transition-all duration-200 hover:shadow-md text-left",
                    selectedPatient?.id === patient.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <PatientAvatar
                      name={`${patient.firstName} ${patient.lastName}`}
                      avatar={patient.avatar}
                      countryCode={getNationalityCode(patient.nationality)}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                      <p className="text-xs text-muted-foreground">{patient.nationality}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Right Column - Treatment Text */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Global Treatment</h2>
          
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-3 mb-2">
                  <PatientAvatar
                    name={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                    avatar={selectedPatient.avatar}
                    countryCode={getNationalityCode(selectedPatient.nationality)}
                    size="md"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="treatment-text" className="block text-sm font-medium mb-2">
                  Treatment Notes
                </label>
                <Textarea
                  id="treatment-text"
                  placeholder="Write detailed treatment notes here... (Press Enter to save, Shift+Enter for new line)"
                  className="min-h-[450px] rounded-xl resize-none"
                  value={treatmentText}
                  onChange={(e) => setTreatmentText(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Select a patient to view or add treatment notes</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageTransition>
  )
}
