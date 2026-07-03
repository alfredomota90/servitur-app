import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type DocumentRow = Database['public']['Tables']['client_documents']['Row']

export const documentSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  itemId: z.string(),
  subitemId: z.string().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
  driverId: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  uploadedAt: z.string(),
})

export type Document = z.infer<typeof documentSchema>

const rowToDocument = (row: DocumentRow): Document => ({
  id: row.id,
  clientId: row.client_id,
  itemId: row.item_id,
  subitemId: row.subitem_id,
  vehicleId: row.vehicle_id,
  driverId: row.driver_id,
  fileUrl: row.file_url,
  notes: row.notes,
  expiryDate: row.expiry_date,
  uploadedAt: row.uploaded_at,
})

export const getDocumentsByClient = async (clientId: string): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('client_documents')
    .select('*')
    .eq('client_id', clientId)
    .order('uploaded_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToDocument)
}

export const useDocumentsByClient = (clientId?: string) =>
  useQuery({
    queryKey: ['requirements', 'documents', clientId],
    queryFn: () => getDocumentsByClient(clientId!),
    enabled: !!clientId,
  })

export const createDocument = async (
  doc: Omit<Document, 'id' | 'uploadedAt'>,
): Promise<Document> => {
  const { data, error } = await supabase
    .from('client_documents')
    .insert({
      client_id: doc.clientId,
      item_id: doc.itemId,
      subitem_id: doc.subitemId || null,
      vehicle_id: doc.vehicleId || null,
      driver_id: doc.driverId || null,
      file_url: doc.fileUrl || null,
      notes: doc.notes || null,
      expiry_date: doc.expiryDate || null,
    })
    .select()
    .single()
  if (error) throw error
  return rowToDocument(data)
}

export const useCreateDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDocument,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'documents', data.clientId] })
    },
  })
}

export const deleteDocument = async (id: string): Promise<string> => {
  const { data } = await supabase.from('client_documents').select('client_id').eq('id', id).single()
  const { error } = await supabase.from('client_documents').delete().eq('id', id)
  if (error) throw error
  return data?.client_id || ''
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'documents', clientId] })
    },
  })
}
