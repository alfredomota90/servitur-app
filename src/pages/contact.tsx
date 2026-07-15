import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle } from 'lucide-react'
import BackHeader from '@/components/back-header'

export default function Contact() {
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="rounded-2xl p-8 max-w-md w-full text-center shadow-sm bg-card">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-success/15">
            <CheckCircle className="text-success" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">¡Mensaje enviado!</h2>
          <p className="mb-6 text-muted">
            Gracias por contactarnos. Nos pondremos en contacto contigo en breve para darte tu
            cotización.
          </p>
          <Link to="/" className="font-medium hover:underline text-accent">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 md:pb-0 min-h-screen">
      <BackHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Contacto & Cotización
        </h1>
        <p className="mb-10 max-w-2xl text-muted">
          ¿Necesitas cotización para un viaje? Completa el formulario y te contactaremos.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-xl p-6 shadow-sm border bg-card border-border">
              <h3 className="font-bold mb-4 text-foreground">Información de contacto</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-muted">
                    <Phone className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted">Teléfono</p>
                    <p className="font-medium text-foreground">618 123 4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-muted">
                    <Mail className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted">Email</p>
                    <p className="font-medium text-foreground">servitur@transporte.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-muted">
                    <MapPin className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted">Ubicación</p>
                    <p className="font-medium text-foreground">Durango, Durango, México</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 text-background bg-gradient-to-br from-accent to-accent-hover">
              <h3 className="font-bold text-lg mb-2">¿Por qué cotizar con nosotros?</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>✓ Respuesta rápida</li>
                <li>✓ Precios competitivos</li>
                <li>✓ Unidades en excelente estado</li>
                <li>✓ Choferes profesionales</li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl p-6 shadow-sm border bg-card border-border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Nombre *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border bg-background border-border text-foreground"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border bg-background border-border text-foreground"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border bg-background border-border text-foreground"
                    placeholder="618 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Empresa (opcional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border bg-background border-border text-foreground"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-4 text-foreground">Detalles del viaje</h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Origen *
                    </label>
                    <input
                      type="text"
                      name="origin"
                      required
                      value={formData.origin}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border bg-background border-border text-foreground"
                      placeholder="Ciudad de origen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Destino *
                    </label>
                    <input
                      type="text"
                      name="destination"
                      required
                      value={formData.destination}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border bg-background border-border text-foreground"
                      placeholder="Ciudad de destino"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Pasajeros
                    </label>
                    <select
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border bg-background border-border text-foreground"
                    >
                      <option value="1-10">1-10 pasajeros</option>
                      <option value="11-20">11-20 pasajeros</option>
                      <option value="21-30">21-30 pasajeros</option>
                      <option value="30+">Más de 30</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Tipo de viaje
                    </label>
                    <select
                      name="tripType"
                      value={formData.tripType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border bg-background border-border text-foreground"
                    >
                      <option value="one-way">Solo ida</option>
                      <option value="round-trip">Ida y vuelta</option>
                      <option value="recurring">Recurrente</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Mensaje adicional
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border bg-background border-border text-foreground"
                  placeholder="Comentarios adicionales sobre tu viaje..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-background ${
                  isSubmitting ? 'bg-muted' : 'bg-accent'
                }`}
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
