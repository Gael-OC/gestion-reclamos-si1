import { CircleCheck, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PLAZO_DIAS } from './estados'

type PlazoChipProps = {
  /** Días corridos hasta la fecha límite; negativo si ya venció. Lo calcula el backend. */
  dias?: number
  total?: number
  cerrado?: boolean
  dentroDePlazo?: boolean
  className?: string
}

function dayWord(n: number) {
  return n === 1 ? 'día' : 'días'
}

/**
 * Plazo en días corridos con un mini anillo que muestra cuánto del plazo se
 * consumió: azul con margen, warning a 0–3 días y danger con halo si venció.
 */
export function PlazoChip({
  dias = 0,
  total = PLAZO_DIAS,
  cerrado = false,
  dentroDePlazo = true,
  className,
}: PlazoChipProps) {
  if (cerrado) {
    const Icon = dentroDePlazo ? CircleCheck : TriangleAlert
    return (
      <span
        className={cn(
          'pill',
          dentroDePlazo ? 'pill-success' : 'pill-danger',
          className,
        )}
      >
        <Icon size={13} strokeWidth={1.8} aria-hidden />
        <span>{dentroDePlazo ? 'En plazo' : 'Fuera de plazo'}</span>
      </span>
    )
  }

  const used =
    dias < 0 ? 1 : Math.max(0.04, Math.min(1, (total - dias) / total))
  let tone = 'pill-brand'
  let text = `${dias} ${dayWord(dias)} restantes`
  if (dias < 0) {
    tone = 'pill-danger pill-pulse'
    text = `Vencido hace ${-dias} ${dayWord(-dias)}`
  } else if (dias === 0) {
    tone = 'pill-warning'
    text = 'Vence hoy'
  } else if (dias <= 3) {
    tone = 'pill-warning'
    text = `Vence en ${dias} ${dayWord(dias)}`
  }

  return (
    <span className={cn('pill', tone, className)}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        aria-hidden
        className="mr-px"
      >
        <circle
          cx="7"
          cy="7"
          r="5.4"
          fill="none"
          strokeWidth="2.2"
          className="stroke-glass-shade"
        />
        <circle
          cx="7"
          cy="7"
          r="5.4"
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - used}
          transform="rotate(-90 7 7)"
          style={{ stroke: 'var(--tone)' }}
        />
      </svg>
      <span>{text}</span>
    </span>
  )
}
