import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import type { Database } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

type VehicleRow = Database['public']['Tables']['client_vehicles']['Row']

export const vehicleSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  brand: z.string().min(1, 'La marca es obligatoria'),
  model: z.string().min(1, 'El modelo es obligatorio'),
  year: z.number().int().optional(),
  plate: z.string().optional(),
  serialNumber: z.string().optional(),
  policyNumber: z.string().optional(),
  seats: z.number().int().optional(),
  notes: z.string().optional(),
})

export type Vehicle = z.infer<typeof vehicleSchema>

const rowToVehicle = (row: VehicleRow): Vehicle => ({
  id: row.id,
  clientId: row.client_id,
  brand: row.brand,
  model: row.model,
  year: row.year || undefined,
  plate: row.plate || undefined,
  serialNumber: row.serial_number || undefined,
  policyNumber: row.policy_number || undefined,
  seats: row.seats || undefined,
  notes: row.notes || undefined,
})

export const getVehiclesByClient = async (clientId: string): Promise<Vehicle[]> => {
  const { data, error } = await supabase
    .from('client_vehicles')
    .select('*')
    .eq('client_id', clientId)
    .order('brand')
  if (error) throw error
  return (data || []).map(rowToVehicle)
}

export const useVehiclesByClient = (clientId?: string) =>
  useQuery({
    queryKey: ['requirements', 'vehicles', clientId],
    queryFn: () => getVehiclesByClient(clientId!),
    enabled: !!clientId,
  })

export const createVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
  const { data, error } = await supabase
    .from('client_vehicles')
    .insert({
      client_id: vehicle.clientId,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year || null,
      plate: vehicle.plate || null,
      serial_number: vehicle.serialNumber || null,
      policy_number: vehicle.policyNumber || null,
      seats: vehicle.seats || null,
      notes: vehicle.notes || null,
    })
    .select()
    .single()
  if (error) throw error
  return rowToVehicle(data)
}

export const useCreateVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'vehicles', data.clientId] })
    },
  })
}

export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>): Promise<void> => {
  const { error } = await supabase
    .from('client_vehicles')
    .update({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year || null,
      plate: vehicle.plate || null,
      serial_number: vehicle.serialNumber || null,
      policy_number: vehicle.policyNumber || null,
      seats: vehicle.seats || null,
      notes: vehicle.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
      clientId,
    }: {
      id: string
      data: Partial<Vehicle>
      clientId: string
    }) => updateVehicle(id, data).then(() => clientId),
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'vehicles', clientId] })
    },
  })
}

export const deleteVehicle = async (id: string): Promise<string> => {
  const { data } = await supabase.from('client_vehicles').select('client_id').eq('id', id).single()
  const { error } = await supabase.from('client_vehicles').delete().eq('id', id)
  if (error) throw error
  return data?.client_id || ''
}

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', 'vehicles', clientId] })
    },
  })
}
