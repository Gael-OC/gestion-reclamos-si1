import { CircleCheck, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'

type PlazoChipProps = {
  /** Días corridos hasta la fecha límite; negativo si ya venció. Lo calcula el backend. */
  dias?: number
  cerrado?: boolean
  dentroDePlazo?: boolean
  className?: string
}

function dayWord(n: number) {
  return n === 1 ? 'día' : 'días'
}

/**
 * Plazo en días corridos con un punto de estado: azul con margen, warning a
 * 0–3 días y danger si venció.
 */
export function PlazoChip({
  dias = 0,
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

  let tone = 'pill-brand'
  let text = `${dias} ${dayWord(dias)} restantes`
  if (dias < 0) {
    tone = 'pill-danger'
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
      <i aria-hidden className="size-2 shrink-0 rounded-full bg-(--tone)" />
      <span>{text}</span>
    </span>
  )
}
