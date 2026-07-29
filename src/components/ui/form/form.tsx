import { createContext, type ReactNode, useContext } from 'react'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { cn } from '@/utils/cn'

const FormContext = createContext<UseFormReturn<FieldValues> | null>(null)

export function useFormContext<T extends FieldValues>() {
  const ctx = useContext(FormContext) as unknown as UseFormReturn<T> | null
  if (!ctx) throw new Error('Form field must be used within a Form')
  return ctx
}

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (values: T) => void
  children: ReactNode
  className?: string
}

export function Form<T extends FieldValues>({ form, onSubmit, children, className }: FormProps<T>) {
  return (
    <FormContext.Provider value={form as unknown as UseFormReturn<FieldValues>}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
        {children}
      </form>
    </FormContext.Provider>
  )
}

export type FormFieldErrorProps = {
  name: Path<FieldValues>
}

export function FormFieldError({ name }: FormFieldErrorProps) {
  const form = useFormContext()
  const error = form.formState.errors[name]
  if (!error?.message) return null
  return <p className="text-xs text-error">{String(error.message)}</p>
}
