import { queryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import type { Database } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

type SubitemRow = Database['public']['Tables']['requirement_subitems']['Row']

export const requirementSubitemSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  code: z.string(),
  name: z.string(),
  sortOrder: z.number(),
})

export type RequirementSubitem = z.infer<typeof requirementSubitemSchema>

const rowToSubitem = (row: SubitemRow): RequirementSubitem => ({
  id: row.id,
  itemId: row.item_id,
  code: row.code,
  name: row.name,
  sortOrder: row.sort_order,
})

export const getRequirementSubitems = async (): Promise<RequirementSubitem[]> => {
  const { data, error } = await supabase
    .from('requirement_subitems')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return (data || []).map(rowToSubitem)
}

export const getRequirementSubitemsByItemQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: ['requirements', 'subitems', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requirement_subitems')
        .select('*')
        .eq('item_id', itemId)
        .order('sort_order')
      if (error) throw error
      return (data || []).map(rowToSubitem)
    },
  })

export const useRequirementSubitems = () =>
  useQuery({
    queryKey: ['requirements', 'subitems'],
    queryFn: getRequirementSubitems,
  })

export const useRequirementSubitemsByItem = (itemId?: string) =>
  useQuery({
    queryKey: ['requirements', 'subitems', itemId],
    queryFn: async () => {
      if (!itemId) return []
      const { data, error } = await supabase
        .from('requirement_subitems')
        .select('*')
        .eq('item_id', itemId)
        .order('sort_order')
      if (error) throw error
      return (data || []).map(rowToSubitem)
    },
    enabled: !!itemId,
  })
