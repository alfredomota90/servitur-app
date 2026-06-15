import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { setupPDFHeader } from '@/lib/pdf-utils'
import { sortInvoices, getInvoiceDate } from '@/lib/invoice-utils'
import type { Invoice } from '@/features/invoices/api'
import type { Payment } from '@/features/payments/api'

export async function generatePendingReport(
  pendingInvoices: Invoice[],
  clientName: string,
  totalPending: number,
) {
  if (pendingInvoices.length === 0) return

  const doc = new jsPDF()
  const startY = await setupPDFHeader(doc, 'FACTURAS PENDIENTES DE PAGO', clientName)

  autoTable(doc, {
    startY,
    head: [['Fecha', 'Serie/Folio', 'Descripción', 'Monto']],
    body: sortInvoices(pendingInvoices, 'date', 'asc').map((inv) => [
      getInvoiceDate(inv),
      inv.serieFolio || '-',
      inv.invoiceDescription || inv.period || '-',
      `$${(inv.totalMxn || inv.total).toLocaleString()}`,
    ]),
    foot: [['', '', 'TOTAL:', `$${totalPending.toLocaleString()}`]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [13, 28, 47], textColor: 255 },
    footStyles: {
      fillColor: [240, 240, 240],
      fontStyle: 'bold',
      textColor: [0, 0, 0],
    },
    columnStyles: { 3: { halign: 'right' } },
  })

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(
    'Nota: Este documento lista las facturas pendientes de pago a la fecha de generacion de este archivo.',
    14,
    finalY,
  )
  doc.text('Gracias por su preferencia.', 14, finalY + 5)

  const fileName = `EdoCta_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export async function generatePendingComplementsReport(
  paidInvoices: Invoice[],
  clientName: string,
  totalPaid: number,
) {
  if (paidInvoices.length === 0) return

  const doc = new jsPDF()
  const startY = await setupPDFHeader(
    doc,
    'COMPLEMENTOS DE PAGO PENDIENTES DE REALIZAR',
    clientName,
  )

  const sortedPaid = [...paidInvoices].sort((a, b) => {
    const dateA = a.paymentDate || a.createdAt || ''
    const dateB = b.paymentDate || b.createdAt || ''
    return dateA.localeCompare(dateB)
  })

  autoTable(doc, {
    startY,
    head: [['Serie/Folio', 'Fecha pago', 'Descripción', 'Monto']],
    body: sortedPaid.map((inv) => [
      inv.serieFolio || '-',
      inv.paymentDate || '-',
      inv.invoiceDescription || inv.period || '-',
      `$${(inv.totalMxn || inv.total).toLocaleString()}`,
    ]),
    foot: [['', '', 'TOTAL:', `$${totalPaid.toLocaleString()}`]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [13, 28, 47], textColor: 255 },
    footStyles: {
      fillColor: [240, 240, 240],
      fontStyle: 'bold',
      textColor: [0, 0, 0],
    },
    columnStyles: { 3: { halign: 'right' } },
  })

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(
    'Nota: Este documento lista las facturas pagadas pendientes de complemento de pago a la fecha de generación de este archivo.',
    14,
    finalY,
  )
  const fileName = `ComplementosPendientes_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export async function generatePaymentHistoryReport(
  payments: Payment[],
  invoices: Invoice[],
  clientName: string,
) {
  if (payments.length === 0) return

  const doc = new jsPDF()
  const startY = await setupPDFHeader(doc, 'HISTORIAL DE PAGOS', clientName)

  const paymentsWithInvoices = payments
    .map((p) => ({
      ...p,
      affectedInvoices: invoices.filter((inv) => inv.paymentId === p.id),
    }))
    .filter((p) => p.affectedInvoices.length > 0)
    .sort((a, b) => {
      const dateA = a.affectedInvoices[0]?.paymentDate || a.createdAt || ''
      const dateB = b.affectedInvoices[0]?.paymentDate || b.createdAt || ''
      return dateB.localeCompare(dateA)
    })

  const total = paymentsWithInvoices.reduce((s, p) => s + p.amount, 0)

  autoTable(doc, {
    startY,
    head: [['Fecha', 'Método', 'Referencia', 'Folios afectados', 'Monto']],
    body: paymentsWithInvoices.map((p) => [
      p.affectedInvoices[0]?.paymentDate || p.createdAt || '-',
      p.method === 'transferencia'
        ? 'Transferencia'
        : p.method === 'efectivo'
          ? 'Efectivo'
          : p.method === 'cheque'
            ? 'Cheque'
            : p.method || '-',
      p.reference || '—',
      p.affectedInvoices
        .map((i) => i.serieFolio)
        .filter(Boolean)
        .join(', ') || '—',
      `$${p.amount.toLocaleString()}`,
    ]),
    foot: [['', '', '', 'TOTAL:', `$${total.toLocaleString()}`]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [13, 28, 47], textColor: 255 },
    footStyles: {
      fillColor: [240, 240, 240],
      fontStyle: 'bold',
      textColor: [0, 0, 0],
    },
    columnStyles: { 4: { halign: 'right' } },
  })

  const fileName = `HistorialPagos_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
