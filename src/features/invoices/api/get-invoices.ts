import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import type { Database } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/use-store'

type InvoiceRow = Database['public']['Tables']['invoices']['Row']

const invoiceStatusSchema = z.enum(['pendiente', 'pagado'])
const paymentMethodSchema = z.enum(['transferencia', 'efectivo', 'cheque']).optional()
const frequencySchema = z.enum(['periodic', 'sporadic']).optional()

export const invoiceSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  projectId: z.string().optional().nullable(),
  period: z.string().optional(),
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
  paymentId: z.string().optional().nullable(),
  cfdiUuid: z.string().optional(),
})

export type Invoice = z.infer<typeof invoiceSchema>

const rowToInvoice = (row: InvoiceRow, clientName: string): Invoice => ({
  id: row.id,
  clientId: row.client_id || '',
  clientName,
  projectId: row.project_id || null,
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
  cfdiUuid: row.cfdi_uuid || undefined,
})

const fetchClientMap = async () => {
  const { data: clientsData } = await supabase.from('clients').select('id, name')
  return new Map((clientsData || []).map((c) => [c.id, c.name]))
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const { data: invoicesData, error: invoicesError } = await supabase.from('invoices').select('*')
  if (invoicesError) throw invoicesError

  const clientMap = await fetchClientMap()

  return (invoicesData || []).map((row) => rowToInvoice(row, clientMap.get(row.client_id) || ''))
}

export const getInvoicesByProjectStatus = async (
  projectStatus: 'active' | 'inactive',
): Promise<Invoice[]> => {
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('status', projectStatus)

  const projectIds = (projects || []).map((p) => p.id)

  if (projectIds.length === 0) return []

  const { data: invoicesData, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .in('project_id', projectIds)

  if (invoicesError) throw invoicesError

  const clientMap = await fetchClientMap()

  return (invoicesData || []).map((row) => rowToInvoice(row, clientMap.get(row.client_id) || ''))
}

export const getActiveInvoices = async (): Promise<Invoice[]> => {
  const { data: activeProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('status', 'active')

  const activeProjectIds = (activeProjects || []).map((p) => p.id)

  const { data: invoicesData, error: invoicesError } = await supabase.from('invoices').select('*')

  if (invoicesError) throw invoicesError

  const clientMap = await fetchClientMap()

  return (invoicesData || [])
    .filter((row) => !row.project_id || activeProjectIds.includes(row.project_id))
    .map((row) => rowToInvoice(row, clientMap.get(row.client_id) || ''))
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

export const useActiveInvoices = () =>
  useQuery({
    queryKey: ['invoices', { projectStatus: 'active' }],
    queryFn: getActiveInvoices,
  })

export const useInvoicesByClient = (clientId?: string) =>
  useQuery({
    queryKey: ['invoices', { clientId }],
    queryFn: async () => {
      const all = await getActiveInvoices()
      return all.filter((i) => i.clientId === clientId)
    },
    enabled: !!clientId,
  })

export const useInvoicesByProject = (projectId?: string) =>
  useQuery({
    queryKey: ['invoices', { projectId }],
    queryFn: async () => {
      const all = await getInvoices()
      return all.filter((i) => i.projectId === projectId)
    },
    enabled: !!projectId,
  })

export type CreateInvoiceInput = Omit<Invoice, 'id' | 'clientName'>

export const createInvoice = async (input: CreateInvoiceInput): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      client_id: input.clientId,
      project_id: input.projectId || null,
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
      cfdi_uuid: input.cfdiUuid || null,
      payment_id: input.paymentId || null,
    })
    .select()
    .single()
  if (error) throw error
  return rowToInvoice(data, '')
}

const getDuplicateFolioMessage = (error: unknown): string | null => {
  const msg = error instanceof Error ? error.message : ''
  const code = (error as Record<string, string>)?.code
  if (code === '23505' && msg.includes('invoices_cfdi_uuid_key')) {
    return 'El folio fiscal (UUID) ya está registrado en otra factura'
  }
  return null
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error) => {
      const msg = getDuplicateFolioMessage(error)
      useStore.getState().addToast({
        type: 'error',
        message: msg || 'Error al crear la factura',
      })
    },
  })
}

const invoiceColumnMap = {
  clientId: 'client_id',
  projectId: 'project_id',
  total: 'total',
  status: 'status',
  paymentDate: 'payment_date',
  paymentMethod: 'payment_method',
  paymentReference: 'payment_reference',
  paymentAttachmentPath: 'payment_attachment_path',
  tripDate: 'trip_date',
  fromLocation: 'from_location',
  toLocation: 'to_location',
  frequency: 'frequency',
  notes: 'notes',
  serieFolio: 'serie_folio',
  rfcReceptor: 'rfc_receptor',
  receptorName: 'receptor_name',
  invoiceDescription: 'invoice_description',
  totalMxn: 'total_mxn',
  certificationDate: 'certification_date',
  xmlPath: 'xml_path',
  cfdiUuid: 'cfdi_uuid',
  paymentId: 'payment_id',
} satisfies Record<string, string>

export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<void> => {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [key, column] of Object.entries(invoiceColumnMap)) {
    const value = invoice[key as keyof Invoice]
    if (value !== undefined) updates[column] = value
  }
  const { error } = await supabase.from('invoices').update(updates).eq('id', id)
  if (error) throw error
}

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => updateInvoice(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
    onError: (error) => {
      const msg = getDuplicateFolioMessage(error)
      useStore.getState().addToast({
        type: 'error',
        message: msg || 'Error al actualizar la factura',
      })
    },
  })
}

export const batchUpdateInvoicesPaymentDate = async (
  paymentId: string,
  paymentDate: string,
): Promise<void> => {
  const { error } = await supabase
    .from('invoices')
    .update({ payment_date: paymentDate, updated_at: new Date().toISOString() })
    .eq('payment_id', paymentId)
  if (error) throw error
}

export const useBatchUpdateInvoicesPaymentDate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ paymentId, paymentDate }: { paymentId: string; paymentDate: string }) =>
      batchUpdateInvoicesPaymentDate(paymentId, paymentDate),
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
