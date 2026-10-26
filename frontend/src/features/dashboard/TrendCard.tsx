import { Fragment, useId, type ReactNode } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { cn } from '@/lib/cn'

type TrendCardProps = {
  title: string
  /** Rótulo del indicador y su período, por ejemplo "KPI 3 · Septiembre 2026". */
  subtitle: string
  value: number
  unit?: string
  /** Mejora respecto del período anterior, con el sentido de la variación. */
  delta?: { text: string; direction: 'up' | 'down' }
  points: number[]
  /** Rótulo del eje para cada punto (un mes). */
  labels: string[]
  format: (value: number) => string
  footer?: ReactNode
  className?: string
}

const W = 320
const H = 130
const PAD = 14

/** Curva suave (Catmull-Rom → Bézier) que pasa por todos los puntos. */
function smoothPath(points: [number, number][]) {
  if (points.length < 2) return ''
  let d = `M${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

/**
 * Indicador estático: cifra, variación y una línea de tendencia con un punto
 * por mes. Los extremos llevan su valor; los demás lo muestran al apuntarlos.
 */
export function TrendCard({
  title,
  subtitle,
  value,
  unit,
  delta,
  points,
  labels,
  format,
  footer,
  className,
}: TrendCardProps) {
  const id = useId().replaceAll(':', '')

  const min = Math.min(...points)
  const max = Math.max(...points)
  const xy = points.map((point, index): [number, number] => [
    PAD + (index * (W - 2 * PAD)) / Math.max(1, points.length - 1),
    H - PAD - ((point - min) / Math.max(1e-6, max - min)) * (H - 2 * PAD - 20),
  ])
  const line = smoothPath(xy)
  const last = xy.length - 1
  const area = `${line} L${xy[last][0]} ${H} L${xy[0][0]} ${H} Z`
  const DeltaIcon = delta?.direction === 'down' ? ArrowDown : ArrowUp

  return (
    <Glass
      title={title}
      subtitle={subtitle}
      className={cn(
        'flex min-h-[240px] flex-col overflow-hidden tall:min-h-0 compact:p-4 [&>header]:mb-2',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-metric">{value.toLocaleString('es-CL')}</span>
          {unit && <span className="text-title text-ink-muted">{unit}</span>}
        </div>
        {delta && (
          <span className="pill pill-success">
            <DeltaIcon size={14} aria-hidden /> {delta.text}
          </span>
        )}
      </div>

      <div className="relative mt-2 min-h-[56px] flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0"
                style={{
                  stopColor: 'var(--color-brand-glow)',
                  stopOpacity: 0.28,
                }}
              />
              <stop
                offset="1"
                style={{ stopColor: 'var(--color-brand-glow)', stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${id}-area)`} />
          <path
            d={line}
            fill="none"
            strokeWidth={2.25}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ stroke: 'var(--color-brand)' }}
          />
        </svg>
        {/* Puntos y etiquetas en HTML para que no se deformen con el SVG estirado */}
        {xy.map(([x, y], index) => {
          const left = `${(x / W) * 100}%`
          const edge = index === 0 || index === last
          return (
            <Fragment key={labels[index]}>
              <span
                role="img"
                tabIndex={0}
                aria-label={`${labels[index]}: ${format(points[index])}`}
                className="peer absolute grid size-6 -translate-1/2 cursor-default place-items-center rounded-full"
                style={{ left, top: `${(y / H) * 100}%` }}
              >
                <span
                  className={cn(
                    'rounded-full border-2',
                    index === last
                      ? 'size-3.5 border-on-ink bg-brand shadow-tile'
                      : index === 0
                        ? 'size-2.5 border-ink-muted bg-glass-strong'
                        : 'size-2.5 border-on-ink bg-brand-glow shadow-tile',
                  )}
                />
              </span>
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute -translate-y-[130%] rounded-full px-2.5 py-0.5 text-caption font-medium whitespace-nowrap',
                  index === 0
                    ? 'translate-x-2 border border-glass-rim bg-glass-strong shadow-tile'
                    : 'bg-ink text-on-ink',
                  index === last
                    ? '-translate-x-full'
                    : index > 0 && '-translate-x-1/2',
                  !edge &&
                    'opacity-0 transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100',
                )}
                style={{ left, top: `max(32px, ${(y / H) * 100}%)` }}
              >
                {format(points[index])}
              </span>
            </Fragment>
          )
        })}
      </div>
      <div aria-hidden className="relative mt-1 h-3.5 text-axis text-ink-muted">
        {labels.map((label, index) => (
          <span
            key={label}
            className={cn(
              'absolute -translate-x-1/2 uppercase',
              index === last && 'font-semibold text-ink',
            )}
            style={{ left: `${(xy[index][0] / W) * 100}%` }}
          >
            {label}
          </span>
        ))}
      </div>
      {footer && (
        <div className="mt-2 border-t border-glass-shade pt-2 text-caption">
          {footer}
        </div>
      )}
    </Glass>
  )
}
