import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Vehicle } from '@/features/requirements/api'

const vehicleFormSchema = z.object({
  brand: z.string().min(1, 'La marca es obligatoria'),
  model: z.string().min(1, 'El modelo es obligatorio'),
  year: z.string().optional(),
  plate: z.string().optional(),
  serialNumber: z.string().optional(),
  policyNumber: z.string().optional(),
  seats: z.string().optional(),
  notes: z.string().optional(),
})

type VehicleFormValues = z.infer<typeof vehicleFormSchema>

const defaultValues: VehicleFormValues = {
  brand: '',
  model: '',
  year: '',
  plate: '',
  serialNumber: '',
  policyNumber: '',
  seats: '',
  notes: '',
}

interface VehicleFormModalProps {
  open: boolean
  editingVehicle: Vehicle | null
  onSave: (data: VehicleFormValues) => void
  onClose: () => void
}

export function VehicleFormModal({ open, editingVehicle, onSave, onClose }: VehicleFormModalProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (editingVehicle) {
      form.reset({
        brand: editingVehicle.brand,
        model: editingVehicle.model,
        year: editingVehicle.year?.toString() || '',
        plate: editingVehicle.plate || '',
        serialNumber: editingVehicle.serialNumber || '',
        policyNumber: editingVehicle.policyNumber || '',
        seats: editingVehicle.seats?.toString() || '',
        notes: editingVehicle.notes || '',
      })
    } else {
      form.reset(defaultValues)
    }
  }, [editingVehicle, form])

  const handleSubmit = (values: VehicleFormValues) => {
    onSave(values)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={editingVehicle ? 'Editar vehículo' : 'Nuevo vehículo'}
      onClose={onClose}
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 space-y-4">
        <Input
          label="Marca *"
          placeholder="Mercedez Benz"
          {...form.register('brand')}
          error={form.formState.errors.brand?.message}
        />
        <Input
          label="Modelo *"
          placeholder="Sprinter"
          {...form.register('model')}
          error={form.formState.errors.model?.message}
        />
        <Input label="Año" type="number" placeholder="2024" {...form.register('year')} />
        <Input label="Placa" placeholder="ABC-123" {...form.register('plate')} />
        <Input
          label="Número de serie"
          placeholder="Serie del vehículo"
          {...form.register('serialNumber')}
        />
        <Input
          label="Número de póliza"
          placeholder="Póliza de seguro"
          {...form.register('policyNumber')}
        />
        <Input
          label="Número de asientos"
          type="number"
          placeholder="40"
          {...form.register('seats')}
        />
        <Input label="Notas" placeholder="Observaciones" {...form.register('notes')} />
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            {editingVehicle ? 'Guardar cambios' : 'Agregar vehículo'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
