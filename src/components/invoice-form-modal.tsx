import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input/textarea'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import type { Client } from '@/features/clients/api'
import { type Invoice, useInvoices } from '@/features/invoices/api'
import type { Project } from '@/features/projects/api'
import { buildInvoiceData, type InvoiceFormData } from '@/lib/invoice-utils'
import { parseCFDIFromText, uploadXML } from '@/lib/xml-parser'
import { useStore } from '@/store/use-store'

interface InvoiceFormModalProps {
  open: boolean
  clientId?: string
  clientName?: string
  clients?: Client[]
  projects?: Project[]
  selectedProjectId?: string
  editingInvoice?: Invoice | null
  onSave: (data: InvoiceFormData) => void
  onClose: () => void
}

const invoiceFormSchema = z.object({
  status: z.enum(['pendiente', 'pagado']),
  serieFolio: z.string().optional(),
  rfcReceptor: z.string().optional(),
  receptorName: z.string().optional(),
  invoiceDescription: z.string().optional(),
  totalMxn: z.string().optional(),
  certificationDate: z.string().optional(),
  cfdiUuid: z.string().optional(),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

const defaultValues: InvoiceFormValues = {
  status: 'pendiente',
  serieFolio: '',
  rfcReceptor: '',
  receptorName: '',
  invoiceDescription: '',
  totalMxn: '',
  certificationDate: '',
  cfdiUuid: '',
}

interface SerieWarning {
  folio: string
  projectName: string
}

export default function InvoiceFormModal({
  open,
  clientId: propClientId = '',
  clientName: propClientName = '',
  clients,
  projects = [],
  selectedProjectId: propSelectedProjectId = '',
  editingInvoice,
  onSave,
  onClose,
}: InvoiceFormModalProps) {
  const addToast = useStore((s) => s.addToast)
  const { data: allInvoices = [] } = useInvoices()
  const [xmlFile, setXmlFile] = useState<File | null>(null)
  const [localClientId, setLocalClientId] = useState(propClientId)
  const [localClientName, setLocalClientName] = useState(propClientName)
  const [localProjectId, setLocalProjectId] = useState(propSelectedProjectId)
  const [serieWarning, setSerieWarning] = useState<SerieWarning | null>(null)

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      setXmlFile(null)
      setSerieWarning(null)
      setLocalClientId(propClientId)
      setLocalClientName(propClientName)
      setLocalProjectId(editingInvoice?.projectId || propSelectedProjectId)
      form.reset({
        status: editingInvoice?.status || 'pendiente',
        serieFolio: editingInvoice?.serieFolio || '',
        rfcReceptor: editingInvoice?.rfcReceptor || '',
        receptorName: editingInvoice?.receptorName || '',
        invoiceDescription: editingInvoice?.invoiceDescription || '',
        totalMxn: editingInvoice?.totalMxn?.toString() || '',
        certificationDate: editingInvoice?.certificationDate?.split('T')[0] || '',
        cfdiUuid: editingInvoice?.cfdiUuid || '',
      })
    }
  }, [open, propClientId, propClientName, propSelectedProjectId, editingInvoice, form])

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
      form.setValue('cfdiUuid', data.uuid)
    } else {
      addToast({
        type: 'error',
        message: 'Error al parsear el XML. Verifica que sea un CFDI válido.',
      })
    }
  }

  const resetForm = () => {
    setXmlFile(null)
    setSerieWarning(null)
    form.reset(defaultValues)
  }

  const handleSubmit = async (values: InvoiceFormValues) => {
    const uuidTrimmed = (values.cfdiUuid || '').trim()
    const serieTrimmed = (values.serieFolio || '').trim().toLowerCase()
    const editingId = editingInvoice?.id

    // 1) Bloqueo: UUID duplicado global
    if (uuidTrimmed) {
      const dupUuid = allInvoices.find(
        (inv) =>
          inv.cfdiUuid &&
          inv.cfdiUuid.toLowerCase() === uuidTrimmed.toLowerCase() &&
          inv.id !== editingId,
      )
      if (dupUuid) {
        addToast({
          type: 'error',
          message: `El folio fiscal ${uuidTrimmed} ya está registrado en otra factura`,
        })
        return
      }
    }

    // 2) Warning: serie_folio duplicado en el MISMO cliente (otro proyecto)
    if (serieTrimmed && !serieWarning) {
      const dupSerie = allInvoices.find(
        (inv) =>
          inv.serieFolio &&
          inv.serieFolio.trim().toLowerCase() === serieTrimmed &&
          inv.clientId === localClientId &&
          inv.id !== editingId,
      )
      if (dupSerie) {
        const dupProjectName = dupSerie.projectId
          ? projects.find((p) => p.id === dupSerie.projectId)?.name || 'otro proyecto'
          : 'este cliente sin proyecto'
        setSerieWarning({
          folio: values.serieFolio || '',
          projectName: dupProjectName,
        })
        addToast({
          type: 'warning',
          message: `El folio ${values.serieFolio} ya está guardado en "${dupProjectName}"`,
        })
        return
      }
    }

    // Proceder con el guardado
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
      date: values.certificationDate?.split('T')[0] || '',
      serie_folio: values.serieFolio || '',
      rfc_receptor: values.rfcReceptor || '',
      receptor_name: values.receptorName || '',
      invoice_description: values.invoiceDescription || '',
      total_mxn: values.totalMxn || '',
      certification_date: values.certificationDate || '',
      xml_path: xmlPath,
      cfdi_uuid: values.cfdiUuid || '',
    }

    const invoiceData = buildInvoiceData(
      formFields,
      localClientId,
      localClientName,
      editingInvoice,
      xmlPath,
      localProjectId,
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

        {serieWarning && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm mt-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              El folio <strong>{serieWarning.folio}</strong> ya está guardado en el proyecto{' '}
              <strong>&quot;{serieWarning.projectName}&quot;</strong>. ¿Deseas continuar de todos
              modos?
            </span>
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

        {projects.length > 0 && (
          <Select
            label="Proyecto"
            value={localProjectId}
            onChange={(e) => setLocalProjectId(e.target.value)}
            placeholder="Sin proyecto"
          >
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        )}

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
          <Button type="submit" className="flex-1" variant={serieWarning ? 'warning' : 'primary'}>
            {serieWarning
              ? 'Guardar de todos modos'
              : editingInvoice
                ? 'Guardar cambios'
                : 'Agregar'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
