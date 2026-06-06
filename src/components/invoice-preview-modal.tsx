import { Modal } from '@/components/ui/modal'

interface Props {
  url: string | null
  onClose: () => void
}

export default function InvoicePreviewModal({ url, onClose }: Props) {
  return (
    <Modal open={!!url} title="Vista previa de factura" onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-4">
        {url && <iframe src={url} className="w-full h-[70vh]" title="Factura PDF" />}
      </div>
    </Modal>
  )
}
