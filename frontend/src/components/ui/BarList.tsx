import { cn } from '@/lib/cn'

export type BarListItem = { label: string; value: number }

type BarListProps = {
  items: BarListItem[]
  /** Nombre accesible de la lista. */
  label: string
  /** Ancho de la columna de nombres (CSS), según el largo de las etiquetas. */
  labelWidth?: string
  className?: string
}

/**
 * Barras horizontales comparables: una sola escala desde cero y un solo color,
 * con el valor al final de cada fila. Sirve para estados, funcionarios, etc.
 */
export function BarList({
  items,
  label,
  labelWidth = '8rem',
  className,
}: BarListProps) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <ul
      aria-label={label}
      className={cn(
        'flex min-h-0 flex-col justify-around gap-1.5 text-caption',
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className="grid items-center gap-3"
          style={{ gridTemplateColumns: `${labelWidth} minmax(0,1fr) 2.5rem` }}
        >
          <span className="truncate" title={item.label}>
            {item.label}
          </span>
          <span className="h-2 rounded-full bg-glass-shade">
            <span
              className="block h-full rounded-full bg-linear-to-r from-brand-glow to-brand shadow-tile"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </span>
          <span className="text-right font-medium tabular-nums">
            {item.value.toLocaleString('es-CL')}
          </span>
        </li>
      ))}
    </ul>
  )
}
