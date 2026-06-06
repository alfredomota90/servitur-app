import { useState } from 'react'

export function useDeleteConfirm(onDelete: (id: string) => void) {
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    id: string | null
  }>({ open: false, id: null })

  const handleDelete = (invoiceId: string) => {
    setDeleteModal({ open: true, id: invoiceId })
  }

  const confirmDelete = () => {
    if (deleteModal.id) onDelete(deleteModal.id)
    setDeleteModal({ open: false, id: null })
  }

  const cancelDelete = () => setDeleteModal({ open: false, id: null })

  return { deleteModal, handleDelete, confirmDelete, cancelDelete }
}
