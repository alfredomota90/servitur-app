import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Truck,
  User,
  FileText,
  Upload,
  Ban,
  Eye,
} from 'lucide-react'
import { useClients } from '@/features/clients/api'
import {
  useRequirementItems,
  useRequirementSubitemsByItem,
  useVehiclesByClient,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  useDriversByClient,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
  useDocumentsByClient,
  useOverridesByClient,
  useUpsertOverride,
  useCreateDocument,
  useDeleteDocument,
} from '@/features/requirements/api'
import type {
  Vehicle,
  Driver,
  RequirementItem,
  RequirementSubitem,
} from '@/features/requirements/api'
import { Button } from '@/components/ui/button'
import { VehicleFormModal } from '@/features/requirements/components/vehicle-form-modal'
import { DriverFormModal } from '@/features/requirements/components/driver-form-modal'
import { DocumentFormModal } from '@/features/requirements/components/document-form-modal'
import type { DocumentFormValues } from '@/features/requirements/components/document-form-modal'
import { DocumentListModal } from '@/features/requirements/components/document-list-modal'
import { Modal } from '@/components/ui/modal'
import ConfirmModal from '@/components/confirm-modal'

export default function RequirementsPage() {
  const { id } = useParams()
  const { data: clients = [] } = useClients()
  const { data: items = [] } = useRequirementItems()
  const { data: vehicles = [] } = useVehiclesByClient(id)
  const { data: drivers = [] } = useDriversByClient(id)
  const { data: documents = [] } = useDocumentsByClient(id)
  const { data: overrides = [] } = useOverridesByClient(id)
  const upsertOverride = useUpsertOverride()

  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const deleteVehicle = useDeleteVehicle()

  const createDriver = useCreateDriver()
  const updateDriver = useUpdateDriver()
  const deleteDriver = useDeleteDriver()

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null)

  const [driverModalOpen, setDriverModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [deleteDriverId, setDeleteDriverId] = useState<string | null>(null)

  const fotoItem = items.find((i) => i.code === 'foto_4_frentes')
  const { data: fotoSubitems = [] } = useRequirementSubitemsByItem(fotoItem?.id)

  const [documentModalItem, setDocumentModalItem] = useState<RequirementItem | null>(null)
  const [documentModalSubitem, setDocumentModalSubitem] = useState<RequirementSubitem | null>(null)
  const [viewDocsItem, setViewDocsItem] = useState<RequirementItem | null>(null)
  const [viewSubitemDocs, setViewSubitemDocs] = useState<RequirementSubitem | null>(null)
  const [selectedVehicleForDocs, setSelectedVehicleForDocs] = useState<Vehicle | null>(null)
  const [selectedDriverForDocs, setSelectedDriverForDocs] = useState<Driver | null>(null)

  const createDocument = useCreateDocument()
  const deleteDocument = useDeleteDocument()

  const client = clients.find((c) => c.id === id)
  if (!client) return null

  const isItemApplicable = (item: (typeof items)[number]) => {
    if (item.entityType === 'ambas') return true
    return item.entityType === client.entityType
  }

  const isItemNa = (itemId: string) => overrides.some((o) => o.itemId === itemId && o.isNa)

  const clientItems = items.filter((i) => i.appliesTo === 'client' && isItemApplicable(i))
  const vehicleItems = items.filter((i) => i.appliesTo === 'vehicle')
  const driverItems = items.filter((i) => i.appliesTo === 'driver')

  const toggleNa = (itemId: string) => {
    const current = overrides.find((o) => o.itemId === itemId)
    upsertOverride.mutate({ clientId: id!, itemId, isNa: !current?.isNa })
  }

  const docsFor = (itemId: string, linkedId?: string) =>
    documents.filter((d) => {
      if (d.itemId !== itemId) return false
      if (linkedId) {
        const isVehicle = vehicleItems.some((vi) => vi.id === itemId)
        return isVehicle ? d.vehicleId === linkedId : d.driverId === linkedId
      }
      return !d.vehicleId && !d.driverId
    })

  const countDocs = (itemId: string, linkedId?: string) => docsFor(itemId, linkedId).length

  const countSubitemDocs = (subitemId: string, vehicleId: string) =>
    documents.filter((d) => d.subitemId === subitemId && d.vehicleId === vehicleId).length

  const totalDocs = (itemsList: typeof clientItems, linkedId?: string) =>
    itemsList.filter((i) => i.hasFile).reduce((sum, i) => sum + countDocs(i.id, linkedId), 0)

  const requiredDocs = (itemsList: typeof clientItems) => itemsList.filter((i) => i.hasFile).length

  type VehicleEntry =
    | { type: 'item'; item: (typeof vehicleItems)[number]; subitem: null }
    | {
        type: 'subitem'
        item: (typeof vehicleItems)[number]
        subitem: (typeof fotoSubitems)[number]
      }

  const getVehicleEntries = (): VehicleEntry[] => {
    const entries: VehicleEntry[] = []
    for (const item of vehicleItems.filter((i) => i.hasFile)) {
      const subitems = fotoSubitems.filter((s) => s.itemId === item.id)
      if (subitems.length > 0) {
        for (const s of subitems) {
          entries.push({ type: 'subitem', item, subitem: s })
        }
      } else {
        entries.push({ type: 'item', item, subitem: null })
      }
    }
    return entries
  }

  const requiredVehicleCount =
    vehicleItems.filter((i) => i.hasFile && i.code !== 'foto_4_frentes').length +
    fotoSubitems.length

  const totalVehicleDocs = (vehicleId: string) => {
    const itemTotal = vehicleItems
      .filter((i) => i.hasFile && i.code !== 'foto_4_frentes')
      .reduce((sum, i) => sum + countDocs(i.id, vehicleId), 0)
    const subitemTotal = fotoSubitems.reduce((sum, s) => sum + countSubitemDocs(s.id, vehicleId), 0)
    return itemTotal + subitemTotal
  }

  const requiredTotal =
    requiredDocs(clientItems) +
    vehicles.length * requiredVehicleCount +
    drivers.length * requiredDocs(driverItems)
  const pendingTotal = requiredTotal - documents.length

  const openNewVehicle = () => {
    setEditingVehicle(null)
    setVehicleModalOpen(true)
  }

  const openEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v)
    setVehicleModalOpen(true)
  }

  const handleSaveVehicle = (data: {
    brand: string
    model: string
    year?: string
    plate?: string
    serialNumber?: string
    policyNumber?: string
    seats?: string
    notes?: string
  }) => {
    const payload = {
      ...data,
      year: data.year ? Number(data.year) : undefined,
      seats: data.seats ? Number(data.seats) : undefined,
    }
    if (editingVehicle) {
      updateVehicle.mutate({ id: editingVehicle.id, data: payload, clientId: id! })
    } else {
      createVehicle.mutate({ clientId: id!, ...payload })
    }
  }

  const openNewDriver = () => {
    setEditingDriver(null)
    setDriverModalOpen(true)
  }

  const openEditDriver = (d: Driver) => {
    setEditingDriver(d)
    setDriverModalOpen(true)
  }

  const handleSaveDriver = (data: {
    name: string
    licenseNumber?: string
    licenseExpiry?: string
    phone?: string
    notes?: string
  }) => {
    if (editingDriver) {
      updateDriver.mutate({ id: editingDriver.id, data, clientId: id! })
    } else {
      createDriver.mutate({ clientId: id!, ...data })
    }
  }

  return (
    <div className="p-4 md:p-6">
      <Link
        to={`/admin/clientes/${id}`}
        className="flex items-center gap-2 mb-4 text-muted hover:text-foreground"
      >
        <ArrowLeft size={20} />
        Volver a {client.name}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Requisitos - {client.name}</h1>
        <p className="text-muted text-sm">
          {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}
          {' · '}
          {drivers.length} conductor{drivers.length !== 1 ? 'es' : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="rounded-xl p-4 bg-card border border-border">
          <p className="text-2xl font-bold text-foreground">{items.length}</p>
          <p className="text-sm text-muted">Requisitos totales</p>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border">
          <p className="text-2xl font-bold text-success">{documents.length}</p>
          <p className="text-sm text-muted">Documentos subidos</p>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border">
          <p className="text-2xl font-bold text-warning">{pendingTotal}</p>
          <p className="text-sm text-muted">Documentos pendientes</p>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border">
          <p className="text-2xl font-bold text-warning">0</p>
          <p className="text-sm text-muted">Próximos a vencer</p>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border">
          <p className="text-2xl font-bold text-error">0</p>
          <p className="text-sm text-muted">Vencidos</p>
        </div>
      </div>

      {/* Vehicles */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Truck size={20} className="text-muted" />
            Vehículos
          </h2>
          <Button onClick={openNewVehicle} size="sm">
            <Plus size={16} />
            <span className="ml-1">Agregar</span>
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">Sin vehículos registrados</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-card border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-muted">
                    <Truck className="text-accent" size={20} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditVehicle(v)
                      }}
                      className="p-1.5 rounded transition-colors text-accent bg-accent-muted"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteVehicleId(v.id)
                      }}
                      className="p-1.5 rounded transition-colors text-error bg-error/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-foreground mb-1">
                  {v.brand} {v.model}
                </h3>

                <div className="space-y-1 text-sm text-muted mb-3">
                  {v.year && <p>Año: {v.year}</p>}
                  {v.plate && <p>Placa: {v.plate}</p>}
                  {v.serialNumber && <p>Serie: {v.serialNumber}</p>}
                  {v.policyNumber && <p>Póliza: {v.policyNumber}</p>}
                  {v.seats && <p>Asientos: {v.seats}</p>}
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted">
                      Documentos del vehículo ({totalVehicleDocs(v.id)}/{requiredVehicleCount})
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVehicleForDocs(v)
                      }}
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded text-accent bg-accent-muted hover:bg-accent/20 transition-colors"
                    >
                      <Upload size={12} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {getVehicleEntries().map((entry) => {
                      if (entry.type === 'subitem') {
                        const count = countSubitemDocs(entry.subitem.id, v.id)
                        return (
                          <div
                            key={entry.subitem.id}
                            className={`flex items-center justify-between text-xs py-0.5 ${
                              count > 0 ? 'text-success' : 'text-muted'
                            }`}
                          >
                            <span className="truncate mr-2">{entry.subitem.name}</span>
                            <span className="shrink-0 font-medium">{count > 0 ? '✓' : '—'}</span>
                          </div>
                        )
                      }
                      const count = countDocs(entry.item.id, v.id)
                      return (
                        <div
                          key={entry.item.id}
                          className={`flex items-center justify-between text-xs py-0.5 ${
                            count > 0 ? 'text-success' : 'text-muted'
                          }`}
                        >
                          <span className="truncate mr-2">{entry.item.name}</span>
                          <span className="shrink-0 font-medium">{count > 0 ? '✓' : '—'}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Drivers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <User size={20} className="text-muted" />
            Conductores
          </h2>
          <Button onClick={openNewDriver} size="sm">
            <Plus size={16} />
            <span className="ml-1">Agregar</span>
          </Button>
        </div>

        {drivers.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">Sin conductores registrados</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {drivers.map((d) => (
              <div
                key={d.id}
                className="rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-card border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-muted">
                    <User className="text-accent" size={20} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditDriver(d)}
                      className="p-1.5 rounded transition-colors text-accent bg-accent-muted"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteDriverId(d.id)}
                      className="p-1.5 rounded transition-colors text-error bg-error/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-foreground mb-1">{d.name}</h3>

                <div className="space-y-1 text-sm text-muted mb-3">
                  {d.licenseNumber && <p>Licencia: {d.licenseNumber}</p>}
                  {d.licenseExpiry && <p>Vence: {d.licenseExpiry}</p>}
                  {d.phone && <p>Tel: {d.phone}</p>}
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted">
                      Documentos del conductor ({totalDocs(driverItems, d.id)}/
                      {requiredDocs(driverItems)})
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedDriverForDocs(d)}
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded text-accent bg-accent-muted hover:bg-accent/20 transition-colors"
                    >
                      <Upload size={12} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {driverItems
                      .filter((i) => i.hasFile)
                      .map((item) => {
                        const count = countDocs(item.id, d.id)
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between text-xs py-0.5 ${
                              count > 0 ? 'text-success' : 'text-muted'
                            }`}
                          >
                            <span className="truncate mr-2">{item.name}</span>
                            <span className="shrink-0 font-medium">{count > 0 ? '✓' : '—'}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Client-level documents by category */}
      {(
        ['sat', 'imss_infonavit', 'persona_moral', 'personal', 'formatos_cliente', 'repse'] as const
      ).map((cat) => {
        const categoryItems = clientItems.filter((i) => i.category === cat)
        if (categoryItems.length === 0) return null
        const categoryConfig: Record<string, { label: string; icon: React.ReactNode }> = {
          sat: { label: 'Documentación SAT', icon: <FileText size={20} className="text-muted" /> },
          imss_infonavit: {
            label: 'IMSS e INFONAVIT',
            icon: <FileText size={20} className="text-muted" />,
          },
          persona_moral: {
            label: 'Documentación Persona Moral',
            icon: <FileText size={20} className="text-muted" />,
          },
          personal: {
            label: 'Documentación personal',
            icon: <FileText size={20} className="text-muted" />,
          },
          formatos_cliente: {
            label: 'Formatos del cliente',
            icon: <FileText size={20} className="text-muted" />,
          },
          repse: { label: 'REPSE', icon: <FileText size={20} className="text-muted" /> },
        }
        const cfg = categoryConfig[cat]
        const categoryDone = categoryItems.filter((i) => {
          if (isItemNa(i.id)) return true
          return countDocs(i.id) > 0
        }).length
        return (
          <section key={cat} className="mb-8">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              {cfg.icon}
              {cfg.label}
              <span className="text-sm font-normal text-muted ml-auto">
                {categoryDone}/{categoryItems.length}
              </span>
            </h2>
            <div className="space-y-2">
              {categoryItems.map((item) => {
                const na = isItemNa(item.id)
                const count = countDocs(item.id)
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      na ? 'bg-card/50 border-border/50 opacity-50' : 'bg-card border-border'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      {item.description && <p className="text-xs text-muted">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button
                        type="button"
                        className="p-1.5 rounded transition-colors text-muted hover:text-error hover:bg-error/10"
                        title={na ? 'Reactivar requisito' : 'Marcar como no aplica'}
                        onClick={() => toggleNa(item.id)}
                      >
                        <Ban size={14} />
                      </button>
                      {!na && (
                        <>
                          {count > 0 && (
                            <button
                              type="button"
                              className="p-1.5 rounded transition-colors text-foreground hover:bg-card-hover"
                              title="Ver documentos"
                              onClick={() => setViewDocsItem(item)}
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="p-1.5 rounded transition-colors text-accent bg-accent-muted"
                            title="Agregar documento"
                            onClick={() => setDocumentModalItem(item)}
                          >
                            <Upload size={14} />
                          </button>
                          {(() => {
                            if (!item.hasExpiry) {
                              return (
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded ${
                                    count > 0
                                      ? 'bg-success/10 text-success'
                                      : 'bg-warning/10 text-warning'
                                  }`}
                                >
                                  {count > 0 ? 'Completo' : 'Pendiente'}
                                </span>
                              )
                            }
                            const itemDocs = docsFor(item.id)
                            if (itemDocs.length === 0) {
                              return (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-warning/10 text-warning">
                                  Pendiente
                                </span>
                              )
                            }
                            const latest = itemDocs.sort(
                              (a, b) =>
                                new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
                            )[0]
                            const expired = latest.expiryDate
                              ? new Date(latest.expiryDate) < new Date()
                              : false
                            if (expired) {
                              return (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-error/10 text-error whitespace-nowrap">
                                  Documento vencido
                                </span>
                              )
                            }
                            return (
                              <span className="text-xs font-medium px-2 py-1 rounded bg-success/10 text-success">
                                Vigente
                              </span>
                            )
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Modals */}
      <VehicleFormModal
        open={vehicleModalOpen}
        editingVehicle={editingVehicle}
        onSave={handleSaveVehicle}
        onClose={() => {
          setVehicleModalOpen(false)
          setEditingVehicle(null)
        }}
      />

      <DriverFormModal
        open={driverModalOpen}
        editingDriver={editingDriver}
        onSave={handleSaveDriver}
        onClose={() => {
          setDriverModalOpen(false)
          setEditingDriver(null)
        }}
      />

      <ConfirmModal
        open={deleteVehicleId !== null}
        title="Eliminar vehículo"
        message="¿Estás seguro de que deseas eliminar este vehículo? Los documentos asociados se conservarán pero quedarán sin referencia."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (deleteVehicleId) {
            deleteVehicle.mutate(deleteVehicleId)
            setDeleteVehicleId(null)
          }
        }}
        onCancel={() => setDeleteVehicleId(null)}
        danger={true}
      />

      <ConfirmModal
        open={deleteDriverId !== null}
        title="Eliminar conductor"
        message="¿Estás seguro de que deseas eliminar este conductor? Los documentos asociados se conservarán pero quedarán sin referencia."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (deleteDriverId) {
            deleteDriver.mutate(deleteDriverId)
            setDeleteDriverId(null)
          }
        }}
        onCancel={() => setDeleteDriverId(null)}
        danger={true}
      />

      <DocumentListModal
        open={
          viewDocsItem !== null && selectedVehicleForDocs === null && selectedDriverForDocs === null
        }
        itemName={viewDocsItem?.name || ''}
        documents={
          viewDocsItem
            ? documents.filter((d) => d.itemId === viewDocsItem.id && !d.vehicleId && !d.driverId)
            : []
        }
        onDelete={(docId) => deleteDocument.mutate(docId)}
        onClose={() => setViewDocsItem(null)}
      />

      {/* Vehicle documents modal */}
      {selectedVehicleForDocs && (
        <Modal
          open
          title={`Documentos — ${selectedVehicleForDocs.brand} ${selectedVehicleForDocs.model}`}
          onClose={() => setSelectedVehicleForDocs(null)}
          maxWidth="max-w-3xl"
        >
          <div className="p-4 space-y-2">
            {getVehicleEntries().map((entry) => {
              if (entry.type === 'subitem') {
                const count = countSubitemDocs(entry.subitem.id, selectedVehicleForDocs.id)
                return (
                  <div
                    key={entry.subitem.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.subitem.name}</p>
                      {entry.item.description && (
                        <p className="text-xs text-muted">{entry.item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {count > 0 && (
                        <button
                          type="button"
                          className="p-1.5 rounded transition-colors text-foreground hover:bg-card-hover"
                          title="Ver documentos"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewSubitemDocs(entry.subitem)
                          }}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="p-1.5 rounded transition-colors text-accent bg-accent-muted"
                        title="Agregar documento"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDocumentModalItem(entry.item)
                          setDocumentModalSubitem(entry.subitem)
                        }}
                      >
                        <Upload size={14} />
                      </button>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          count > 0 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {count > 0 ? 'Completo' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                )
              }
              const count = countDocs(entry.item.id, selectedVehicleForDocs.id)
              return (
                <div
                  key={entry.item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card border-border"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.item.name}</p>
                    {entry.item.description && (
                      <p className="text-xs text-muted">{entry.item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {count > 0 && (
                      <button
                        type="button"
                        className="p-1.5 rounded transition-colors text-foreground hover:bg-card-hover"
                        title="Ver documentos"
                        onClick={(e) => {
                          e.stopPropagation()
                          setViewDocsItem(entry.item)
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="p-1.5 rounded transition-colors text-accent bg-accent-muted"
                      title="Agregar documento"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDocumentModalItem(entry.item)
                      }}
                    >
                      <Upload size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedVehicleForDocs(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Driver documents modal */}
      {selectedDriverForDocs && (
        <Modal
          open
          title={`Documentos — ${selectedDriverForDocs.name}`}
          onClose={() => {
            setSelectedDriverForDocs(null)
            setViewDocsItem(null)
          }}
          maxWidth="max-w-lg"
        >
          <div className="p-4 space-y-2">
            {driverItems
              .filter((i) => i.hasFile)
              .map((item) => {
                const count = countDocs(item.id, selectedDriverForDocs.id)
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      {item.description && <p className="text-xs text-muted">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {count > 0 && (
                        <button
                          type="button"
                          className="p-1.5 rounded transition-colors text-foreground hover:bg-card-hover"
                          title="Ver documentos"
                          onClick={() => setViewDocsItem(item)}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="p-1.5 rounded transition-colors text-accent bg-accent-muted"
                        title="Agregar documento"
                        onClick={() => setDocumentModalItem(item)}
                      >
                        <Upload size={14} />
                      </button>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          count > 0 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {count > 0 ? 'Completo' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                )
              })}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedDriverForDocs(null)
                  setViewDocsItem(null)
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Docs modal for vehicle context */}
      <DocumentListModal
        open={viewDocsItem !== null && selectedVehicleForDocs !== null && viewSubitemDocs === null}
        itemName={viewDocsItem?.name || ''}
        documents={
          viewDocsItem && selectedVehicleForDocs
            ? documents.filter(
                (d) => d.itemId === viewDocsItem.id && d.vehicleId === selectedVehicleForDocs.id,
              )
            : []
        }
        onDelete={(docId) => deleteDocument.mutate(docId)}
        onClose={() => setViewDocsItem(null)}
      />

      {/* View Docs modal for subitem context */}
      <DocumentListModal
        open={viewSubitemDocs !== null && selectedVehicleForDocs !== null}
        itemName={viewSubitemDocs?.name || ''}
        documents={
          viewSubitemDocs && selectedVehicleForDocs
            ? documents.filter(
                (d) =>
                  d.subitemId === viewSubitemDocs.id && d.vehicleId === selectedVehicleForDocs.id,
              )
            : []
        }
        onDelete={(docId) => deleteDocument.mutate(docId)}
        onClose={() => setViewSubitemDocs(null)}
      />

      {/* View Docs modal for driver context */}
      <DocumentListModal
        open={viewDocsItem !== null && selectedDriverForDocs !== null}
        itemName={viewDocsItem?.name || ''}
        documents={
          viewDocsItem && selectedDriverForDocs
            ? documents.filter(
                (d) => d.itemId === viewDocsItem.id && d.driverId === selectedDriverForDocs.id,
              )
            : []
        }
        onDelete={(docId) => deleteDocument.mutate(docId)}
        onClose={() => setViewDocsItem(null)}
      />

      <DocumentFormModal
        open={documentModalItem !== null}
        itemName={documentModalSubitem ? documentModalSubitem.name : documentModalItem?.name || ''}
        hasExpiry={documentModalItem?.hasExpiry ?? false}
        expiryWarnDays={documentModalItem?.code === 'comprobante_domicilio' ? 30 : undefined}
        onSave={(data: DocumentFormValues) => {
          if (!documentModalItem || !id) return
          createDocument.mutate({
            clientId: id,
            itemId: documentModalItem.id,
            subitemId: documentModalSubitem?.id || null,
            vehicleId: selectedVehicleForDocs?.id || null,
            driverId: selectedDriverForDocs?.id || null,
            fileUrl: data.fileUrl || null,
            notes: data.notes || null,
            expiryDate: data.expiryDate || null,
          })
        }}
        onClose={() => {
          setDocumentModalItem(null)
          setDocumentModalSubitem(null)
          setSelectedDriverForDocs(null)
        }}
      />
    </div>
  )
}
