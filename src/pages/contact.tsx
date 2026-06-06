import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Send, Loader2, CheckCircle } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export default function Contact() {
  const { colors } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    origin: '',
    destination: '',
    passengers: '1-10',
    tripType: 'one-way',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="rounded-2xl p-8 max-w-md w-full text-center shadow-sm"
          style={{ backgroundColor: colors.card }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(74, 222, 128, 0.15)' }}
          >
            <CheckCircle style={{ color: colors.success }} size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            ¡Mensaje enviado!
          </h2>
          <p className="mb-6" style={{ color: colors.textMuted }}>
            Gracias por contactarnos. Nos pondremos en contacto contigo en breve para darte tu
            cotización.
          </p>
          <Link to="/" className="font-medium hover:underline" style={{ color: colors.accent }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 md:pb-0 min-h-screen">
      <header
        className="shadow-sm sticky top-0 z-40"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-medium transition-colors"
            style={{ color: colors.textMuted }}
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.text }}>
          Contacto & Cotización
        </h1>
        <p className="mb-10 max-w-2xl" style={{ color: colors.textMuted }}>
          ¿Necesitas cotización para un viaje? Completa el formulario y te contactaremos.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div
              className="rounded-xl p-6 shadow-sm border"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <h3 className="font-bold mb-4" style={{ color: colors.text }}>
                Información de contacto
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.accentMuted }}
                  >
                    <Phone style={{ color: colors.accent }} size={20} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      Teléfono
                    </p>
                    <p className="font-medium" style={{ color: colors.text }}>
                      618 123 4567
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.accentMuted }}
                  >
                    <Mail style={{ color: colors.accent }} size={20} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      Email
                    </p>
                    <p className="font-medium" style={{ color: colors.text }}>
                      servitur@transporte.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.accentMuted }}
                  >
                    <MapPin style={{ color: colors.accent }} size={20} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      Ubicación
                    </p>
                    <p className="font-medium" style={{ color: colors.text }}>
                      Durango, Durango, México
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-6 text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`,
              }}
            >
              <h3 className="font-bold text-lg mb-2">¿Por qué cotizar con nosotros?</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>✓ Respuesta rápida</li>
                <li>✓ Precios competitivos</li>
                <li>✓ Unidades en excelente estado</li>
                <li>✓ Choferes profesionales</li>
              </ul>
            </div>
          </div>

          <div
            className="rounded-xl p-6 shadow-sm border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                    placeholder="618 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Empresa (opcional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                    placeholder="Nombre de tu empresa"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4" style={{ color: colors.text }}>
                  Detalles del viaje
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.text }}
                    >
                      Origen *
                    </label>
                    <input
                      type="text"
                      name="origin"
                      required
                      value={formData.origin}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                      placeholder="Ciudad de origen"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.text }}
                    >
                      Destino *
                    </label>
                    <input
                      type="text"
                      name="destination"
                      required
                      value={formData.destination}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                      placeholder="Ciudad de destino"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.text }}
                    >
                      Pasajeros
                    </label>
                    <select
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    >
                      <option value="1-10">1-10 pasajeros</option>
                      <option value="11-20">11-20 pasajeros</option>
                      <option value="21-30">21-30 pasajeros</option>
                      <option value="30+">Más de 30</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.text }}
                    >
                      Tipo de viaje
                    </label>
                    <select
                      name="tripType"
                      value={formData.tripType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    >
                      <option value="one-way">Solo ida</option>
                      <option value="round-trip">Ida y vuelta</option>
                      <option value="recurring">Recurrente</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                  Mensaje adicional
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  placeholder="Comentarios adicionales sobre tu viaje..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                style={{
                  backgroundColor: isSubmitting ? colors.textMuted : colors.accent,
                  color: colors.background,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Solicitar Cotización
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
