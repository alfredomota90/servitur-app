import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Facebook, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import BackHeader from '@/components/back-header'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input/textarea'
import { Select } from '@/components/ui/select'
import { supabaseUrl } from '@/lib/supabase'

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[a-zA-ZáéíóúñÑüÜ\s'-]+$/, 'Solo letras, espacios, guiones y apóstrofes'),
  email: z.string().trim().email('Email inválido').max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Ingresa 10 dígitos'),
  company: z.string().trim().max(100, 'Máximo 100 caracteres').optional(),
  origin: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[a-zA-ZáéíóúñÑüÜ\s'-]+$/, 'Solo letras, espacios, guiones y apóstrofes'),
  destination: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[a-zA-ZáéíóúñÑüÜ\s'-]+$/, 'Solo letras, espacios, guiones y apóstrofes'),
  passengers: z.enum(['1-10', '11-20', '21-30', '30+']),
  tripType: z.enum(['one-way', 'round-trip', 'recurring']),
  message: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

const defaultValues: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  company: '',
  origin: '',
  destination: '',
  passengers: '1-10',
  tripType: 'one-way',
  message: '',
}

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  })

  const handleSubmit = async (values: ContactFormValues) => {
    const url = `${supabaseUrl}/functions/v1/smooth-responder`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(values),
    })
    const data = await res.json()

    if (data.success) {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="rounded-2xl p-8 max-w-md w-full text-center shadow-sm bg-card">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-success/15">
            <CheckCircle className="text-success" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">¡Solicitud enviada!</h2>
          <p className="mb-6 text-muted">
            En breve recibirás la cotización con todos los datos de tu viaje mediante WhatsApp y
            correo electronico
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
                    <p className="font-medium text-foreground">618 132 5365</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-muted">
                    <Mail className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted">Email</p>
                    <p className="font-medium text-foreground">servitur.durango@gmail.com</p>
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

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-muted">
                    <Facebook className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted">Facebook</p>
                    <a
                      href="https://www.facebook.com/people/Serv%C3%ADturem/100095711310870/?rdid=Iz4mdRIDwU2WSMes&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F14oQktkmAo4%2F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline text-accent"
                    >
                      SERVITUR
                    </a>
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
            <Form form={form} onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nombre *"
                  placeholder="Tu nombre"
                  error={form.formState.errors.name?.message}
                  {...form.register('name')}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="tu@email.com"
                  error={form.formState.errors.email?.message}
                  {...form.register('email')}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Teléfono *"
                  type="tel"
                  placeholder="618 123 4567"
                  error={form.formState.errors.phone?.message}
                  {...form.register('phone')}
                />
                <Input
                  label="Empresa (opcional)"
                  placeholder="Nombre de tu empresa"
                  {...form.register('company')}
                />
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-4 text-foreground">Detalles del viaje</h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Origen *"
                    placeholder="Ciudad de origen"
                    error={form.formState.errors.origin?.message}
                    {...form.register('origin')}
                  />
                  <Input
                    label="Destino *"
                    placeholder="Ciudad de destino"
                    error={form.formState.errors.destination?.message}
                    {...form.register('destination')}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Select
                    label="Pasajeros"
                    error={form.formState.errors.passengers?.message}
                    {...form.register('passengers')}
                  >
                    <option value="1-10">1-10 pasajeros</option>
                    <option value="11-20">11-20 pasajeros</option>
                    <option value="21-30">21-30 pasajeros</option>
                    <option value="30+">Más de 30</option>
                  </Select>

                  <Select
                    label="Tipo de viaje"
                    error={form.formState.errors.tripType?.message}
                    {...form.register('tripType')}
                  >
                    <option value="one-way">Solo ida</option>
                    <option value="round-trip">Ida y vuelta</option>
                    <option value="recurring">Recurrente</option>
                  </Select>
                </div>
              </div>

              <Textarea
                label="Mensaje adicional"
                rows={3}
                placeholder="Comentarios adicionales sobre tu viaje..."
                {...form.register('message')}
              />

              <Button type="submit" className="w-full" isLoading={form.formState.isSubmitting}>
                Solicitar Cotización
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
