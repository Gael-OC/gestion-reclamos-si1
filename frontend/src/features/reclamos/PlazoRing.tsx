import { cn } from '@/lib/cn'
import { COLOR_PLAZO, plazoUsado, textoPlazo, tonoPlazo } from './plazo'

type PlazoRingProps = {
  /** Días hasta la fecha límite; negativo si venció. */
  dias: number
  size?: number
  className?: string
}

/**
 * Mini anillo con la porción del plazo ya usada: azul con margen, ámbar a
 * 0–3 días y rojo lleno, con un punto al centro, si venció.
 */
export function PlazoRing({ dias, size = 30, className }: PlazoRingProps) {
  const tono = tonoPlazo(dias)
  const color = COLOR_PLAZO[tono]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      role="img"
      aria-label={textoPlazo(dias)}
      className={cn('shrink-0', className)}
    >
      <circle
        cx="18"
        cy="18"
        r="14"
        fill="none"
        strokeWidth="4"
        style={{
          stroke: tono === 'vencido' ? color : 'var(--color-glass-shade)',
        }}
      />
      {tono === 'vencido' ? (
        <circle cx="18" cy="18" r="7" style={{ fill: color }} />
      ) : (
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${Math.max(4, plazoUsado(dias))} 100`}
          transform="rotate(-90 18 18)"
          style={{ stroke: color }}
        />
      )}
    </svg>
  )
}
