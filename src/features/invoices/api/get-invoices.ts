import { z } from 'zod'
import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type InvoiceRow = Database['public']['Tables']['invoices']['Row']

const invoiceStatusSchema = z.enum(['pendiente', 'pagado'])
const paymentMethodSchema = z.enum(['transferencia', 'efectivo', 'cheque']).optional()
const frequencySchema = z.enum(['periodic', 'sporadic']).optional()

export const invoiceSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  period: z.string(),
  total: z.number(),
  status: invoiceStatusSchema,
  createdAt: z.string(),
  paymentDate: z.string().optional(),
  paymentMethod: paymentMethodSchema,
  paymentReference: z.string().optional(),
  paymentAttachmentPath: z.string().optional(),
  updated_at: z.string().optional(),
  tripDate: z.string().optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  frequency: frequencySchema,
  notes: z.string().optional(),
  serieFolio: z.string().optional(),
  rfcReceptor: z.string().optional(),
  receptorName: z.string().optional(),
  invoiceDescription: z.string().optional(),
  totalMxn: z.number().optional(),
  certificationDate: z.string().optional(),
  xmlPath: z.string().optional(),
  paymentId: z.string().optional(),
})

export type Invoice = z.infer<typeof invoiceSchema>

const rowToInvoice = (row: InvoiceRow, clientName: string): Invoice => ({
  id: row.id,
  clientId: row.client_id || '',
  clientName,
  period: row.period || '',
  total: row.total || 0,
  status: row.status as 'pendiente' | 'pagado',
  createdAt: row.created_at,
  paymentDate: row.payment_date || undefined,
  paymentMethod: row.payment_method as Invoice['paymentMethod'],
  paymentReference: row.payment_reference || undefined,
  paymentAttachmentPath: row.payment_attachment_path || undefined,
  paymentId: row.payment_id || undefined,
  updated_at: row.updated_at || undefined,
  tripDate: row.trip_date || undefined,
  fromLocation: row.from_location || undefined,
  toLocation: row.to_location || undefined,
  frequency:
    row.frequency === 'periodic'
      ? 'periodic'
      : row.frequency === 'sporadic'
        ? 'sporadic'
        : undefined,
  notes: row.notes || undefined,
  serieFolio: row.serie_folio || undefined,
  rfcReceptor: row.rfc_receptor || undefined,
  receptorName: row.receptor_name || undefined,
  invoiceDescription: row.invoice_description || undefined,
  totalMxn: row.total_mxn || undefined,
  certificationDate: row.certification_date || undefined,
  xmlPath: row.xml_path || undefined,
})

export const getInvoices = async (): Promise<Invoice[]> => {
  const { data: invoicesData, error: invoicesError } = await supabase.from('invoices').select('*')
  if (invoicesError) throw invoicesError

  const { data: clientsData } = await supabase.from('clients').select('id, name')
  const clientMap = new Map((clientsData || []).map((c) => [c.id, c.name]))

  return (invoicesData || []).map((row) => rowToInvoice(row, clientMap.get(row.client_id) || ''))
}

export const getInvoicesByClientQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: ['invoices', { clientId }],
    queryFn: () => getInvoices().then((invs) => invs.filter((i) => i.clientId === clientId)),
  })

export const useInvoices = () =>
  useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  })

export const useInvoicesByClient = (clientId?: string) =>
  useQuery({
    queryKey: ['invoices', { clientId }],
    queryFn: async () => {
      const all = await getInvoices()
      return all.filter((i) => i.clientId === clientId)
    },
    enabled: !!clientId,
  })

export type CreateInvoiceInput = Omit<Invoice, 'id' | 'clientName'>

export const createInvoice = async (input: CreateInvoiceInput): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      client_id: input.clientId,
      period: input.period,
      total: input.total,
      status: input.status,
      created_at: input.createdAt,
      payment_date: input.paymentDate || null,
      payment_method: input.paymentMethod || null,
      payment_reference: input.paymentReference || null,
      payment_attachment_path: input.paymentAttachmentPath || null,
      trip_date: input.tripDate || null,
      from_location: input.fromLocation || null,
      to_location: input.toLocation || null,
      frequency: input.frequency || null,
      notes: input.notes || null,
      serie_folio: input.serieFolio || null,
      rfc_receptor: input.rfcReceptor || null,
      receptor_name: input.receptorName || null,
      invoice_description: input.invoiceDescription || null,
      total_mxn: input.totalMxn || null,
      certification_date: input.certificationDate || null,
      xml_path: input.xmlPath || null,
      payment_id: input.paymentId || null,
    })
    .select()
    .single()
  if (error) throw error
  return rowToInvoice(data, '')
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<void> => {
  const { error } = await supabase
    .from('invoices')
    .update({
      client_id: invoice.clientId,
      period: invoice.period,
      total: invoice.total,
      status: invoice.status,
      payment_date: invoice.paymentDate,
      payment_method: invoice.paymentMethod,
      payment_reference: invoice.paymentReference,
      payment_attachment_path: invoice.paymentAttachmentPath,
      updated_at: new Date().toISOString(),
      trip_date: invoice.tripDate,
      from_location: invoice.fromLocation,
      to_location: invoice.toLocation,
      frequency: invoice.frequency,
      notes: invoice.notes,
      serie_folio: invoice.serieFolio,
      rfc_receptor: invoice.rfcReceptor,
      receptor_name: invoice.receptorName,
      invoice_description: invoice.invoiceDescription,
      total_mxn: invoice.totalMxn,
      certification_date: invoice.certificationDate,
      xml_path: invoice.xmlPath,
      payment_id: invoice.paymentId,
    })
    .eq('id', id)
  if (error) throw error
}

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => updateInvoice(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export const deleteInvoice = async (id: string): Promise<void> => {
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) throw error
}

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}
