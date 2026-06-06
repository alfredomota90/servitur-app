import { Image } from 'lucide-react'

interface AttachmentFieldProps {
  value: string
  fileName: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  inputRef?: React.Ref<HTMLInputElement>
  label?: string
}

export default function AttachmentField({
  value,
  fileName,
  onChange,
  onClear,
  inputRef,
  label = 'Comprobante',
}: AttachmentFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-foreground">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={onChange}
        className="w-full px-3 py-2 border rounded-lg text-sm bg-background text-foreground border-border"
      />
      {value && (
        <div className="mt-2 flex items-center gap-2 text-sm text-success">
          <Image size={16} />
          <span>{fileName || 'Comprobante adjunto'}</span>
          <button type="button" onClick={onClear} className="text-error hover:underline">
            Quitar
          </button>
        </div>
      )}
    </div>
  )
}
