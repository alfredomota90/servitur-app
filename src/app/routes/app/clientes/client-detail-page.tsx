import { zodResolver } from '@hookform/resolvers/zod'
import {
  DollarSign,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Pause,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

import BackHeader from '@/components/back-header'
import ConfirmModal from '@/components/confirm-modal'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useClients } from '@/features/clients/api'
import { useActiveInvoices, useInvoices } from '@/features/invoices/api'
import type { Project } from '@/features/projects/api'
import {
  useCreateProject,
  useDeleteProject,
  useProjectsByClient,
  useUpdateProject,
} from '@/features/projects/api'
import { fmtAmount } from '@/lib/utils'

const projectFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional().or(z.literal('')),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

const defaultProjectValues: ProjectFormValues = {
  name: '',
  description: '',
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjectsByClient(id)
  const { data: activeInvoices = [] } = useActiveInvoices()
  const { data: allInvoices = [] } = useInvoices()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [toggleStatusProject, setToggleStatusProject] = useState<Project | null>(null)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultProjectValues,
  })

  useEffect(() => {
    if (editingProject) {
      form.reset({
        name: editingProject.name,
        description: editingProject.description || '',
      })
    } else {
      form.reset(defaultProjectValues)
    }
  }, [editingProject, form])

  const client = clients.find((c) => c.id === id)

  const hasInactiveProjects = projects.some((p) => p.status === 'inactive')
  const visibleProjects = showInactive ? projects : projects.filter((p) => p.status === 'active')
  const invoices = showInactive ? allInvoices : activeInvoices

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted">Cliente no encontrado</p>
      </div>
    )
  }

  const handleSubmit = (values: ProjectFormValues) => {
    if (!id) return

    if (editingProject) {
      updateProject.mutate({
        id: editingProject.id,
        data: {
          name: values.name,
          description: values.description || undefined,
        },
      })
    } else {
      createProject.mutate({
        clientId: id,
        name: values.name,
        description: values.description || undefined,
      })
    }

    resetForm()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingProject(null)
    form.reset(defaultProjectValues)
  }

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProject(project)
    setShowForm(true)
  }

  const handleDelete = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirm(projectId)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteProject.mutate(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  const handleToggleStatus = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setToggleStatusProject(project)
  }

  const confirmToggleStatus = () => {
    if (toggleStatusProject) {
      updateProject.mutate({
        id: toggleStatusProject.id,
        data: {
          status: toggleStatusProject.status === 'active' ? 'inactive' : 'active',
        },
      })
      setToggleStatusProject(null)
    }
  }

  return (
    <>
      <BackHeader to="/admin/clientes" label="Volver a clientes" />
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <p className="text-sm text-muted">
              {client.email && <>{client.email} • </>}
              {client.phone}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={18} />
            <span className="hidden bp:inline ml-2">Agregar proyecto</span>
          </Button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="rounded-xl max-w-lg w-full bg-card">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-bold text-lg text-foreground">
                  {editingProject ? 'Editar proyecto' : 'Nuevo proyecto'}
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
                  label="Nombre del proyecto *"
                  placeholder="Ej: Transporte Q4 2026"
                  {...form.register('name')}
                  error={form.formState.errors.name?.message}
                />

                <Input
                  label="Descripción"
                  placeholder="Opcional"
                  {...form.register('description')}
                />

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    {editingProject ? 'Guardar cambios' : 'Agregar proyecto'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        )}

        {hasInactiveProjects && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border text-muted hover:text-foreground hover:bg-card-hover transition-colors"
            >
              {showInactive ? <EyeOff size={16} /> : <Eye size={16} />}
              {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {visibleProjects.map((project) => {
            const projectInvoices = invoices.filter((i) => i.projectId === project.id)
            const totalGenerated = projectInvoices.reduce(
              (sum, i) => sum + (i.totalMxn || i.total),
              0,
            )
            const totalPaid = projectInvoices
              .filter((i) => i.status === 'pagado')
              .reduce((sum, i) => sum + (i.totalMxn || i.total), 0)
            const pending = totalGenerated - totalPaid
            const pendingCount = projectInvoices.filter((i) => i.status === 'pendiente').length
            const isInactive = project.status === 'inactive'

            return (
              <div
                key={project.id}
                className={`rounded-xl p-5 shadow-sm transition-shadow flex flex-col h-full border ${
                  isInactive
                    ? 'bg-card/60 border-border opacity-70'
                    : 'bg-card border-border hover:shadow-md cursor-pointer'
                }`}
                onClick={
                  isInactive
                    ? undefined
                    : () => navigate(`/admin/clientes/${id}/proyectos/${project.id}`)
                }
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isInactive ? 'bg-muted/20' : 'bg-accent-muted'
                      }`}
                    >
                      <FolderOpen className={isInactive ? 'text-muted' : 'text-accent'} size={24} />
                    </div>

                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleEdit(project, e)}
                        className="p-1.5 rounded transition-colors text-accent bg-accent-muted"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleToggleStatus(project, e)}
                        className={`p-1.5 rounded transition-colors ${
                          isInactive ? 'text-success bg-success/10' : 'text-warning bg-warning/10'
                        }`}
                        title={isInactive ? 'Reactivar proyecto' : 'Desactivar proyecto'}
                      >
                        {isInactive ? <Play size={16} /> : <Pause size={16} />}
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-1.5 rounded transition-colors text-error bg-error/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-foreground">{project.name}</h3>
                    {isInactive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted/20 text-muted font-medium">
                        Inactivo
                      </span>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted mb-3">{project.description}</p>
                  )}

                  {pendingCount > 0 && (
                    <div className="mb-3 px-3 py-2 rounded-lg text-center bg-accent-muted">
                      <span className="font-bold text-accent-text">
                        {pendingCount} factura{pendingCount > 1 ? 's' : ''} pendiente
                        {pendingCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <FileText size={14} />
                        <span>
                          {projectInvoices.length} factura{projectInvoices.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <DollarSign size={14} />
                        <span>${fmtAmount(totalGenerated)}</span>
                      </div>
                    </div>
                    <div className="text-right mt-1">
                      {pending > 0 ? (
                        <span className="text-sm font-bold text-warning">
                          ${fmtAmount(pending)} pendiente
                        </span>
                      ) : projectInvoices.length > 0 ? (
                        <span className="text-sm font-bold text-success">Al día</span>
                      ) : (
                        <span className="text-sm text-muted">Sin facturas</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12 text-muted">
            <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No hay proyectos registrados</p>
            <p className="text-sm">Crea un proyecto para organizar las facturas de este cliente</p>
          </div>
        )}

        {projects.length > 0 && visibleProjects.length === 0 && (
          <div className="text-center py-12 text-muted">
            <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No hay proyectos activos</p>
            <p className="text-sm">Activa un proyecto existente o crea uno nuevo</p>
          </div>
        )}

        <ConfirmModal
          open={deleteConfirm !== null}
          title="Eliminar proyecto"
          message="¿Estás seguro de que deseas eliminar este proyecto? Las facturas asociadas no se eliminarán, pero perderán la referencia al proyecto."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          danger={true}
        />

        <ConfirmModal
          open={toggleStatusProject !== null}
          title={
            toggleStatusProject?.status === 'active' ? 'Desactivar proyecto' : 'Reactivar proyecto'
          }
          message={
            toggleStatusProject?.status === 'active'
              ? `¿Estás seguro de que deseas desactivar "${toggleStatusProject?.name}"? Sus facturas no aparecerán en las estadísticas ni en el selector de facturas nuevas.`
              : `¿Estás seguro de que deseas reactivar "${toggleStatusProject?.name}"? Sus facturas volverán a aparecer en las estadísticas.`
          }
          confirmLabel={toggleStatusProject?.status === 'active' ? 'Desactivar' : 'Reactivar'}
          cancelLabel="Cancelar"
          onConfirm={confirmToggleStatus}
          onCancel={() => setToggleStatusProject(null)}
          danger={toggleStatusProject?.status === 'active'}
        />
      </div>
    </>
  )
}
