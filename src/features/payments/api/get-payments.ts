import { z } from 'zod'
import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type PaymentRow = Database['public']['Tables']['payments']['Row']

const paymentMethodSchema = z.enum(['transferencia', 'efectivo', 'cheque'])

export const paymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string().optional(),
  amount: z.number(),
  method: paymentMethodSchema,
  reference: z.string().optional(),
  attachmentPath: z.string().optional(),
  createdAt: z.string().optional(),
})

export type Payment = z.infer<typeof paymentSchema>

const rowToPayment = (row: PaymentRow): Payment => ({
  id: row.id,
  invoiceId: row.invoice_id || undefined,
  amount: row.amount,
  method: row.method as Payment['method'],
  reference: row.reference || undefined,
  attachmentPath: row.attachment_path || undefined,
  createdAt: row.created_at || undefined,
})

export const getPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase.from('payments').select('*')
  if (error) throw error
  return (data || []).map(rowToPayment)
}

export const getPaymentsQueryOptions = () =>
  queryOptions({ queryKey: ['payments'], queryFn: getPayments })

export const usePaymentsTQ = () => useQuery(getPaymentsQueryOptions())

export type CreatePaymentInput = Omit<Payment, 'id' | 'createdAt'>

export const createPayment = async (input: CreatePaymentInput): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      invoice_id: input.invoiceId || null,
      amount: input.amount,
      method: input.method,
      reference: input.reference || null,
      attachment_path: input.attachmentPath || null,
    })
    .select()
    .single()
  if (error) throw error
  return rowToPayment(data)
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })
}

export const updatePayment = async (id: string, payment: Partial<Payment>): Promise<void> => {
  const { error } = await supabase
    .from('payments')
    .update({
      amount: payment.amount,
      method: payment.method,
      reference: payment.reference || null,
      attachment_path: payment.attachmentPath || null,
    })
    .eq('id', id)
  if (error) throw error
}

export const useUpdatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) => updatePayment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })
}

export const deletePayment = async (id: string): Promise<void> => {
  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      status: 'pendiente',
      payment_id: null,
      payment_date: null,
      payment_method: null,
      payment_reference: null,
      payment_attachment_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_id', id)
  if (updateError) throw updateError

  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) throw error
}

export const useDeletePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })
}
