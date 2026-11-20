import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoBadge } from '@/features/reclamos/EstadoBadge'
import {
  fechaVisible,
  type ReclamoListado,
} from '@/features/reclamos/listado/model'
import { cn } from '@/lib/cn'
import { ETAPAS, indiceEtapa } from './etapas'

/** Fila del listado «Mis reclamos»: folio, asunto, etapa y estado. */
export function ReclamoClienteFila({ reclamo }: { reclamo: ReclamoListado }) {
  const etapa = indiceEtapa(reclamo.estado)
  return (
    <Link
      to={`/portal/reclamos/${reclamo.id}`}
      className="group grid grid-cols-[8rem_minmax(0,1fr)_11rem_12rem_6.5rem_2.25rem] items-center gap-5 rounded-md px-4 py-3 transition-colors hover:bg-glass-tile"
    >
      <span className="font-mono text-id text-ink-muted">{reclamo.id}</span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{reclamo.asunto}</span>
        <span className="block truncate text-caption text-ink-muted">
          {reclamo.empresa}
        </span>
      </span>
      <span className="min-w-0">
        {etapa >= 0 ? (
          <>
            <span aria-hidden className="grid grid-cols-5 gap-1">
              {ETAPAS.map((label, index) => (
                <span
                  key={label}
                  className={cn(
                    'h-1.5 rounded-full',
                    index <= etapa ? 'bg-brand' : 'bg-glass-shade',
                  )}
                />
              ))}
            </span>
            <span className="mt-1.5 block text-caption text-ink-muted">
              {ETAPAS[etapa]}
            </span>
          </>
        ) : (
          <span className="text-caption text-ink-muted">Sin etapa</span>
        )}
      </span>
      <span className="justify-self-start">
        <EstadoBadge estado={reclamo.estado} short />
      </span>
      <span className="text-caption text-ink-muted">
        {fechaVisible(reclamo.fechaIngreso)}
      </span>
      <span className="grid size-9 place-items-center rounded-full border border-glass-rim bg-glass-strong transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
        <ArrowRight size={15} strokeWidth={1.8} aria-hidden />
      </span>
    </Link>
  )
}
