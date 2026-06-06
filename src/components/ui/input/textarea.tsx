import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm transition-colors resize-vertical',
            'focus:outline-none focus:ring-2 focus:ring-[#0d1c2f]/20 focus:border-[#0d1c2f]',
            error ? 'border-red-500' : 'border-gray-300',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
