import { ArrowRight, FileText, MessageSquareText, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { Glass } from '@/components/ui/Glass'
import { PageHeading } from '@/components/layout/PageHeading'
import { useAuth } from '@/features/auth/context'
import { useMisReclamos } from '@/features/cliente/useMisReclamos'
import { ReclamoClienteCard } from '@/features/cliente/ReclamoClienteCard'
import { ETAPAS, indiceEtapa } from '@/features/cliente/etapas'
import { cn } from '@/lib/cn'

export function ClienteInicioPage() {
  const { usuario } = useAuth()
  const { reclamos, activos, cerrados, pendientes } = useMisReclamos()
  const porEtapa = ETAPAS.map((label, index) => ({
    label,
    reclamos: reclamos.filter((row) => indiceEtapa(row.estado) === index),
  }))
  return (
    <div className="flex flex-1 flex-col gap-6 compact:gap-5">
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
      <div className="grid flex-1 gap-6 lg:grid-cols-[1.25fr_1fr] lg:grid-rows-[auto_minmax(0,1fr)] compact:gap-5">
        <Glass
          className="flex flex-col"
          title="Dónde están tus reclamos"
          subtitle={`${activos.length} en seguimiento · ${cerrados.length} ${cerrados.length === 1 ? 'cerrado' : 'cerrados'} · cada punto es un reclamo`}
        >
          <ol
            aria-label="Reclamos por etapa"
            className="grid flex-1 grid-cols-5 items-end gap-4"
          >
            {porEtapa.map((etapa) => (
              <li
                key={etapa.label}
                className="flex min-w-0 flex-col gap-3 compact:gap-2"
              >
                <span
                  className={cn(
                    'text-metric',
                    !etapa.reclamos.length && 'text-ink-muted/50',
                  )}
                >
                  {etapa.reclamos.length}
                </span>
                <span className="flex min-h-5 flex-wrap content-end gap-2">
                  {etapa.reclamos.map((row) => (
                    <Link
                      key={row.id}
                      to={`/portal/reclamos/${row.id}`}
                      title={`${row.id} · ${row.asunto}`}
                      aria-label={`${row.id}: ${row.asunto}`}
                      className={cn(
                        'size-5 rounded-full shadow-tile transition-transform hover:scale-125',
                        row.estado === 'cerrado'
                          ? 'bg-radial-[at_35%_30%] from-[color-mix(in_srgb,var(--color-success)_45%,white)] to-success'
                          : 'bg-radial-[at_35%_30%] from-brand-glow to-brand',
                      )}
                    />
                  ))}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'h-2 rounded-full',
                    etapa.reclamos.length
                      ? 'bg-linear-to-r from-brand-glow to-brand'
                      : 'bg-glass-shade',
                  )}
                />
                <span className="truncate text-label text-ink-muted">
                  {etapa.label}
                </span>
              </li>
            ))}
          </ol>
        </Glass>
        <Glass className="flex flex-col justify-center gap-5">
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
                    ? 'Tus reclamos están cerrados'
                    : 'Todavía no hay reclamos'}
              </h2>
              <p className="text-body text-ink-muted">
                {activos.length
                  ? 'No hay solicitudes de antecedentes pendientes. Puedes consultar las novedades de cada caso.'
                  : reclamos.length
                    ? 'Puedes revisar los resultados y el historial desde tu listado.'
                    : 'Al registrar un reclamo podrás consultar su estado y aportar antecedentes.'}
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
        <Glass className="flex flex-col lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-1 compact:mb-3">
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
            <div className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reclamos.slice(0, 3).map((row) => (
                <ReclamoClienteCard key={row.id} reclamo={row} compacto />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
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
    </div>
  )
}
