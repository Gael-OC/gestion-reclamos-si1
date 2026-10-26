import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type RingStatProps = {
  /** Porcentaje de 0 a 100 que llena el anillo. */
  value: number
  /** Nombre accesible con la lectura completa del anillo. */
  label: string
  /** Lado en rem; sin él, el anillo ocupa el alto de su contenedor. */
  size?: number
  /** Contenido centrado: la cifra y su unidad. */
  children?: ReactNode
  className?: string
}

/** Anillo de progreso estático: arco azul sobre un riel de vidrio. */
export function RingStat({
  value,
  label,
  size,
  children,
  className,
}: RingStatProps) {
  const id = useId().replaceAll(':', '')

  return (
    <div
      role="img"
      aria-label={label}
      className={cn('relative aspect-square shrink-0', className)}
      style={size ? { width: `${size}rem`, height: `${size}rem` } : undefined}
    >
      <svg viewBox="0 0 120 120" aria-hidden className="size-full -rotate-90">
        <defs>
          <linearGradient id={`${id}-arc`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--color-brand-glow)' }} />
            <stop offset="1" style={{ stopColor: 'var(--color-brand)' }} />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          strokeWidth="12"
          style={{ stroke: 'var(--color-glass-shade)' }}
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${value} 100`}
          stroke={`url(#${id}-arc)`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>{children}</div>
      </div>
    </div>
  )
}
