import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import type { Driver } from '@/features/requirements/api'

const driverFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type DriverFormValues = z.infer<typeof driverFormSchema>

const defaultValues: DriverFormValues = {
  name: '',
  licenseNumber: '',
  licenseExpiry: '',
  phone: '',
  notes: '',
}

interface DriverFormModalProps {
  open: boolean
  editingDriver: Driver | null
  onSave: (data: DriverFormValues) => void
  onClose: () => void
}

export function DriverFormModal({ open, editingDriver, onSave, onClose }: DriverFormModalProps) {
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (editingDriver) {
      form.reset({
        name: editingDriver.name,
        licenseNumber: editingDriver.licenseNumber || '',
        licenseExpiry: editingDriver.licenseExpiry || '',
        phone: editingDriver.phone || '',
        notes: editingDriver.notes || '',
      })
    } else {
      form.reset(defaultValues)
    }
  }, [editingDriver, form])

  const handleSubmit = (values: DriverFormValues) => {
    onSave(values)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={editingDriver ? 'Editar conductor' : 'Nuevo conductor'}
      onClose={onClose}
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 space-y-4">
        <Input
          label="Nombre *"
          placeholder="Juan Pérez"
          {...form.register('name')}
          error={form.formState.errors.name?.message}
        />
        <Input
          label="Número de licencia"
          placeholder="LIC-12345"
          {...form.register('licenseNumber')}
        />
        <Input label="Vencimiento de licencia" type="date" {...form.register('licenseExpiry')} />
        <Input label="Teléfono" type="tel" placeholder="618 123 4567" {...form.register('phone')} />
        <Input label="Notas" placeholder="Observaciones" {...form.register('notes')} />
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            {editingDriver ? 'Guardar cambios' : 'Agregar conductor'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
