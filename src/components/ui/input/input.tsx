import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const inputVariants = cva(
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

interface InputProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'size'>, VariantProps<typeof inputVariants> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, size, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            inputVariants({ size }),
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
Input.displayName = 'Input'
