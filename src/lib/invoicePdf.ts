import { format, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import jsPDF from "jspdf"
import type { ClinicLogo, ClinicSettings, Invoice, Payment, PaymentStatus } from "@/lib/types"

const BLUE: [number, number, number] = [30, 64, 150]
const BLUE_DARK: [number, number, number] = [23, 48, 110]
const BLUE_LIGHT: [number, number, number] = [232, 240, 254]
const GRAY: [number, number, number] = [100, 116, 139]
const GREEN: [number, number, number] = [5, 122, 85]
const AMBER: [number, number, number] = [180, 83, 9]
const YELLOW_BG: [number, number, number] = [254, 243, 199]
const YELLOW_TEXT: [number, number, number] = [146, 64, 14]
const ROW_PAY: [number, number, number] = [240, 253, 244]

export interface InvoicePdfOptions {
  invoice: Invoice
  patientName: string
  doctorName?: string
  settings: Pick<ClinicSettings, "clinicName" | "phone" | "address">
  logo?: ClinicLogo | null
  email?: string
  mode?: "download" | "print" | "blob"
  payments?: Payment[]
}

function statusLabel(status: PaymentStatus): string {
  if (status === "paid") return "Paye"
  if (status === "partial") return "Partiel"
  if (status === "refunded") return "Rembourse"
  return "Non paye"
}

function paymentMethodLabel(method: Payment["method"]): string {
  if (method === "cash") return "Especes"
  if (method === "card") return "Carte"
  if (method === "transfer") return "Virement"
  return "PayPal"
}

/** ASCII-safe money for jsPDF Helvetica (avoids broken "/" from Unicode thin spaces). */
function formatTnd(amount: number) {
  const n = Math.round(Math.abs(amount))
  const grouped = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  const sign = amount < 0 ? "-" : ""
  return `${sign}${grouped} TND`
}

function resolveAssetUrl(src: string) {
  if (!src || src.startsWith("data:") || src.startsWith("blob:") || /^https?:/i.test(src)) {
    return src
  }
  if (src.startsWith("/")) {
    if (typeof window !== "undefined" && window.location.protocol === "file:") {
      return new URL(`.${src}`, window.location.href).href
    }
    return `${window.location.origin}${src}`
  }
  return src
}

function calcTotals(invoice: Invoice, payments: Payment[]) {
  const items =
    invoice.items.length > 0 ? invoice.items : [{ name: "Soins dentaires", amount: invoice.treatmentCost }]
  const totalPrice = items.reduce((s, i) => s + i.amount, 0) || invoice.treatmentCost
  const paidRaw = payments
    .filter((p) => p.status !== "refunded")
    .reduce((s, p) => s + p.amount, 0)
  const paid = Math.max(0, paidRaw)
  const remaining = Math.max(0, totalPrice - paid)
  const status: PaymentStatus =
    paid <= 0 ? "unpaid" : paid >= totalPrice ? "paid" : "partial"
  return { items, totalPrice, paid, remaining, status }
}

async function loadImageForPdf(
  src: string
): Promise<{ data: string; format: "PNG" | "JPEG"; width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        const isJpeg =
          src.includes("image/jpeg") ||
          src.includes("image/jpg") ||
          src.toLowerCase().endsWith(".jpg") ||
          src.toLowerCase().endsWith(".jpeg")
        const mime = isJpeg ? "image/jpeg" : "image/png"
        resolve({
          data: canvas.toDataURL(mime),
          format: isJpeg ? "JPEG" : "PNG",
          width: canvas.width,
          height: canvas.height,
        })
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = resolveAssetUrl(src)
  })
}

export async function generateInvoicePdf(options: InvoicePdfOptions): Promise<Blob | undefined> {
  const { invoice, patientName, doctorName, settings, logo, email, payments: invoicePayments = [] } = options
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentW = pageW - margin * 2

  const { items, totalPrice, paid, remaining, status } = calcTotals(invoice, invoicePayments)
  const statut = statusLabel(status)
  const issueDate = new Date(invoice.createdAt)
  const dueDate = addDays(issueDate, 30)
  const ref = `FAC-${format(issueDate, "yyyy-MM")}-${invoice.id.toUpperCase()}`
  const monthTitle = format(issueDate, "MMMM yyyy", { locale: fr }).toUpperCase()

  const activePayments = [...invoicePayments]
    .filter((p) => p.status !== "refunded")
    .sort((a, b) => a.date.localeCompare(b.date))

  // Top accent bar
  doc.setFillColor(...BLUE_DARK)
  doc.rect(0, 0, pageW, 3.5, "F")

  let headerBottom = 16

  if (logo?.imageUrl) {
    const image = await loadImageForPdf(logo.imageUrl)
    if (image) {
      const maxH = 24
      const aspect = image.width / Math.max(1, image.height)
      let w = 28
      let h = w / aspect
      if (h > maxH) {
        h = maxH
        w = h * aspect
      }
      doc.addImage(image.data, image.format, margin, 10, w, h)
      headerBottom = Math.max(headerBottom, 10 + h)
    }
  }

  const infoX = margin + 34
  doc.setTextColor(...BLUE)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  const clinicLines = doc.splitTextToSize(
    (settings.clinicName || "Cabinet dentaire").toUpperCase(),
    78
  )
  doc.text(clinicLines, infoX, 14)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  let infoY = 14 + clinicLines.length * 4.2 + 1
  const contactLines = [
    settings.phone,
    email,
    logo?.website,
    settings.address,
  ].filter(Boolean) as string[]
  contactLines.forEach((line) => {
    doc.setTextColor(...(line === settings.address ? GRAY : BLUE))
    const wrapped = doc.splitTextToSize(line, 78)
    doc.text(wrapped, infoX, infoY)
    infoY += wrapped.length * 3.8
  })
  headerBottom = Math.max(headerBottom, infoY)

  // Meta block (right)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(...BLUE)
  doc.text(ref, pageW - margin, 14, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(`Emission : ${format(issueDate, "dd/MM/yyyy")}`, pageW - margin, 20, { align: "right" })
  doc.text(`Echeance : ${format(dueDate, "dd/MM/yyyy")}`, pageW - margin, 25, { align: "right" })

  const badgeW = Math.max(20, doc.getTextWidth(statut) + 10)
  const badgeX = pageW - margin - badgeW
  doc.setFillColor(...YELLOW_BG)
  doc.roundedRect(badgeX, 28, badgeW, 7, 1.5, 1.5, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...YELLOW_TEXT)
  doc.text(statut, badgeX + badgeW / 2, 32.8, { align: "center" })
  headerBottom = Math.max(headerBottom, 38)

  // Divider under header
  let y = headerBottom + 6
  doc.setDrawColor(220, 226, 236)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageW - margin, y)
  y += 12

  // Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(17)
  doc.setTextColor(...BLUE)
  doc.text(`FACTURE - ${monthTitle}`, pageW / 2, y, { align: "center" })
  y += 8

  doc.setFontSize(11)
  doc.setTextColor(25, 25, 25)
  doc.text(patientName.toUpperCase(), pageW / 2, y, { align: "center" })
  y += 5
  if (doctorName) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...GRAY)
    doc.text(doctorName, pageW / 2, y, { align: "center" })
    y += 5
  }
  y += 6

  const cols = {
    date: margin,
    patient: margin + 26,
    nature: margin + 62,
    unit: pageW - margin - 48,
    total: pageW - margin,
  }
  const rowH = 8.5

  const drawTableHeader = () => {
    doc.setFillColor(...BLUE_DARK)
    doc.roundedRect(margin, y, contentW, rowH, 1, 1, "F")
    // square bottom of header for seamless rows
    doc.rect(margin, y + rowH - 2, contentW, 2, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(255, 255, 255)
    const hy = y + 5.6
    doc.text("Date", cols.date + 2.5, hy)
    doc.text("Patient", cols.patient, hy)
    doc.text("Nature de travail", cols.nature, hy)
    doc.text("Prix unit.", cols.unit, hy, { align: "right" })
    doc.text("Total", cols.total - 2.5, hy, { align: "right" })
    y += rowH
  }

  drawTableHeader()

  // Very light watermark
  doc.setFont("helvetica", "bold")
  doc.setFontSize(42)
  doc.setTextColor(232, 238, 248)
  const watermark = (logo?.name || "CLINIQUE").toUpperCase().slice(0, 18)
  doc.text(watermark, pageW / 2, y + 55, { align: "center", angle: 28 })

  type TableRow = {
    date: Date
    patient: string
    nature: string
    unit: number | null
    total: number
    kind: "item" | "payment"
  }

  const rows: TableRow[] = [
    ...items.map((item) => ({
      date: issueDate,
      patient: patientName,
      nature: item.name,
      unit: item.amount,
      total: item.amount,
      kind: "item" as const,
    })),
    ...activePayments.map((pay) => ({
      date: new Date(pay.date),
      patient: patientName,
      nature: `Paiement - ${paymentMethodLabel(pay.method)}`,
      unit: null as number | null,
      total: pay.amount,
      kind: "payment" as const,
    })),
  ]

  const ensureSpace = (need: number) => {
    if (y + need > pageH - 28) {
      doc.addPage()
      doc.setFillColor(...BLUE_DARK)
      doc.rect(0, 0, pageW, 3.5, "F")
      y = 16
      drawTableHeader()
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
    }
  }

  rows.forEach((row, index) => {
    ensureSpace(rowH + 2)
    if (row.kind === "payment") {
      doc.setFillColor(...ROW_PAY)
      doc.rect(margin, y, contentW, rowH, "F")
    } else if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, y, contentW, rowH, "F")
    }

    doc.setDrawColor(230, 234, 240)
    doc.setLineWidth(0.15)
    doc.line(margin, y + rowH, pageW - margin, y + rowH)

    const textY = y + 5.6
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(40, 40, 40)
    doc.text(format(row.date, "dd/MM/yyyy"), cols.date + 2.5, textY)
    doc.text(row.patient, cols.patient, textY, { maxWidth: 34 })
    doc.text(row.nature, cols.nature, textY, { maxWidth: 58 })

    if (row.kind === "payment") {
      doc.setTextColor(...GREEN)
      doc.setFont("helvetica", "bold")
      doc.text("-", cols.unit, textY, { align: "right" })
      doc.text(formatTnd(row.total), cols.total - 2.5, textY, { align: "right" })
    } else {
      doc.setFont("helvetica", "normal")
      doc.setTextColor(40, 40, 40)
      doc.text(formatTnd(row.unit ?? 0), cols.unit, textY, { align: "right" })
      doc.setFont("helvetica", "bold")
      doc.text(formatTnd(row.total), cols.total - 2.5, textY, { align: "right" })
    }
    y += rowH
  })

  // Table bottom border
  doc.setDrawColor(...BLUE_DARK)
  doc.setLineWidth(0.6)
  doc.line(margin, y, pageW - margin, y)
  y += 10

  // Totals box — calculated amounts
  ensureSpace(42)
  const boxW = 72
  const boxH = 36
  const boxX = pageW - margin - boxW
  const boxY = y

  doc.setFillColor(...BLUE_LIGHT)
  doc.setDrawColor(...BLUE)
  doc.setLineWidth(0.5)
  doc.roundedRect(boxX, boxY, boxW, boxH, 2.5, 2.5, "FD")

  const line = (label: string, value: string, ly: number, valueColor: [number, number, number], bold = false) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...GRAY)
    doc.text(label, boxX + 5, ly)
    doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.setTextColor(...valueColor)
    doc.text(value, boxX + boxW - 5, ly, { align: "right" })
  }

  line("Total soins", formatTnd(totalPrice), boxY + 9, [20, 20, 20], true)
  line("Paye", formatTnd(paid), boxY + 18, GREEN, true)
  // separator
  doc.setDrawColor(180, 200, 230)
  doc.setLineWidth(0.3)
  doc.line(boxX + 4, boxY + 22, boxX + boxW - 4, boxY + 22)
  line("Reste a payer", formatTnd(remaining), boxY + 30, remaining > 0 ? AMBER : GREEN, true)

  // Left note under table
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(
    `${items.length} soin(s)  |  ${activePayments.length} paiement(s)`,
    margin,
    boxY + 8
  )
  doc.text(`Statut : ${statut}`, margin, boxY + 14)

  // Footer
  doc.setDrawColor(220, 226, 236)
  doc.setLineWidth(0.3)
  doc.line(margin, pageH - 18, pageW - margin, pageH - 18)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(150, 150, 150)
  doc.text("Merci pour votre confiance.", pageW / 2, pageH - 12, { align: "center" })
  doc.setFontSize(7)
  doc.text(ref, pageW - margin, pageH - 12, { align: "right" })

  const filename = `FAC-${format(issueDate, "yyyy-MM")}-${invoice.id}.pdf`
  if (options.mode === "print") {
    const blobUrl = doc.output("bloburl")
    window.open(blobUrl, "_blank", "noopener,noreferrer")
  } else if (options.mode === "blob") {
    return doc.output("blob")
  } else {
    doc.save(filename)
  }
  return undefined
}
