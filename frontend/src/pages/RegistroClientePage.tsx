import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { PasswordField } from '@/features/auth/PasswordField'
import { useAuth } from '@/features/auth/context'
import { emailValido, inicioPorRol } from '@/features/auth/model'

export function RegistroClientePage() {
  const { usuario, registrarCliente } = useAuth()
  const [datos, setDatos] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmar: '',
  })
  const [errores, setErrores] = useState<
    Partial<Record<keyof typeof datos | 'cuenta', string>>
  >({})
  const [registrando, setRegistrando] = useState(false)
  if (usuario) return <Navigate to={inicioPorRol(usuario.rol)} replace />

  function cambiar(campo: keyof typeof datos, value: string) {
    setDatos((prev) => ({ ...prev, [campo]: value }))
    setErrores((prev) => ({ ...prev, [campo]: undefined, cuenta: undefined }))
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (registrando) return
    const next: typeof errores = {}
    if (datos.nombre.trim().length < 3)
      next.nombre = 'Ingresa tu nombre y apellido.'
    if (!emailValido(datos.email))
      next.email = 'Ingresa un correo electrónico válido.'
    if (
      datos.password.length < 8 ||
      !/[a-zA-Z]/.test(datos.password) ||
      !/\d/.test(datos.password)
    )
      next.password = 'Usa al menos 8 caracteres, con letras y números.'
    if (!datos.confirmar || datos.password !== datos.confirmar)
      next.confirmar = 'Las contraseñas deben coincidir.'
    setErrores(next)
    const primero = Object.keys(next)[0]
    if (primero) {
      document.getElementById(`registro-${primero}`)?.focus()
      return
    }
    setRegistrando(true)
    const resultado = await registrarCliente(
      datos.nombre,
      datos.email,
      datos.password,
    )
    setRegistrando(false)
    if (!resultado.ok) setErrores({ cuenta: resultado.error })
  }

  return (
    <AuthLayout>
      <p className="text-caption font-medium text-brand">PORTAL DEL CLIENTE</p>
      <h1 className="mt-2 text-display">Crea tu cuenta</h1>
      <p className="mt-2 text-body text-ink-muted">
        Un espacio para registrar tus reclamos y seguir sus avances.
      </p>
      <form noValidate onSubmit={enviar} className="mt-6 space-y-4">
        <TextField
          id="registro-nombre"
          label="Nombre y apellido"
          autoComplete="name"
          value={datos.nombre}
          onValueChange={(v) => cambiar('nombre', v)}
          required
          maxLength={100}
          error={errores.nombre}
        />
        <TextField
          id="registro-email"
          label="Correo electrónico"
          type="email"
          autoComplete="username"
          value={datos.email}
          onValueChange={(v) => cambiar('email', v)}
          required
          maxLength={254}
          error={errores.email}
        />
        <PasswordField
          id="registro-password"
          value={datos.password}
          onValueChange={(v) => cambiar('password', v)}
          autoComplete="new-password"
          error={errores.password}
          hint="Al menos 8 caracteres, con letras y números."
        />
        <PasswordField
          id="registro-confirmar"
          label="Confirmar contraseña"
          value={datos.confirmar}
          onValueChange={(v) => cambiar('confirmar', v)}
          autoComplete="new-password"
          error={errores.confirmar}
        />
        {errores.cuenta && (
          <p role="alert" className="text-caption text-danger">
            {errores.cuenta}
          </p>
        )}
        <Button
          variant="ink"
          type="submit"
          iconRight={ArrowRight}
          className="w-full"
          disabled={registrando}
        >
          {registrando ? 'Creando cuenta…' : 'Crear cuenta y continuar'}
        </Button>
      </form>
      <p className="mt-5 text-center text-caption text-ink-muted">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
