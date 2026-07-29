import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Database } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

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
    onMutate: async ({ clientId, itemId, isNa }) => {
      await queryClient.cancelQueries({ queryKey: ['requirements', 'overrides', clientId] })
      const previous = queryClient.getQueryData<ItemOverride[]>([
        'requirements',
        'overrides',
        clientId,
      ])
      queryClient.setQueryData<ItemOverride[]>(['requirements', 'overrides', clientId], (old) => {
        const existing = (old || []).findIndex((o) => o.itemId === itemId)
        if (existing >= 0) {
          const updated = [...(old || [])]
          updated[existing] = { ...updated[existing], isNa }
          return updated
        }
        return [...(old || []), { id: '', clientId, itemId, isNa }]
      })
      return { previous, clientId }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['requirements', 'overrides', context.clientId], context.previous)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'overrides', variables.clientId] })
    },
  })
}
