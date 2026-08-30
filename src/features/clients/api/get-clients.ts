import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import type { Database } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

type ClientRow = Database['public']['Tables']['clients']['Row']

export const clientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  billingInterval: z.number().min(0).default(0),
  lastTripDate: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),
  requiresPapeleria: z.boolean().default(false),
  entityType: z.enum(['moral', 'fisica']).default('moral'),
  status: z.enum(['active', 'inactive']),
})

export type Client = z.infer<typeof clientSchema>

const rowToClient = (row: ClientRow): Client => ({
  id: row.id,
  name: row.name,
  email: row.email || '',
  phone: row.phone || '',
  billingInterval: row.billing_interval || 0,
  lastTripDate: row.last_trip_date || undefined,
  logoUrl: row.logo_url || undefined,
  requiresPapeleria: row.requires_papeleria ?? false,
  entityType: (row.entity_type as 'moral' | 'fisica') || 'moral',
  status: (row.status as 'active' | 'inactive') || 'active',
})

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select('*')
  if (error) throw error
  return (data || []).map(rowToClient)
}

export const getClientsQueryOptions = () =>
  queryOptions({ queryKey: ['clients'], queryFn: getClients })

export const useClients = () => useQuery(getClientsQueryOptions())

export const useActiveClients = () =>
  useQuery({
    queryKey: ['clients', { status: 'active' }],
    queryFn: async () => {
      const all = await getClients()
      return all.filter((c) => c.status === 'active')
    },
  })

export const createClient = async (client: Omit<Client, 'id' | 'status'>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: client.name,
      email: client.email || null,
      phone: client.phone || null,
      billing_interval: client.billingInterval,
      last_trip_date: client.lastTripDate || null,
      logo_url: client.logoUrl || null,
      requires_papeleria: client.requiresPapeleria,
      entity_type: client.entityType,
      status: 'active',
    })
    .select()
    .single()
  if (error) throw error
  return rowToClient(data)
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}

const clientColumnMap = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  billingInterval: 'billing_interval',
  lastTripDate: 'last_trip_date',
  logoUrl: 'logo_url',
  requiresPapeleria: 'requires_papeleria',
  entityType: 'entity_type',
  status: 'status',
} satisfies Record<string, string>

export const updateClient = async (id: string, client: Partial<Client>): Promise<void> => {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [key, column] of Object.entries(clientColumnMap)) {
    const value = client[key as keyof Client]
    if (value !== undefined) updates[column] = value
  }
  const { error } = await supabase.from('clients').update(updates).eq('id', id)
  if (error) throw error

  // Cascade: deactivate/reactivate projects when client status changes
  if (client.status === 'inactive') {
    await supabase
      .from('projects')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('client_id', id)
      .eq('status', 'active')
  } else if (client.status === 'active') {
    await supabase
      .from('projects')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('client_id', id)
      .eq('status', 'inactive')
  }
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}
