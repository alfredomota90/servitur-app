import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleSubmit = async (values: LoginFormValues) => {
    const { error } = await signIn(values.email, values.password)

    if (error) {
      form.setError('root', { message: 'Email o contraseña incorrectos' })
    } else {
      navigate('/admin')
    }
  }

  const error = form.formState.errors.root?.message

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md rounded-xl p-8 bg-card border border-border">
        <div className="text-center mb-8">
          <img
            src={`${import.meta.env.BASE_URL}serviturlogo.png`}
            alt="SERVITUR"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">Iniciar Sesión</h1>
          <p className="text-muted">Accede al panel de administración</p>
        </div>

        <Form form={form} onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 text-error text-sm">
              <LogIn size={18} />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={form.formState.isSubmitting}>
            Iniciar Sesión
          </Button>
        </Form>

        <p className="mt-6 text-center text-sm text-muted">Solo usuarios autorizados</p>
      </div>
    </div>
  )
}
