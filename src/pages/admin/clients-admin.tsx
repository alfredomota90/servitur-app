import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from '@/features/clients/api'
import type { Client } from '@/features/clients/api'
import { useInvoices } from '@/features/invoices/api'
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Mail,
  Phone,
  Building2,
  FileText,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
  ClipboardCheck,
} from 'lucide-react'
import { getNextBillingDate, getDaysUntil, formatDate } from '@/lib/utils'
import ConfirmModal from '@/components/confirm-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form } from '@/components/ui/form'
import BackHeader from '@/components/back-header'

const clientFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  billingInterval: z.number().min(0),
  logoUrl: z.string().optional().or(z.literal('')),
  requiresPapeleria: z.boolean(),
  entityType: z.enum(['moral', 'fisica']),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

const defaultClientValues: ClientFormValues = {
  name: '',
  email: '',
  phone: '',
  billingInterval: 0,
  logoUrl: '',
  requiresPapeleria: false,
  entityType: 'moral',
}

export default function ClientsAdmin() {
  const navigate = useNavigate()
  const { data: clients = [] } = useClients()
  const { data: invoices = [] } = useInvoices()
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultClientValues,
  })

  const watchedBillingInterval = form.watch('billingInterval')

  useEffect(() => {
    if (editingClient) {
      form.reset({
        name: editingClient.name,
        email: editingClient.email || '',
        phone: editingClient.phone || '',
        billingInterval: editingClient.billingInterval,
        logoUrl: editingClient.logoUrl || '',
        requiresPapeleria: editingClient.requiresPapeleria,
        entityType: editingClient.entityType,
      })
    } else {
      form.reset(defaultClientValues)
    }
  }, [editingClient, form])

  const nextBillingPreview = (() => {
    const source = editingClient ? invoices.filter((inv) => inv.clientId === editingClient.id) : []
    const d = getNextBillingDate(source, watchedBillingInterval || 10)
    return d ? { date: d, days: getDaysUntil(d) } : null
  })()

  const handleSubmit = (values: ClientFormValues) => {
    const clientData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      billingInterval: values.billingInterval,
      lastTripDate: undefined,
      logoUrl: values.logoUrl || undefined,
      requiresPapeleria: values.requiresPapeleria,
      entityType: values.entityType,
    }

    if (editingClient) {
      updateClient.mutate({ id: editingClient.id, data: clientData })
    } else {
      createClient.mutate(clientData as Omit<Client, 'id'>)
    }

    resetForm()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingClient(null)
    form.reset(defaultClientValues)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteClient.mutate(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="p-4 md:p-6">
      <BackHeader />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted">{clients.length} clientes registrados</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={18} />
          <span className="hidden bp:inline ml-2">Agregar</span>
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl max-w-lg w-full bg-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-lg text-foreground">
                {editingClient ? 'Editar cliente' : 'Nuevo cliente'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-card-hover rounded text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <Form form={form} onSubmit={handleSubmit} className="p-4">
              <Input
                label="Nombre *"
                placeholder="Nombre de la empresa"
                {...form.register('name')}
                error={form.formState.errors.name?.message}
              />

              <Input
                label="Email"
                type="email"
                placeholder="email@empresa.com"
                {...form.register('email')}
              />

              <Input
                label="Teléfono"
                type="tel"
                placeholder="618 123 4567"
                {...form.register('phone')}
              />

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Logo (URL)</label>
                <div className="flex items-center gap-3">
                  {form.watch('logoUrl') ? (
                    <img
                      src={form.watch('logoUrl')}
                      alt="Logo"
                      className="w-12 h-12 rounded-lg object-contain border bg-background p-1 border-border"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-border bg-background-secondary">
                      <ImageIcon size={20} className="text-muted" />
                    </div>
                  )}
                  <input
                    type="url"
                    {...form.register('logoUrl')}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background text-foreground border-border"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
              </div>

              <Input
                label="Intervalo de facturación (días)"
                type="number"
                min="0"
                placeholder="10"
                {...form.register('billingInterval', { valueAsNumber: true })}
              />

              {nextBillingPreview && (
                <div className="p-3 rounded-lg text-sm bg-background-secondary text-foreground">
                  Próxima facturación:{' '}
                  <span className="font-bold">{formatDate(nextBillingPreview.date)}</span>
                  {nextBillingPreview.days > 0 ? (
                    <span className="text-success"> (en {nextBillingPreview.days} días)</span>
                  ) : nextBillingPreview.days === 0 ? (
                    <span className="text-warning"> (hoy)</span>
                  ) : (
                    <span className="text-error">
                      {' '}
                      (vencida hace {Math.abs(nextBillingPreview.days)} días)
                    </span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Tipo de persona
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="moral"
                      className="w-4 h-4 text-accent border-border focus:ring-accent/20"
                      {...form.register('entityType')}
                    />
                    <span className="text-sm text-foreground">Moral</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="fisica"
                      className="w-4 h-4 text-accent border-border focus:ring-accent/20"
                      {...form.register('entityType')}
                    />
                    <span className="text-sm text-foreground">Física</span>
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20"
                  {...form.register('requiresPapeleria')}
                />
                <ClipboardCheck size={16} className="text-muted" />
                <span className="text-sm text-foreground">Requiere papelería/requisitos</span>
              </label>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {editingClient ? 'Guardar cambios' : 'Agregar cliente'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {clients.map((client) => {
          const clientInvoices = invoices.filter((i) => i.clientId === client.id)
          const totalGenerated = clientInvoices.reduce((sum, i) => sum + (i.totalMxn || i.total), 0)
          const totalPaid = clientInvoices
            .filter((i) => i.status === 'pagado')
            .reduce((sum, i) => sum + (i.totalMxn || i.total), 0)
          const pending = totalGenerated - totalPaid
          const pendingInvoices = clientInvoices.filter((i) => i.status === 'pendiente').length

          return (
            <div
              key={client.id}
              className="rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full bg-card border border-border"
              onClick={() => navigate(`/admin/clientes/${client.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  {client.logoUrl ? (
                    <img
                      src={client.logoUrl}
                      alt={client.name}
                      className="w-24 h-12 rounded-lg object-contain border bg-background p-1 border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-accent-muted">
                      <Building2 className="text-accent" size={24} />
                    </div>
                  )}

                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-1.5 rounded transition-colors text-accent bg-accent-muted"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-1.5 rounded transition-colors text-error bg-error/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1 text-foreground">{client.name}</h3>

                <div className="space-y-2 text-sm mb-4">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-muted" />
                      <span className="text-muted">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-muted" />
                      <span className="text-muted">{client.phone}</span>
                    </div>
                  )}
                  {(() => {
                    const clientInvoices = invoices.filter((inv) => inv.clientId === client.id)
                    const nextDate = getNextBillingDate(
                      clientInvoices,
                      client.billingInterval || 10,
                    )
                    if (!nextDate) {
                      return (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-muted" />
                          <span className="text-muted">Sin programar</span>
                        </div>
                      )
                    }
                    const days = getDaysUntil(nextDate)
                    if (days > 0) {
                      return (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-success" />
                          <span className="text-success">
                            Faltan {days} días para próxima facturación
                          </span>
                        </div>
                      )
                    } else if (days === 0) {
                      return (
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} className="text-warning" />
                          <span className="text-warning">Facturación vence hoy</span>
                        </div>
                      )
                    } else {
                      return (
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} className="text-error" />
                          <span className="text-error">
                            Facturación vencida hace {Math.abs(days)} días
                          </span>
                        </div>
                      )
                    }
                  })()}
                </div>

                {pendingInvoices > 0 && (
                  <div className="mb-3 px-3 py-2 rounded-lg text-center bg-accent-muted">
                    <span className="font-bold text-accent-text">
                      {pendingInvoices} factura{pendingInvoices > 1 ? 's' : ''} pendiente
                      {pendingInvoices > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <FileText size={14} />
                      <span>Estado de cuenta</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {pending > 0 ? (
                      <span className="text-sm font-bold text-warning">
                        $
                        {pending.toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        pendiente
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-success">Al día</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12 text-muted">No hay clientes registrados</div>
      )}

      <ConfirmModal
        open={deleteConfirm !== null}
        title="Eliminar cliente"
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede revertir."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        danger={true}
      />
    </div>
  )
}
