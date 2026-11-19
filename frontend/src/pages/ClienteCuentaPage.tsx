import { Link } from 'react-router'
import { ArrowRight, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Glass } from '@/components/ui/Glass'
import { PageHeading } from '@/components/layout/PageHeading'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/context'

export function ClienteCuentaPage() {
  const { usuario, cerrarSesion } = useAuth()
  if (!usuario) return null
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Mi cuenta"
        subtitle="Información de tu acceso al portal"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Glass className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Avatar name={usuario.nombre} size={56} />
            <div>
              <h2 className="text-title break-words">{usuario.nombre}</h2>
              <span className="mt-2 inline-flex items-center gap-1.5 text-caption text-brand">
                <ShieldCheck size={15} aria-hidden />
                Perfil de cliente
              </span>
            </div>
          </div>
          <dl className="mt-8 space-y-5">
            <div>
              <dt className="flex items-center gap-2 text-caption text-ink-muted">
                <UserRound size={15} aria-hidden />
                Nombre y apellido
              </dt>
              <dd className="mt-2 text-body break-words">{usuario.nombre}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-caption text-ink-muted">
                <Mail size={15} aria-hidden />
                Correo electrónico
              </dt>
              <dd className="mt-2 text-body break-all">{usuario.email}</dd>
            </div>
          </dl>
          <Button variant="glass" className="mt-8" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </Glass>
        <Glass className="flex flex-col items-start justify-center p-6 sm:p-8">
          <h2 className="text-title">Tu historial en un solo lugar</h2>
          <p className="mt-3 max-w-md text-body text-ink-muted">
            Desde tu cuenta puedes consultar tus reclamos, revisar respuestas y
            aportar antecedentes a los casos en seguimiento.
          </p>
          <Link
            to="/portal/reclamos"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-label text-on-ink"
          >
            Ir a mis reclamos
            <ArrowRight size={16} aria-hidden />
          </Link>
        </Glass>
      </div>
    </div>
  )
}
