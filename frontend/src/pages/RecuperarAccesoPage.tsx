import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { useAuth } from '@/features/auth/context'
import { emailValido, inicioPorRol } from '@/features/auth/model'

export function RecuperarAccesoPage() {
  const { usuario } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [solicitado, setSolicitado] = useState(false)
  if (usuario) return <Navigate to={inicioPorRol(usuario.rol)} replace />

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!emailValido(email)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    setSolicitado(true)
  }

  return (
    <AuthLayout>
      <span className="glass-tile mb-5 grid size-12 place-items-center rounded-full text-brand">
        <KeyRound size={23} aria-hidden />
      </span>
      <h1 className="text-display">Recupera tu acceso</h1>
      {solicitado ? (
        <div role="status" className="mt-5 space-y-4">
          <p className="text-body">
            Solicitud preparada para{' '}
            <span className="font-medium break-all">{email.trim()}</span>.
          </p>
          <p className="text-body text-ink-muted">
            El envío del enlace y el cambio de contraseña requieren la conexión
            con la API. Esta vista no envía correos.
          </p>
        </div>
      ) : (
        <form noValidate onSubmit={enviar} className="mt-5 space-y-5">
          <p className="text-body text-ink-muted">
            Ingresa el correo asociado a tu cuenta.
          </p>
          <TextField
            id="recuperar-email"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={email}
            onValueChange={(value) => {
              setEmail(value)
              setError('')
            }}
            required
            error={error}
            maxLength={254}
          />
          <Button type="submit" variant="ink" className="w-full">
            Solicitar recuperación
          </Button>
          <p className="text-caption text-ink-muted">
            El envío de correos estará disponible al conectar la API.
          </p>
        </form>
      )}
      <Link
        to="/login"
        className="mt-6 inline-flex w-fit items-center gap-2 rounded-sm text-label text-brand hover:underline"
      >
        <ArrowLeft size={16} aria-hidden />
        Volver al inicio de sesión
      </Link>
    </AuthLayout>
  )
}
