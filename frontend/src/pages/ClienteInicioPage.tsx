import {
  ArrowRight,
  CircleCheck,
  Clock3,
  FileText,
  MessageSquareText,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router'
import { Glass } from '@/components/ui/Glass'
import { PageHeading } from '@/components/layout/PageHeading'
import { useAuth } from '@/features/auth/context'
import { useMisReclamos } from '@/features/cliente/useMisReclamos'
import { ReclamoClienteCard } from '@/features/cliente/ReclamoClienteCard'

export function ClienteInicioPage() {
  const { usuario } = useAuth()
  const { reclamos, activos, cerrados, pendientes } = useMisReclamos()
  const stats = [
    {
      label: 'Mis reclamos',
      count: reclamos.length,
      icon: FileText,
      to: '/portal/reclamos',
    },
    {
      label: 'En seguimiento',
      count: activos.length,
      icon: Clock3,
      to: '/portal/reclamos?estado=activos',
    },
    {
      label: 'Cerrados',
      count: cerrados.length,
      icon: CircleCheck,
      to: '/portal/reclamos?estado=cerrado',
    },
  ]
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={`Hola, ${usuario?.nombre.split(' ')[0] ?? ''}`}
        action={
          <Link
            to="/portal/reclamos/nuevo"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-label text-on-ink shadow-ink hover:bg-ink-soft"
          >
            <Plus size={17} aria-hidden /> Nuevo reclamo
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Glass title="Resumen de mis reclamos">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, count, icon: Icon, to }) => (
              <Link
                to={to}
                key={label}
                className="glass-tile flex flex-wrap items-center justify-between gap-3 rounded-md p-4 transition-colors hover:bg-glass-strong"
              >
                <div>
                  <p className="text-caption text-ink-muted">{label}</p>
                  <p className="mt-2 text-metric">{count}</p>
                </div>
                <span className="glass-tile grid size-12 place-items-center rounded-full text-brand">
                  <Icon size={22} strokeWidth={1.5} aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </Glass>
        <Glass className="flex flex-col justify-center gap-4">
          {pendientes.length > 0 ? (
            <>
              <div className="flex items-start gap-3">
                <MessageSquareText
                  size={21}
                  className="mt-0.5 shrink-0 text-warning"
                  aria-hidden
                />
                <div>
                  <h2 className="text-title">
                    {pendientes.length === 1
                      ? 'Tienes una solicitud de antecedentes'
                      : `Tienes ${pendientes.length} solicitudes de antecedentes`}
                  </h2>
                  <p className="mt-1 text-body text-ink-muted">
                    Revisa lo solicitado para continuar con la gestión de tu
                    caso.
                  </p>
                </div>
              </div>
              <Link
                to={`/portal/reclamos/${pendientes[0].id}`}
                className="inline-flex items-center gap-2 rounded-full bg-glass-strong px-4 py-2.5 text-label shadow-tile"
              >
                Revisar solicitud
                <ArrowRight size={16} aria-hidden />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-title">
                {activos.length
                  ? 'Seguimiento al día'
                  : reclamos.length
                    ? 'Sus reclamos están cerrados'
                    : 'Todavía no hay reclamos'}
              </h2>
              <p className="text-body text-ink-muted">
                {activos.length
                  ? 'No hay solicitudes de antecedentes pendientes. Puede consultar las novedades de cada caso.'
                  : reclamos.length
                    ? 'Puede revisar los resultados y el historial desde su listado.'
                    : 'Al registrar un reclamo podrá consultar su estado y aportar antecedentes.'}
              </p>
              {reclamos.length > 0 && (
                <Link
                  to="/portal/reclamos"
                  className="flex items-center gap-2 text-label text-brand"
                >
                  Ver mis reclamos <ArrowRight size={16} aria-hidden />
                </Link>
              )}
            </>
          )}
        </Glass>
      </div>
      <Glass>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-1">
          <h2 className="text-title">Tus reclamos recientes</h2>
          {reclamos.length > 0 && (
            <Link
              to="/portal/reclamos"
              className="flex items-center gap-1 rounded-sm text-label text-brand hover:underline"
            >
              Ver todos
              <ArrowRight size={15} aria-hidden />
            </Link>
          )}
        </div>
        {reclamos.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reclamos.slice(0, 3).map((row) => (
              <ReclamoClienteCard key={row.id} reclamo={row} compacto />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="glass-tile grid size-14 place-items-center rounded-full text-brand">
              <FileText size={26} strokeWidth={1.5} aria-hidden />
            </span>
            <h2 className="text-title">Tu primer reclamo comienza aquí</h2>
            <p className="max-w-md text-body text-ink-muted">
              Cuando registres un caso, podrás consultar su estado y sus
              novedades en este espacio.
            </p>
            <Link
              to="/portal/reclamos/nuevo"
              className="glass-tile mt-2 inline-flex items-center gap-2 rounded-full px-5 py-3 text-label"
            >
              <Plus size={16} aria-hidden />
              Crear mi primer reclamo
            </Link>
          </div>
        )}
      </Glass>
    </div>
  )
}
