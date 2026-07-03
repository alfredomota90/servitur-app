import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const documentFormSchema = z.object({
  fileUrl: z.string().url('Debe ser una URL válida').or(z.literal('')),
  notes: z.string().optional(),
  expiryDate: z.string().optional(),
})

export type DocumentFormValues = z.infer<typeof documentFormSchema>

const defaultValues: DocumentFormValues = {
  fileUrl: '',
  notes: '',
  expiryDate: '',
}

interface DocumentFormModalProps {
  open: boolean
  itemName: string
  hasExpiry: boolean
  expiryWarnDays?: number
  onSave: (data: DocumentFormValues) => void
  onClose: () => void
}

export function DocumentFormModal({
  open,
  itemName,
  hasExpiry,
  expiryWarnDays,
  onSave,
  onClose,
}: DocumentFormModalProps) {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues,
  })

  const expiryDate = form.watch('expiryDate')
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!open) form.reset(defaultValues)
  }, [open, form])

  useEffect(() => {
    if (!expiryWarnDays || !expiryDate) {
      setExpiryWarning(null)
      return
    }
    const selected = new Date(expiryDate)
    const limit = new Date()
    limit.setDate(limit.getDate() - expiryWarnDays)
    if (selected < limit) {
      setExpiryWarning(
        `Este documento tiene más de ${expiryWarnDays} días. Es posible que esté vencido.`,
      )
    } else {
      setExpiryWarning(null)
    }
  }, [expiryDate, expiryWarnDays])

  const handleSubmit = (values: DocumentFormValues) => {
    onSave(values)
    onClose()
  }

  return (
    <Modal open={open} title={`Agregar documento — ${itemName}`} onClose={onClose}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 space-y-4">
        <Input
          label="URL del documento"
          type="url"
          placeholder="https://onedrive.com/tu-documento.pdf"
          {...form.register('fileUrl')}
          error={form.formState.errors.fileUrl?.message}
        />

        <Input label="Notas" placeholder="Observaciones (opcional)" {...form.register('notes')} />

        {hasExpiry && (
          <div>
            <Input label="Fecha de vencimiento" type="date" {...form.register('expiryDate')} />
            {expiryWarning && (
              <p className="flex items-center gap-1.5 text-xs text-warning mt-1.5">
                <AlertTriangle size={12} />
                {expiryWarning}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            Guardar
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
