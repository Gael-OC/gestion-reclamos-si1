import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, CircleCheck, FileText, UserRoundCog } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useReclamosDemo } from '@/features/reclamos/demo/context'
import { EstadoBadge } from '@/features/reclamos/EstadoBadge'
import { PlazoChip } from '@/features/reclamos/PlazoChip'
import { PLAZO_DIAS } from '@/features/reclamos/estados'
import { COLOR_PLAZO, plazoUsado, tonoPlazo } from '@/features/reclamos/plazo'
import { detalleReclamo } from '@/features/reclamos/detalle/detalle'
import { Historial } from '@/features/reclamos/detalle/Historial'
import { RESPONSABLES } from '@/features/reclamos/listado/mockData'
import { AsignarDialog } from '@/features/supervision/AsignarDialog'
import { EQUIPO } from '@/features/supervision/escenario'
import { diaRelativo } from '@/lib/fechas'

/** Ficha e historial de un reclamo para la supervisión. */
export function ReclamoDetallePage() {
  const { reclamoId = '' } = useParams()
  // La clave reinicia el estado de la demo al cambiar de reclamo.
  return <ReclamoDetalle key={reclamoId} reclamoId={reclamoId} />
}

function ReclamoDetalle({ reclamoId }: { reclamoId: string }) {
  const { reclamos } = useReclamosDemo()
  const detalle = detalleReclamo(reclamoId, reclamos, RESPONSABLES)
  const [cambio, setCambio] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)

  if (!detalle) {
    return (
      <div className="grid flex-1 place-items-center">
        <Glass className="max-w-md text-center">
          <h1 className="text-display">No encontramos ese reclamo</h1>
          <p className="mt-2 text-ink-muted">
            Revise el folio {reclamoId} o búsquelo en el listado.
          </p>
          <Link
            to="/reclamos"
            className="mt-4 inline-block font-medium text-brand"
          >
            Ir a reclamos
          </Link>
        </Glass>
      </div>
    )
  }

  const responsable = cambio ?? detalle.responsable
  const persona = EQUIPO.find((item) => item.nombre === responsable)
  const historial = cambio
    ? [
        ...detalle.historial.filter((evento) => evento.tipo !== 'hoy'),
        {
          fecha: diaRelativo(0),
          titulo: `Reasignado a ${cambio}`,
          detalle: 'Andrea Fuentes',
          tipo: 'gestion' as const,
        },
        ...detalle.historial.filter((evento) => evento.tipo === 'hoy'),
      ]
    : detalle.historial
  const activo = detalle.dias !== null
  const dias = detalle.dias ?? 0
  const usado = Math.round(plazoUsado(dias))

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <Link
            to="/reclamos"
            className="inline-flex items-center gap-1 text-caption font-medium text-brand"
          >
            <ArrowLeft size={14} aria-hidden /> Reclamos
          </Link>
          <div className="flex flex-wrap items-baseline gap-x-4">
            <h1 className="text-display">{detalle.asunto}</h1>
            <span className="text-id font-mono text-ink-muted">
              {detalle.id}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EstadoBadge estado={detalle.estado} short />
          {activo && <PlazoChip dias={dias} />}
          {activo && (
            <Button
              variant="ink"
              icon={UserRoundCog}
              onClick={() => setAbierto(true)}
            >
              Reasignar
            </Button>
          )}
        </div>
      </header>
      <p role="status" aria-live="polite" className="sr-only">
        {cambio ? `El caso quedó a cargo de ${cambio}.` : ''}
      </p>
      {cambio && (
        <div className="glass-strong flex items-center gap-2.5 self-start rounded-full px-4 py-2 text-caption font-medium text-success">
          <CircleCheck size={16} aria-hidden /> El caso quedó a cargo de{' '}
          {cambio}. Recibirá un aviso.
        </div>
      )}

      <div className="grid flex-1 gap-6 *:min-w-0 md:grid-cols-2 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-[auto_minmax(0,1fr)] compact:gap-5">
        <Glass
          title="Historial"
          subtitle="Más reciente abajo · las notas con borde punteado no las ve el consumidor"
          className="md:col-span-2 lg:row-span-2 tall:min-h-0 tall:overflow-y-auto compact:p-4"
        >
          <Historial eventos={historial} />
        </Glass>

        <Glass
          title="Plazo y responsable"
          className="flex flex-col gap-4 compact:p-4 [&>header]:mb-0"
        >
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-4">
            <div
              role="img"
              aria-label={
                activo
                  ? `Plazo usado: ${usado} %`
                  : 'Caso terminado, sin plazo en curso'
              }
              className="relative size-28"
            >
              <svg viewBox="0 0 120 120" aria-hidden className="-rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  strokeWidth="12"
                  style={{ stroke: 'var(--color-glass-shade)' }}
                />
                {activo && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    strokeWidth="12"
                    strokeLinecap="round"
                    pathLength={100}
                    strokeDasharray={`${Math.max(3, usado)} 100`}
                    style={{ stroke: COLOR_PLAZO[tonoPlazo(dias)] }}
                  />
                )}
              </svg>
              <span className="absolute inset-0 grid place-items-center text-center">
                <span>
                  <span className="text-metric">
                    {activo ? Math.min(PLAZO_DIAS, PLAZO_DIAS - dias) : '—'}
                  </span>
                  <span className="block text-caption text-ink-muted">
                    de {PLAZO_DIAS} días
                  </span>
                </span>
              </span>
            </div>
            <dl className="flex flex-col gap-1.5">
              <div>
                <dt className="text-caption text-ink-muted">Ingreso</dt>
                <dd className="font-medium">{detalle.fechaIngreso}</dd>
              </div>
              <div>
                <dt className="text-caption text-ink-muted">Fecha límite</dt>
                <dd className="font-medium">{detalle.fechaLimite}</dd>
              </div>
            </dl>
          </div>
          <div className="glass-tile flex items-center gap-3 px-3 py-2.5">
            {responsable ? (
              <>
                <Avatar name={responsable} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{responsable}</span>
                  {persona && (
                    <span className="text-caption text-ink-muted">
                      {persona.activos} casos activos
                    </span>
                  )}
                </span>
              </>
            ) : (
              <span className="flex-1 text-caption text-ink-muted">
                Sin responsable
              </span>
            )}
            {activo && (
              <Button size="sm" onClick={() => setAbierto(true)}>
                Cambiar
              </Button>
            )}
          </div>
        </Glass>

        <Glass
          title="Datos del reclamo"
          className="flex flex-col gap-3 tall:min-h-0 tall:overflow-y-auto compact:p-4 [&>header]:mb-0"
        >
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {[
              ['Consumidor', detalle.consumidor],
              ['Comuna', detalle.comuna],
              ['Empresa', detalle.empresa],
              ['Mercado', detalle.mercado],
            ].map(([dt, dd]) => (
              <div key={dt}>
                <dt className="text-caption text-ink-muted">{dt}</dt>
                <dd className="font-medium">{dd}</dd>
              </div>
            ))}
          </dl>
          <p className="text-caption text-ink-muted">{detalle.relato}</p>
          {detalle.adjuntos.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2">
              {detalle.adjuntos.map((archivo) => (
                <span key={archivo} className="pill pill-neutral">
                  <FileText size={13} aria-hidden /> {archivo}
                </span>
              ))}
            </div>
          )}
        </Glass>
      </div>

      {abierto && (
        <AsignarDialog
          open
          onClose={() => setAbierto(false)}
          title={responsable ? 'Cambiar responsable' : 'Asignar responsable'}
          description={`${detalle.id} · ${detalle.asunto}`}
          desdeId={persona?.id ?? detalle.responsableId}
          onConfirm={(destino) => {
            setCambio(destino.nombre)
            setAbierto(false)
          }}
        />
      )}
    </div>
  )
}
