import { Clock3, TriangleAlert } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { PlazoChip } from '@/features/reclamos/PlazoChip'
import { alertasPlazo, requierenAtencion } from '@/features/dashboard/mockData'

type DeadlineCardProps = { vencidos?: boolean; className?: string }

/** Totales del escenario más un extracto de casos para contextualizarlos. */
export function DeadlineCard({
  vencidos = false,
  className,
}: DeadlineCardProps) {
  const Icon = vencidos ? TriangleAlert : Clock3
  const total = vencidos ? alertasPlazo.vencidos : alertasPlazo.proximos
  const filas = requierenAtencion.filter((row) =>
    vencidos ? row.dias < 0 : row.dias >= 0 && row.dias <= 3,
  )
  return (
    <Glass
      title={
        vencidos ? 'Reclamos activos vencidos' : 'Reclamos próximos a vencer'
      }
      subtitle={vencidos ? 'KPI 6' : 'KPI 4'}
      className={`flex min-h-[230px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-2 ${className ?? ''}`}
    >
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(7.5rem,0.6fr)_1.6fr] items-center gap-5">
        <div className="flex flex-col items-center gap-1 self-stretch border-r border-glass-shade pr-5 text-center justify-center">
          <span
            className={`pill ${vencidos ? 'pill-danger' : 'pill-warning'} size-10 justify-center p-0`}
          >
            <Icon size={18} aria-hidden />
          </span>
          <span className="text-hero-number compact:text-metric">{total}</span>
          <span className="text-caption text-ink-muted">
            {vencidos ? 'vencidos' : 'próximos a vencer'}
          </span>
        </div>
        <ul
          className="flex min-w-0 flex-col flex-wrap content-start self-stretch overflow-hidden"
          aria-label={
            vencidos
              ? 'Muestra de casos por días de atraso'
              : 'Muestra de casos próximos a vencer'
          }
        >
          {filas.map((row) => (
            <li
              key={row.id}
              className="flex w-full items-center justify-between gap-3 border-b border-glass-shade py-1.5 last:border-0 compact:py-[3px]"
            >
              <div className="min-w-0">
                <p className="text-id whitespace-nowrap">{row.id}</p>
                <p className="truncate text-caption text-ink-muted">
                  {row.responsable}
                </p>
              </div>
              <PlazoChip dias={row.dias} className="w-40 shrink-0" />
            </li>
          ))}
        </ul>
      </div>
    </Glass>
  )
}
