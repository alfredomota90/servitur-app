import { ExternalLink, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { Document } from '@/features/requirements/api'
import { fmtDate } from '@/lib/utils'

function getExpiryStatus(expiryDate: string | null | undefined): {
  label: string
  variant: 'success' | 'warning' | 'error' | 'muted'
} | null {
  if (!expiryDate) return null
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) {
    return { label: `Vencido hace ${Math.abs(diffDays)} días`, variant: 'error' }
  }
  if (diffDays === 0) return { label: 'Vence hoy', variant: 'warning' }
  if (diffDays <= 30) return { label: `Vence en ${diffDays} días`, variant: 'warning' }
  return { label: 'Vigente', variant: 'success' }
}

interface DocumentListModalProps {
  open: boolean
  itemName: string
  documents: Document[]
  onDelete: (docId: string) => void
  onClose: () => void
}

export function DocumentListModal({
  open,
  itemName,
  documents,
  onDelete,
  onClose,
}: DocumentListModalProps) {
  return (
    <Modal open={open} title={`Documentos — ${itemName}`} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-4">
        {documents.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">Sin documentos subidos</p>
        ) : (
          <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-muted font-medium w-10">URL</th>
                  <th className="text-left py-2 px-2 text-muted font-medium">Notas</th>
                  <th className="text-left py-2 px-2 text-muted font-medium">Vencimiento</th>
                  <th className="text-left py-2 px-2 text-muted font-medium">Estado</th>
                  <th className="text-left py-2 px-2 text-muted font-medium">Subido</th>
                  <th className="py-2 px-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const status = getExpiryStatus(doc.expiryDate)
                  return (
                    <tr key={doc.id} className="border-b border-border/50 hover:bg-card-hover/50">
                      <td className="py-2.5 px-2 text-center">
                        {doc.fileUrl ? (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex p-1.5 rounded text-accent hover:bg-accent-muted transition-colors"
                            title="Abrir documento"
                          >
                            <ExternalLink size={16} />
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-muted whitespace-pre-wrap break-words min-w-[200px]">
                        {doc.notes || '—'}
                      </td>
                      <td className="py-2.5 px-2 text-muted whitespace-nowrap">
                        {doc.expiryDate ? fmtDate(doc.expiryDate) : '—'}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        {status ? (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              status.variant === 'error'
                                ? 'bg-error/10 text-error'
                                : status.variant === 'warning'
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-success/10 text-success'
                            }`}
                          >
                            {status.label}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-muted whitespace-nowrap">
                        {fmtDate(doc.uploadedAt)}
                      </td>
                      <td className="py-2.5 px-2">
                        <button
                          type="button"
                          onClick={() => onDelete(doc.id)}
                          className="p-1.5 rounded transition-colors text-muted hover:text-error hover:bg-error/10"
                          title="Eliminar documento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
