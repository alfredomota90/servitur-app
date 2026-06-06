import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  label?: string
  error?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, placeholder, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#0d1c2f]/20 focus:border-[#0d1c2f]',
            error ? 'border-red-500' : 'border-gray-300',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
