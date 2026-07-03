import { DollarSign, TrendingUp, FileText } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useClients } from '@/features/clients/api'
import { useInvoices } from '@/features/invoices/api'
import { fmtDate } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Period = 'week' | 'month' | 'year'

const PERIODS: Period[] = ['week', 'month', 'year']

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Semana',
  month: 'Mes',
  year: 'Año',
}

function formatDateLabel(date: Date, period: Period): string {
  if (period === 'year') {
    return date.toLocaleDateString('es-MX', { month: 'short' })
  }
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg p-3 shadow-lg text-sm bg-card border border-border text-foreground">
      <p className="mb-2 text-muted">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2">
          <span style={{ color: entry.name === 'facturado' ? 'var(--accent)' : 'var(--success)' }}>
            {entry.name === 'facturado' ? 'Facturado' : 'Pagado'}:
          </span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { data: invoices = [] } = useInvoices()
  const { data: clients = [] } = useClients()
  const [period, setPeriod] = useState<Period>('month')
  const [selectedClientId, setSelectedClientId] = useState<string>('')

  const filteredInvoices = useMemo(() => {
    if (!selectedClientId) return invoices
    return invoices.filter((i) => i.clientId === selectedClientId)
  }, [invoices, selectedClientId])

  const datePoints = useMemo(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    if (period === 'week') {
      start.setDate(start.getDate() - 6)
    } else if (period === 'month') {
      start.setDate(start.getDate() - 29)
    } else {
      start.setMonth(start.getMonth() - 11)
      start.setDate(1)
    }

    const points: Date[] = []
    const current = new Date(start)
    while (current <= end) {
      points.push(new Date(current))
      if (period === 'year') {
        current.setMonth(current.getMonth() + 1)
      } else {
        current.setDate(current.getDate() + 1)
      }
    }
    return points
  }, [period])

  const chartData = useMemo(() => {
    return datePoints.map((dp) => {
      const facturado = filteredInvoices.reduce((sum, inv) => {
        const invDate = new Date(inv.tripDate || inv.createdAt)
        if (period === 'year') {
          if (invDate.getMonth() === dp.getMonth() && invDate.getFullYear() === dp.getFullYear()) {
            return sum + (inv.totalMxn || inv.total)
          }
        } else {
          if (invDate.toDateString() === dp.toDateString()) {
            return sum + (inv.totalMxn || inv.total)
          }
        }
        return sum
      }, 0)

      const pagado = filteredInvoices.reduce((sum, inv) => {
        if (inv.status !== 'pagado') return sum
        const payDate = new Date(inv.paymentDate || inv.createdAt)
        if (period === 'year') {
          if (payDate.getMonth() === dp.getMonth() && payDate.getFullYear() === dp.getFullYear()) {
            return sum + (inv.totalMxn || inv.total)
          }
        } else {
          if (payDate.toDateString() === dp.toDateString()) {
            return sum + (inv.totalMxn || inv.total)
          }
        }
        return sum
      }, 0)

      return {
        date: formatDateLabel(dp, period),
        facturado,
        pagado,
      }
    })
  }, [datePoints, filteredInvoices, period])

  const totalIncome = filteredInvoices.reduce((sum, inv) => sum + (inv.totalMxn || inv.total), 0)
  const totalPaid = filteredInvoices
    .filter((inv) => inv.status === 'pagado')
    .reduce((sum, inv) => sum + (inv.totalMxn || inv.total), 0)
  const pendingIncome = totalIncome - totalPaid

  const lastInvoices = useMemo(() => {
    return [...filteredInvoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [filteredInvoices])

  const stats = [
    {
      label: 'Facturado',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: 'var(--accent)',
    },
    {
      label: 'Pagado',
      value: formatCurrency(totalPaid),
      icon: DollarSign,
      color: 'var(--success)',
    },
    {
      label: 'Pendiente',
      value: formatCurrency(pendingIncome),
      icon: FileText,
      color: 'var(--warning)',
    },
  ]

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">Resumen de tu negocio de transporte</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-lg overflow-hidden border border-border">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === p ? 'bg-accent text-background' : ''
              }`}
            >
              <span className={period !== p ? 'text-muted' : ''}>{PERIOD_LABELS[p]}</span>
            </button>
          ))}
        </div>

        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-card border-border text-foreground"
        >
          <option value="">Todos los clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl p-4 mb-6 bg-card">
        {chartData.some((d) => d.facturado > 0 || d.pagado > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="facturado"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                name="facturado"
              />
              <Line
                type="monotone"
                dataKey="pagado"
                stroke="var(--success)"
                strokeWidth={2}
                dot={false}
                name="pagado"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted">
            No hay datos en este período
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">{stat.label}</span>
              <stat.icon size={16} style={{ color: stat.color }} />
            </div>
            <p className="text-xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden shadow-sm mb-6 bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Últimas Facturas</h2>
        </div>
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
          <table className="w-full text-sm">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-4 py-2 text-left text-muted">Cliente</th>
                <th className="px-4 py-2 text-left text-muted">Folio</th>
                <th className="px-4 py-2 text-left text-muted">Fecha</th>
                <th className="px-4 py-2 text-right text-muted">Monto</th>
              </tr>
            </thead>
            <tbody>
              {lastInvoices.map((inv) => (
                <tr key={inv.id} className="border-t border-border">
                  <td className="px-4 py-2 text-foreground">{inv.clientName}</td>
                  <td className="px-4 py-2 text-muted">{inv.serieFolio || '-'}</td>
                  <td className="px-4 py-2 text-muted">{fmtDate(inv.createdAt)}</td>
                  <td className="px-4 py-2 text-right font-medium text-success">
                    $
                    {(inv.totalMxn || inv.total).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
              {lastInvoices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No hay facturas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
