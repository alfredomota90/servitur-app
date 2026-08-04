import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

import { useStore } from '@/store/use-store'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap = {
  success: 'text-green-500 bg-green-50 border-green-200',
  error: 'text-red-500 bg-red-50 border-red-200',
  info: 'text-blue-500 bg-blue-50 border-blue-200',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
}

export function ToastContainer() {
  const { toasts, removeToast } = useStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type]
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm ${colorMap[toast.type]}`}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded hover:opacity-70"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
