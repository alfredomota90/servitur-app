import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type DriverRow = Database['public']['Tables']['client_drivers']['Row']

export const driverSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export type Driver = z.infer<typeof driverSchema>

const rowToDriver = (row: DriverRow): Driver => ({
  id: row.id,
  clientId: row.client_id,
  name: row.name,
  licenseNumber: row.license_number || undefined,
  licenseExpiry: row.license_expiry || undefined,
  phone: row.phone || undefined,
  notes: row.notes || undefined,
})

export const getDriversByClient = async (clientId: string): Promise<Driver[]> => {
  const { data, error } = await supabase
    .from('client_drivers')
    .select('*')
    .eq('client_id', clientId)
    .order('name')
  if (error) throw error
  return (data || []).map(rowToDriver)
}

export const useDriversByClient = (clientId?: string) =>
  useQuery({
    queryKey: ['requirements', 'drivers', clientId],
    queryFn: () => getDriversByClient(clientId!),
    enabled: !!clientId,
  })

export const createDriver = async (driver: Omit<Driver, 'id'>): Promise<Driver> => {
  const { data, error } = await supabase
    .from('client_drivers')
    .insert({
      client_id: driver.clientId,
      name: driver.name,
      license_number: driver.licenseNumber || null,
      license_expiry: driver.licenseExpiry || null,
      phone: driver.phone || null,
      notes: driver.notes || null,
    })
    .select()
    .single()
  if (error) throw error
  return rowToDriver(data)
}

export const useCreateDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDriver,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'drivers', data.clientId] })
    },
  })
}

export const updateDriver = async (id: string, driver: Partial<Driver>): Promise<void> => {
  const { error } = await supabase
    .from('client_drivers')
    .update({
      name: driver.name,
      license_number: driver.licenseNumber || null,
      license_expiry: driver.licenseExpiry || null,
      phone: driver.phone || null,
      notes: driver.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export const useUpdateDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data, clientId }: { id: string; data: Partial<Driver>; clientId: string }) =>
      updateDriver(id, data).then(() => clientId),
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'drivers', clientId] })
    },
  })
}

export const deleteDriver = async (id: string): Promise<string> => {
  const { data } = await supabase.from('client_drivers').select('client_id').eq('id', id).single()
  const { error } = await supabase.from('client_drivers').delete().eq('id', id)
  if (error) throw error
  return data?.client_id || ''
}

export const useDeleteDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDriver,
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'drivers', clientId] })
    },
  })
}
