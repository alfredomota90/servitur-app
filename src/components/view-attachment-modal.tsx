import { Modal } from '@/components/ui/modal'

interface ViewAttachmentModalProps {
  attachment: string | null
  onClose: () => void
}

export default function ViewAttachmentModal({ attachment, onClose }: ViewAttachmentModalProps) {
  return (
    <Modal open={!!attachment} title="Comprobante de pago" onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-4">
        {attachment?.startsWith('data:application/pdf') ? (
          <iframe src={attachment} className="w-full h-[60vh]" title="PDF" />
        ) : (
          <img src={attachment || ''} alt="Comprobante" className="max-w-full" />
        )}
      </div>
    </Modal>
  )
}
