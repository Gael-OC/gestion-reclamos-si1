import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  BellRing,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Glass } from '@/components/ui/Glass'
import { Switch } from '@/components/ui/Switch'
import { PageHeading } from '@/components/layout/PageHeading'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/context'

const AVISOS = [
  {
    id: 'estado',
    titulo: 'Cambios de estado',
    texto: 'Cuando tu reclamo avance de etapa.',
  },
  {
    id: 'antecedentes',
    titulo: 'Solicitudes de antecedentes',
    texto: 'Cuando la supervisión necesite más información.',
  },
  {
    id: 'resultado',
    titulo: 'Resultado del reclamo',
    texto: 'Cuando se publique el resultado y el cierre.',
  },
] as const

export function ClienteCuentaPage() {
  const { usuario, cerrarSesion } = useAuth()
  const [avisos, setAvisos] = useState<Record<string, boolean>>({
    estado: true,
    antecedentes: true,
    resultado: true,
  })
  if (!usuario) return null
  return (
    <div className="flex flex-1 flex-col gap-6 compact:gap-5">
      <PageHeading
        title="Mi cuenta"
        subtitle="Información de tu acceso al portal"
      />
      <div className="grid flex-1 gap-6 lg:grid-cols-[1.2fr_1fr] compact:gap-5">
        <Glass className="flex flex-col justify-between gap-8 p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <Avatar name={usuario.nombre} size={72} />
            <div>
              <h2 className="text-display break-words">{usuario.nombre}</h2>
              <span className="mt-2 inline-flex items-center gap-1.5 text-caption text-brand">
                <ShieldCheck size={15} aria-hidden />
                Perfil de cliente · solo ves tus propios reclamos
              </span>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="glass-tile p-4">
              <dt className="flex items-center gap-2 text-caption text-ink-muted">
                <UserRound size={15} aria-hidden />
                Nombre y apellido
              </dt>
              <dd className="mt-2 text-title break-words">{usuario.nombre}</dd>
            </div>
            <div className="glass-tile p-4">
              <dt className="flex items-center gap-2 text-caption text-ink-muted">
                <Mail size={15} aria-hidden />
                Correo electrónico
              </dt>
              <dd className="mt-2 text-title break-all">{usuario.email}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 border-t border-glass-shade pt-6">
            <Link
              to="/portal/reclamos"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-label text-on-ink shadow-ink hover:bg-ink-soft"
            >
              Ir a mis reclamos
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Button variant="glass" onClick={cerrarSesion}>
              Cerrar sesión
            </Button>
          </div>
        </Glass>
        <Glass
          title="Avisos por correo"
          subtitle="Elige qué novedades de tus reclamos quieres recibir"
          className="flex flex-col p-6 sm:p-8"
        >
          <ul className="flex flex-1 flex-col gap-3">
            {AVISOS.map((aviso) => (
              <li
                key={aviso.id}
                className="glass-tile flex flex-1 items-center gap-4 p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-mist text-brand">
                  <BellRing size={18} strokeWidth={1.6} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span id={`aviso-${aviso.id}`} className="block font-medium">
                    {aviso.titulo}
                  </span>
                  <span className="text-caption text-ink-muted">
                    {aviso.texto}
                  </span>
                </span>
                <Switch
                  checked={avisos[aviso.id]}
                  onChange={(valor) =>
                    setAvisos((prev) => ({ ...prev, [aviso.id]: valor }))
                  }
                  labelledBy={`aviso-${aviso.id}`}
                />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-caption text-ink-muted">
            Demostración: la preferencia no se guarda ni se envían correos hasta
            conectar la API.
          </p>
        </Glass>
      </div>
    </div>
  )
}
