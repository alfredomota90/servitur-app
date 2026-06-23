import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload } from 'lucide-react'
import type { Invoice } from '@/features/invoices/api'
import type { Client } from '@/features/clients/api'
import { parseCFDIFromText, uploadXML } from '@/lib/xml-parser'
import { buildInvoiceData, type InvoiceFormData } from '@/lib/invoice-utils'
import { useStore } from '@/store/use-store'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input/textarea'
import { Select } from '@/components/ui/select'
import { Form } from '@/components/ui/form'

interface InvoiceFormModalProps {
  open: boolean
  clientId?: string
  clientName?: string
  clients?: Client[]
  editingInvoice?: Invoice | null
  onSave: (data: InvoiceFormData) => void
  onClose: () => void
}

const invoiceFormSchema = z.object({
  status: z.enum(['pendiente', 'pagado']),
  from: z.string().min(1, 'El origen es obligatorio'),
  to: z.string().min(1, 'El destino es obligatorio'),
  serieFolio: z.string().optional(),
  rfcReceptor: z.string().optional(),
  receptorName: z.string().optional(),
  invoiceDescription: z.string().optional(),
  totalMxn: z.string().optional(),
  certificationDate: z.string().optional(),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

const defaultValues: InvoiceFormValues = {
  status: 'pendiente',
  from: '',
  to: '',
  serieFolio: '',
  rfcReceptor: '',
  receptorName: '',
  invoiceDescription: '',
  totalMxn: '',
  certificationDate: '',
}

export default function InvoiceFormModal({
  open,
  clientId: propClientId = '',
  clientName: propClientName = '',
  clients,
  editingInvoice,
  onSave,
  onClose,
}: InvoiceFormModalProps) {
  const addToast = useStore((s) => s.addToast)
  const [xmlFile, setXmlFile] = useState<File | null>(null)
  const [localClientId, setLocalClientId] = useState(propClientId)
  const [localClientName, setLocalClientName] = useState(propClientName)

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      setXmlFile(null)
      setLocalClientId(propClientId)
      setLocalClientName(propClientName)
      form.reset({
        status: editingInvoice?.status || 'pendiente',
        from: editingInvoice?.fromLocation || '',
        to: editingInvoice?.toLocation || '',
        serieFolio: editingInvoice?.serieFolio || '',
        rfcReceptor: editingInvoice?.rfcReceptor || '',
        receptorName: editingInvoice?.receptorName || '',
        invoiceDescription: editingInvoice?.invoiceDescription || '',
        totalMxn: editingInvoice?.totalMxn?.toString() || '',
        certificationDate: editingInvoice?.certificationDate?.split('T')[0] || '',
      })
    }
  }, [open, propClientId, propClientName, editingInvoice, form])

  const handleClientChange = (id: string) => {
    setLocalClientId(id)
    const c = clients?.find((cl) => cl.id === id)
    if (c) {
      setLocalClientName(c.name)
      form.setValue('receptorName', c.name)
    }
  }

  const handleXMLUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xml')) {
      addToast({ type: 'error', message: 'Por favor selecciona un archivo XML' })
      return
    }

    setXmlFile(file)

    const text = await file.text()
    const data = parseCFDIFromText(text)

    if (data) {
      form.setValue('serieFolio', data.serie_folio)
      form.setValue('rfcReceptor', data.rfc_receptor)
      form.setValue('receptorName', data.receptor_name)
      form.setValue('invoiceDescription', data.invoice_description)
      form.setValue('totalMxn', data.total_mxn.toString())
      form.setValue('certificationDate', data.certification_date.split('T')[0])
    } else {
      addToast({
        type: 'error',
        message: 'Error al parsear el XML. Verifica que sea un CFDI válido.',
      })
    }
  }

  const resetForm = () => {
    setXmlFile(null)
    form.reset(defaultValues)
  }

  const handleSubmit = async (values: InvoiceFormValues) => {
    let xmlPath = ''

    if (xmlFile) {
      try {
        const path = await uploadXML(xmlFile, localClientId || 'sin-cliente')
        if (path) xmlPath = path
      } catch {
        addToast({ type: 'error', message: 'Error al subir el XML' })
      }
    }

    const formFields = {
      status: values.status,
      from: values.from,
      to: values.to,
      date: values.certificationDate?.split('T')[0] || '',
      serie_folio: values.serieFolio || '',
      rfc_receptor: values.rfcReceptor || '',
      receptor_name: values.receptorName || '',
      invoice_description: values.invoiceDescription || '',
      total_mxn: values.totalMxn || '',
      certification_date: values.certificationDate || '',
      xml_path: xmlPath,
    }

    const invoiceData = buildInvoiceData(
      formFields,
      localClientId,
      localClientName,
      editingInvoice,
      xmlPath,
    )

    onSave(invoiceData)
    resetForm()
    onClose()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      open={open}
      title={editingInvoice ? 'Editar viaje/factura' : 'Nuevo viaje/factura'}
      onClose={handleClose}
    >
      <Form form={form} onSubmit={handleSubmit} className="p-4">
        <input
          type="file"
          accept=".xml"
          onChange={handleXMLUpload}
          className="hidden"
          id="xml-upload"
        />
        <div className="flex justify-end">
          <label
            htmlFor="xml-upload"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer border-border text-foreground"
          >
            <Upload size={16} />
            Cargar XML SAT
          </label>
        </div>

        {xmlFile && (
          <div className="p-2 rounded bg-success/10 text-success text-xs">
            ✅ Archivo XML seleccionado: {xmlFile.name}
          </div>
        )}

        {clients && (
          <Select
            label="Cliente"
            value={localClientId}
            onChange={(e) => handleClientChange(e.target.value)}
            placeholder="Seleccionar cliente"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Origen"
            placeholder="Lugar de origen"
            {...form.register('from')}
            error={form.formState.errors.from?.message}
          />
          <Input
            label="Destino"
            placeholder="Lugar de destino"
            {...form.register('to')}
            error={form.formState.errors.to?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Estado</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={form.watch('status') === 'pendiente' ? 'primary' : 'secondary'}
              onClick={() => form.setValue('status', 'pendiente')}
            >
              Pendiente
            </Button>
            <Button
              type="button"
              variant={form.watch('status') === 'pagado' ? 'primary' : 'secondary'}
              onClick={() => form.setValue('status', 'pagado')}
            >
              Pagado
            </Button>
          </div>
        </div>

        <div className="border-t pt-4 border-border">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Datos de Factura SAT</h3>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Serie/Folio" placeholder="A206" {...form.register('serieFolio')} />
            <Input
              label="Total MXN"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register('totalMxn')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Input label="RFC Receptor" placeholder="RFC" {...form.register('rfcReceptor')} />
            <Input
              label="Fecha Certificación"
              type="date"
              {...form.register('certificationDate')}
            />
          </div>

          <div className="mt-2">
            <Input
              label="Nombre Receptor"
              placeholder="Nombre del cliente facturado"
              {...form.register('receptorName')}
            />
          </div>

          <div className="mt-2">
            <Textarea
              label="Descripción (Items)"
              rows={3}
              placeholder="Descripción de los conceptos facturados"
              {...form.register('invoiceDescription')}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            {editingInvoice ? 'Guardar cambios' : 'Agregar'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
