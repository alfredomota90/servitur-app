import type { Invoice } from '@/features/invoices/api'

export interface InvoiceFormFields {
  status: 'pendiente' | 'pagado'
  from: string
  to: string
  date: string
  serie_folio: string
  rfc_receptor: string
  receptor_name: string
  invoice_description: string
  total_mxn: string
  certification_date: string
  xml_path: string
}

export interface InvoiceFormData {
  id: string
  clientId: string
  clientName: string
  period: string
  total: number
  status: 'pendiente' | 'pagado'
  createdAt: string
  tripDate: string
  fromLocation: string
  toLocation: string
  serieFolio: string
  rfcReceptor: string
  receptorName: string
  invoiceDescription: string
  totalMxn: number | undefined
  certificationDate: string
  xmlPath: string
  notes?: string
}

export function buildInvoiceData(
  formData: InvoiceFormFields,
  clientId: string,
  clientName: string,
  editingInvoice?: Invoice | null,
  xmlPath?: string,
): InvoiceFormData {
  return {
    id: editingInvoice?.id || Date.now().toString(),
    clientId,
    clientName,
    period: formData.invoice_description?.split('\n')[0] || 'Viaje',
    total: formData.total_mxn ? parseFloat(formData.total_mxn) : 0,
    status: formData.status || 'pendiente',
    createdAt: editingInvoice?.createdAt || new Date().toISOString(),
    tripDate:
      formData.certification_date?.split('T')[0] ||
      formData.date ||
      new Date().toISOString().split('T')[0],
    fromLocation: formData.from || '',
    toLocation: formData.to || '',
    notes: formData.invoice_description || '',
    serieFolio: formData.serie_folio,
    rfcReceptor: formData.rfc_receptor,
    receptorName: formData.receptor_name,
    invoiceDescription: formData.invoice_description,
    totalMxn: formData.total_mxn ? parseFloat(formData.total_mxn) : undefined,
    certificationDate: formData.certification_date,
    xmlPath: xmlPath || formData.xml_path,
  }
}

export type SortKey = 'date' | 'description' | 'total' | 'status' | 'serieFolio' | 'clientName'
export type SortDir = 'asc' | 'desc'

export function sortInvoices(invoices: Invoice[], sortKey: SortKey, sortDir: SortDir): Invoice[] {
  return [...invoices].sort((a, b) => {
    let aVal: string | number = ''
    let bVal: string | number = ''

    switch (sortKey) {
      case 'date':
        aVal = a.tripDate || a.certificationDate || a.createdAt || ''
        bVal = b.tripDate || b.certificationDate || b.createdAt || ''
        break
      case 'description':
        aVal = a.invoiceDescription || a.period || ''
        bVal = b.invoiceDescription || b.period || ''
        break
      case 'total':
        aVal = a.totalMxn || a.total || 0
        bVal = b.totalMxn || b.total || 0
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      case 'serieFolio':
        aVal = a.serieFolio || ''
        bVal = b.serieFolio || ''
        break
      case 'clientName':
        aVal = a.clientName || ''
        bVal = b.clientName || ''
        break
    }

    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })
}

export function getInvoiceDate(invoice: Invoice): string {
  return (
    invoice.tripDate ||
    invoice.certificationDate?.split('T')[0] ||
    invoice.createdAt?.split('T')[0] ||
    ''
  )
}
