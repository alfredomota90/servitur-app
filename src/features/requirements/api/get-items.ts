import { z } from 'zod'
import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type ItemRow = Database['public']['Tables']['requirement_items']['Row']

export const requirementItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  appliesTo: z.enum(['client', 'vehicle', 'driver']),
  entityType: z.enum(['moral', 'fisica', 'ambas']),
  hasExpiry: z.boolean(),
  hasFile: z.boolean(),
  sortOrder: z.number(),
})

export type RequirementItem = z.infer<typeof requirementItemSchema>

const rowToItem = (row: ItemRow): RequirementItem => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description || undefined,
  appliesTo: row.applies_to as RequirementItem['appliesTo'],
  entityType: row.entity_type as RequirementItem['entityType'],
  hasExpiry: row.has_expiry,
  hasFile: row.has_file,
  sortOrder: row.sort_order,
})

export const getRequirementItems = async (): Promise<RequirementItem[]> => {
  const { data, error } = await supabase.from('requirement_items').select('*').order('sort_order')
  if (error) throw error
  return (data || []).map(rowToItem)
}

export const getRequirementItemsQueryOptions = () =>
  queryOptions({ queryKey: ['requirements', 'items'], queryFn: getRequirementItems })

export const useRequirementItems = () => useQuery(getRequirementItemsQueryOptions())

export const createRequirementItem = async (
  item: Omit<RequirementItem, 'id'>,
): Promise<RequirementItem> => {
  const { data, error } = await supabase
    .from('requirement_items')
    .insert({
      code: item.code,
      name: item.name,
      description: item.description || null,
      applies_to: item.appliesTo,
      entity_type: item.entityType,
      has_expiry: item.hasExpiry,
      has_file: item.hasFile,
      sort_order: item.sortOrder,
    })
    .select()
    .single()
  if (error) throw error
  return rowToItem(data)
}

export const useCreateRequirementItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRequirementItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requirements', 'items'] }),
  })
}

export const updateRequirementItem = async (
  id: string,
  item: Partial<RequirementItem>,
): Promise<void> => {
  const { error } = await supabase
    .from('requirement_items')
    .update({
      name: item.name,
      description: item.description || null,
      applies_to: item.appliesTo,
      entity_type: item.entityType,
      has_expiry: item.hasExpiry,
      has_file: item.hasFile,
      sort_order: item.sortOrder,
    })
    .eq('id', id)
  if (error) throw error
}

export const useUpdateRequirementItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RequirementItem> }) =>
      updateRequirementItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requirements', 'items'] }),
  })
}

export const deleteRequirementItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('requirement_items').delete().eq('id', id)
  if (error) throw error
}

export const useDeleteRequirementItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRequirementItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requirements', 'items'] }),
  })
}
