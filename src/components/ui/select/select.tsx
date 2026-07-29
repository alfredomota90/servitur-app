import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const selectVariants = cva(
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

interface SelectProps
  extends Omit<ComponentPropsWithoutRef<'select'>, 'size'>, VariantProps<typeof selectVariants> {
  label?: string
  error?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, placeholder, children, size, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            selectVariants({ size }),
            error ? 'border-error' : 'border-border',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
