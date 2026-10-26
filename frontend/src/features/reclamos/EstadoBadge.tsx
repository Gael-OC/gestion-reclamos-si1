import { cn } from '@/lib/cn'
import { ESTADOS, type Estado } from './estados'

type EstadoBadgeProps = {
  estado: Estado
  /** Texto corto para listas angostas ("Esperando empresa"). */
  short?: boolean
  className?: string
}

/** Píldora de vidrio con el estado: ícono en su tono + nombre exacto del estado. */
export function EstadoBadge({
  estado,
  short = false,
  className,
}: EstadoBadgeProps) {
  const info = ESTADOS[estado]
  const Icon = info.icon
  const text = short && info.short ? info.short : info.label
  return (
    <span className={cn('pill', info.pill, className)} title={info.label}>
      <Icon size={13} strokeWidth={1.8} aria-hidden />
      <span>{text}</span>
    </span>
  )
}
