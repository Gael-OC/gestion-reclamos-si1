import { ArrowUpRight, Building2, CalendarDays } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoBadge } from '@/features/reclamos/EstadoBadge'
import { cn } from '@/lib/cn'
import {
  fechaVisible,
  type ReclamoListado,
} from '@/features/reclamos/listado/model'

export function ReclamoClienteCard({
  reclamo,
  compacto = false,
}: {
  reclamo: ReclamoListado
  compacto?: boolean
}) {
  return (
    <Link
      to={`/portal/reclamos/${reclamo.id}`}
      className={cn(
        'group flex min-w-0 flex-col gap-4 rounded-lg p-5 transition-[background-color,box-shadow] hover:bg-glass-strong hover:shadow-lift',
        compacto ? 'glass-tile p-4' : 'glass-panel',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-id text-ink-muted">{reclamo.id}</span>
        <EstadoBadge estado={reclamo.estado} short />
      </div>
      <div className="flex-1">
        <h2 className="text-title break-words">{reclamo.asunto}</h2>
        <p className="mt-2 flex items-start gap-2 text-body text-ink-muted">
          <Building2 size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span className="min-w-0 break-words">{reclamo.empresa}</span>
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-glass-shade pt-4">
        <p className="flex items-center gap-1.5 text-caption text-ink-muted">
          <CalendarDays size={14} aria-hidden />
          {fechaVisible(reclamo.fechaIngreso)}
        </p>
        <span className="flex items-center gap-1 text-caption font-medium text-brand">
          Ver detalle
          <ArrowUpRight size={16} aria-hidden />
        </span>
      </div>
    </Link>
  )
}
