import { cn } from '@/lib/cn'
import type { EventoHistorial, TipoEvento } from './detalle'

const punto: Record<TipoEvento, string> = {
  sistema: 'bg-orb-pizarra',
  gestion: 'bg-brand',
  empresa: 'bg-data-teal',
  nota: 'bg-ink-muted',
  hoy: 'bg-warning',
}

type HistorialProps = {
  eventos: EventoHistorial[]
  className?: string
}

/**
 * Línea de tiempo del caso, del ingreso a hoy. Las notas internas van con
 * borde punteado: el consumidor no las ve en el portal.
 */
export function Historial({ eventos, className }: HistorialProps) {
  return (
    <ol className={cn('flex flex-col', className)}>
      {eventos.map((evento, index) => (
        <li
          key={`${index}-${evento.registradoEn ?? evento.fecha}-${evento.titulo}`}
          className="relative grid grid-cols-[3.75rem_1.375rem_minmax(0,1fr)] gap-3 pb-4 last:pb-0"
        >
          {index < eventos.length - 1 && (
            <span
              aria-hidden
              className="absolute top-6 -bottom-0.5 left-[5.25rem] w-0.5 rounded-full bg-glass-shade"
            />
          )}
          <span
            className={cn(
              'pt-0.5 text-id font-mono',
              evento.tipo === 'hoy' ? 'text-warning' : 'text-ink-muted',
            )}
          >
            {evento.fecha}
          </span>
          <span
            aria-hidden
            className={cn(
              'grid size-5.5 place-items-center rounded-full border bg-glass-strong shadow-tile',
              evento.tipo === 'nota'
                ? 'border-dashed border-ink-muted/40'
                : 'border-glass-rim',
              evento.tipo === 'hoy' &&
                'shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-warning)_14%,transparent)]',
            )}
          >
            <span className={cn('size-2 rounded-full', punto[evento.tipo])} />
          </span>
          <div
            className={cn(
              evento.tipo === 'nota' &&
                'rounded-sm border border-dashed border-ink-muted/40 bg-glass-tile px-3 py-2',
            )}
          >
            <p
              className={cn(
                'font-medium',
                evento.tipo === 'hoy' && 'text-warning',
              )}
            >
              {evento.titulo}
            </p>
            <p className="text-caption text-ink-muted">{evento.detalle}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
