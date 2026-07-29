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
})

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select('*')
  if (error) throw error
  return (data || []).map(rowToClient)
}

export const getClientsQueryOptions = () =>
  queryOptions({ queryKey: ['clients'], queryFn: getClients })

export const useClients = () => useQuery(getClientsQueryOptions())

export const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
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

export const updateClient = async (id: string, client: Partial<Client>): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .update({
      name: client.name,
      email: client.email || null,
      phone: client.phone || null,
      billing_interval: client.billingInterval,
      last_trip_date: client.lastTripDate || null,
      logo_url: client.logoUrl || null,
      requires_papeleria: client.requiresPapeleria,
      entity_type: client.entityType,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
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
