import { useId, type ReactNode } from 'react'
import { Glass } from '@/components/ui/Glass'

type TrendCardProps = {
  title: string
  value: number
  unit?: string
  caption?: string
  points: number[]
  startLabel?: string
  endLabel?: string
  action?: ReactNode
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
 * Indicador estático con una línea de tendencia y relleno tenue bajo la curva.
 */
export function TrendCard({
  title,
  value,
  unit,
  caption,
  points,
  startLabel,
  endLabel,
  action,
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
  const first = xy[0]
  const last = xy[xy.length - 1]
  const area = `${line} L${last[0]} ${H} L${first[0]} ${H} Z`

  return (
    <Glass
      className={`flex min-h-[240px] flex-col overflow-hidden tall:min-h-0 compact:p-4 ${className ?? ''}`}
    >
      <header className="flex items-center justify-between">
        <span className="text-label text-ink-muted">{title}</span>
        {action}
      </header>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-metric tabular-nums">
          {value.toLocaleString('es-CL')}
        </span>
        {unit && <span className="text-[16px] text-ink-muted">{unit}</span>}
      </div>
      {caption && <p className="text-caption text-ink-muted">{caption}</p>}

      <div className="relative mt-auto h-[58%] min-h-[96px]">
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
        <span
          className="absolute size-2 -translate-1/2 rounded-full border-[1.5px] border-ink-muted bg-glass-strong"
          style={{
            left: `${(first[0] / W) * 100}%`,
            top: `${(first[1] / H) * 100}%`,
          }}
        />
        <span
          className="absolute size-3 -translate-1/2 rounded-full border-2 border-on-ink bg-brand shadow-tile"
          style={{
            left: `${(last[0] / W) * 100}%`,
            top: `${(last[1] / H) * 100}%`,
          }}
        />
        {startLabel && (
          <span
            className="absolute translate-x-2 -translate-y-[130%] rounded-full border border-glass-rim bg-glass-strong px-2 py-0.5 text-[11px] font-medium whitespace-nowrap shadow-tile"
            style={{
              left: `${(first[0] / W) * 100}%`,
              top: `${(first[1] / H) * 100}%`,
            }}
          >
            {startLabel}
          </span>
        )}
        {endLabel && (
          <span
            className="absolute -translate-x-full -translate-y-[170%] rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-on-ink"
            style={{
              left: `${(last[0] / W) * 100}%`,
              top: `${(last[1] / H) * 100}%`,
            }}
          >
            {endLabel}
          </span>
        )}
      </div>
    </Glass>
  )
}
