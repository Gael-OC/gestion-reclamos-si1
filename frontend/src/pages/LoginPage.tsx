import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { PasswordField } from '@/features/auth/PasswordField'
import { useAuth } from '@/features/auth/context'
import { emailValido, inicioPorRol } from '@/features/auth/model'
import { InformacionSernac } from '@/features/auth/InformacionSernac'

export function LoginPage() {
  const { usuario, iniciarSesion } = useAuth()
  const [ingresando, setIngresando] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState<{
    email?: string
    password?: string
    acceso?: string
  }>({})
  if (usuario) return <Navigate to={inicioPorRol(usuario.rol)} replace />

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (ingresando) return
    const campos = new FormData(event.currentTarget)
    const correo = String(campos.get('login-email') ?? '')
    const clave = String(campos.get('login-password') ?? '')
    setEmail(correo)
    setPassword(clave)
    const next = {
      email: emailValido(correo)
        ? undefined
        : 'Ingresa un correo electrónico válido.',
      password: clave ? undefined : 'Ingresa tu contraseña.',
    }
    setErrores(next)
    if (next.email || next.password) {
      document
        .getElementById(next.email ? 'login-email' : 'login-password')
        ?.focus()
      return
    }
    setIngresando(true)
    const resultado = await iniciarSesion(correo, clave)
    setIngresando(false)
    if (!resultado.ok) setErrores({ acceso: resultado.error })
  }

  return (
    <AuthLayout informacion={<InformacionSernac />}>
      <h1 className="text-display tall:text-[2.125rem] tall:leading-10">
        Iniciar sesión
      </h1>
      <form
        onSubmit={enviar}
        noValidate
        className="mt-5 space-y-4 sm:mt-6 md:space-y-5 md:[&_input]:h-12 [&_label]:text-label"
      >
        <TextField
          id="login-email"
          label="Correo electrónico"
          type="email"
          autoComplete="username"
          value={email}
          onValueChange={(value) => {
            setEmail(value)
            setErrores({})
          }}
          placeholder="nombre@correo.cl"
          required
          error={errores.email}
          maxLength={254}
        />
        <div>
          <PasswordField
            id="login-password"
            value={password}
            onValueChange={(value) => {
              setPassword(value)
              setErrores({})
            }}
            error={errores.password}
            toggleClassName="md:top-8"
          />
          <div className="mt-2 flex justify-end">
            <Link
              to="/recuperar-acceso"
              className="rounded-sm text-label text-brand underline-offset-4 hover:underline"
            >
              Recuperar acceso
            </Link>
          </div>
        </div>
        {errores.acceso && (
          <p role="alert" className="text-caption text-danger">
            {errores.acceso}
          </p>
        )}
        <Button
          type="submit"
          variant="ink"
          iconRight={ArrowRight}
          className="w-full md:h-12"
          disabled={ingresando}
        >
          {ingresando ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 border-t border-glass-rim pt-4 text-label sm:mt-6 sm:pt-5">
        <span className="text-ink-muted">¿No tienes cuenta?</span>
        <Link
          to="/registro"
          className="rounded-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          Crear cuenta
        </Link>
      </div>
    </AuthLayout>
  )
}
