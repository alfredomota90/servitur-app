import { X } from 'lucide-react'
import { forwardRef, useEffect, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/utils/cn'

interface ModalProps extends ComponentPropsWithoutRef<'div'> {
  open: boolean
  title: string
  onClose: () => void
  maxWidth?: string
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, title, onClose, children, className, maxWidth = 'max-w-lg', ...props }, ref) => {
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
      return () => {
        document.body.style.overflow = ''
      }
    }, [open])

    useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      if (open) {
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
      }
      return undefined
    }, [open, onClose])

    if (!open) return null

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          ref={ref}
          className={cn(
            'rounded-xl w-full max-h-[90vh] overflow-y-auto bg-card',
            maxWidth,
            className,
          )}
          {...props}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-bold text-lg text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-card-hover rounded text-foreground"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    )
  },
)
Modal.displayName = 'Modal'
