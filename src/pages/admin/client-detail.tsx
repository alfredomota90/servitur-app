import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useClients } from '@/features/clients/api'
import {
  useProjectsByClient,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/features/projects/api'
import type { Project } from '@/features/projects/api'
import { useInvoices } from '@/features/invoices/api'
import BackHeader from '@/components/back-header'
import ConfirmModal from '@/components/confirm-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form } from '@/components/ui/form'
import { Plus, FolderOpen, Edit2, Trash2, X, FileText, DollarSign } from 'lucide-react'
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
  const { data: invoices = [] } = useInvoices()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

  return (
    <div className="p-4 md:p-6">
      <BackHeader to="/admin/clientes" label="Volver a clientes" />

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

              <Input label="Descripción" placeholder="Opcional" {...form.register('description')} />

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {projects.map((project) => {
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

          return (
            <div
              key={project.id}
              className="rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full bg-card border border-border"
              onClick={() => navigate(`/admin/clientes/${id}/proyectos/${project.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-accent-muted">
                    <FolderOpen className="text-accent" size={24} />
                  </div>

                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleEdit(project, e)}
                      className="p-1.5 rounded transition-colors text-accent bg-accent-muted"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="p-1.5 rounded transition-colors text-error bg-error/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1 text-foreground">{project.name}</h3>

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
    </div>
  )
}
