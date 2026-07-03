import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type OverrideRow = Database['public']['Tables']['client_item_overrides']['Row']

export interface ItemOverride {
  id: string
  clientId: string
  itemId: string
  isNa: boolean
}

const rowToOverride = (row: OverrideRow): ItemOverride => ({
  id: row.id,
  clientId: row.client_id,
  itemId: row.item_id,
  isNa: row.is_na,
})

export const getOverridesByClient = async (clientId: string): Promise<ItemOverride[]> => {
  const { data, error } = await supabase
    .from('client_item_overrides')
    .select('*')
    .eq('client_id', clientId)
  if (error) throw error
  return (data || []).map(rowToOverride)
}

export const useOverridesByClient = (clientId?: string) =>
  useQuery({
    queryKey: ['requirements', 'overrides', clientId],
    queryFn: () => getOverridesByClient(clientId!),
    enabled: !!clientId,
  })

export const upsertOverride = async (
  clientId: string,
  itemId: string,
  isNa: boolean,
): Promise<void> => {
  const { error } = await supabase.from('client_item_overrides').upsert(
    {
      client_id: clientId,
      item_id: itemId,
      is_na: isNa,
    },
    { onConflict: 'client_id, item_id' },
  )
  if (error) throw error
}

export const useUpsertOverride = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ clientId, itemId, isNa }: { clientId: string; itemId: string; isNa: boolean }) =>
      upsertOverride(clientId, itemId, isNa),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'overrides', variables.clientId] })
    },
  })
}
