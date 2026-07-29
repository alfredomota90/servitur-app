import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const textareaVariants = cva(
  'w-full border rounded-lg text-sm transition-colors bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
  {
    variants: {
      size: {
        sm: 'px-2 py-1.5 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

interface TextareaProps
  extends ComponentPropsWithoutRef<'textarea'>, VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, size, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            textareaVariants({ size }),
            error ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
