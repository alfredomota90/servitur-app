import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

function sanitize(str: unknown): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/\0/g, '')
    .replace(/\.\.\//g, '')
    .replace(/[-;]{2,}/g, '')
    .replace(/\\/g, '')
    .trim()
    .slice(0, 1000)
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string): boolean {
  return /^\d{10}$/.test(phone)
}

function validateName(name: string): boolean {
  return /^[a-zA-ZáéíóúñÑüÜ\s'-]{2,100}$/.test(name)
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    const name = sanitize(body.name)
    const email = sanitize(body.email)
    const phone = sanitize(body.phone)
    const company = sanitize(body.company)
    const origin = sanitize(body.origin)
    const destination = sanitize(body.destination)
    const passengers = sanitize(body.passengers)
    const tripType = sanitize(body.tripType)
    const message = sanitize(body.message)

    if (!validateName(name)) {
      return new Response(JSON.stringify({ success: false, error: 'Nombre inválido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Email inválido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!validatePhone(phone)) {
      return new Response(JSON.stringify({ success: false, error: 'Teléfono inválido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!validateName(origin) || !validateName(destination)) {
      return new Response(JSON.stringify({ success: false, error: 'Origen o destino inválido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!['1-10', '11-20', '21-30', '30+'].includes(passengers)) {
      return new Response(JSON.stringify({ success: false, error: 'Pasajeros inválidos' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!['one-way', 'round-trip', 'recurring'].includes(tripType)) {
      return new Response(JSON.stringify({ success: false, error: 'Tipo de viaje inválido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (company && company.length > 100) {
      return new Response(JSON.stringify({ success: false, error: 'Empresa demasiado larga' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (message && message.length > 500) {
      return new Response(JSON.stringify({ success: false, error: 'Mensaje demasiado largo' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const whatsappApi = 'https://api.callmebot.com/whatsapp.php'
    const whatsappPhone = Deno.env.get('WHATSAPP_PHONE')
    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY')

    if (!whatsappPhone || !whatsappApiKey) {
      throw new Error('WhatsApp configuration missing')
    }

    const tripTypeLabel: Record<string, string> = {
      'one-way': 'Solo ida',
      'round-trip': 'Ida y vuelta',
      recurring: 'Recurrente',
    }

    const text =
      `*Solicitud de Cotización*\n\n` +
      `*Nombre:* ${name}\n` +
      `*Email:* ${email}\n` +
      `*Teléfono:* ${phone}\n` +
      (company ? `*Empresa:* ${company}\n` : '') +
      `\n*Detalles del viaje*\n` +
      `*Origen:* ${origin}\n` +
      `*Destino:* ${destination}\n` +
      `*Pasajeros:* ${passengers}\n` +
      `*Tipo:* ${tripTypeLabel[tripType] || tripType}\n` +
      (message ? `\n*Mensaje:* ${message}` : '')

    const url = `${whatsappApi}?phone=${whatsappPhone}&text=${encodeURIComponent(text)}&apikey=${whatsappApiKey}`

    const response = await fetch(url)
    const html = await response.text()

    const success = html.includes('Message queued')

    return new Response(JSON.stringify({ success }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: success ? 200 : 500,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
