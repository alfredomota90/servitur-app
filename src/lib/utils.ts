export function formatCurrency(value: number): string {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

const MONTHS_ES: Record<string, number> = {
  ENERO: 0,
  FEBRERO: 1,
  MARZO: 2,
  ABRIL: 3,
  MAYO: 4,
  JUNIO: 5,
  JULIO: 6,
  AGOSTO: 7,
  SEPTIEMBRE: 8,
  OCTUBRE: 9,
  NOVIEMBRE: 10,
  DICIEMBRE: 11,
}

function parseDatesFromText(text: string): Date[] {
  const dates: Date[] = []
  const regex = /(\d{1,2})\s+DE\s+([A-ZÁÉÍÓÚ]+)\s+DE\s+(\d{4})/gi
  let match
  while ((match = regex.exec(text)) !== null) {
    const day = parseInt(match[1])
    const month = MONTHS_ES[match[2].toUpperCase()]
    const year = parseInt(match[3])
    if (month !== undefined && day >= 1 && day <= 31) {
      dates.push(new Date(year, month, day))
    }
  }
  return dates
}

export function getNextBillingDate(
  invoices: { tripDate?: string; invoiceDescription?: string; notes?: string }[],
  interval: number = 10,
): Date | null {
  const allDates: Date[] = []
  for (const inv of invoices) {
    if (inv.tripDate) {
      allDates.push(new Date(inv.tripDate))
    }
    if (inv.invoiceDescription) {
      allDates.push(...parseDatesFromText(inv.invoiceDescription))
    }
    if (inv.notes) {
      allDates.push(...parseDatesFromText(inv.notes))
    }
  }
  if (allDates.length === 0) return null
  const lastDate = allDates.sort((a, b) => b.getTime() - a.getTime())[0]
  const date = new Date(lastDate)
  date.setDate(date.getDate() + interval)
  return date
}

export function getDaysUntil(target: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const t = new Date(target)
  t.setHours(0, 0, 0, 0)
  return Math.ceil((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatDate(date: Date): string {
  return dateFormatter.format(date)
}

export function fmtDate(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return formatDate(d)
}
