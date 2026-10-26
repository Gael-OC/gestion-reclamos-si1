import { useId, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'

type Item = { label: string; value: number }

type LiquidOrbsProps = {
  /** Tres etapas; la del centro se destaca en azul marino. */
  items: [Item, Item, Item]
  className?: string
}

const W = 560
const H = 200
const CY = 100
const XS = [100, 280, 460]
const RS = [78, 92, 78]

const stop = (color: string): CSSProperties => ({
  stopColor: `var(--color-${color})`,
})

function OrbLabel({ item, x, core }: { item: Item; x: number; core: boolean }) {
  const words = item.label.split(' ')
  // Etiquetas largas en dos líneas ("Esperando / empresa").
  const lines =
    item.label.length > 12 && words.length > 1
      ? [words[0], words.slice(1).join(' ')]
      : [item.label]
  return (
    <text
      x={x}
      y={CY - 6 - (lines.length - 1) * 7}
      textAnchor="middle"
      style={{ fill: `var(--color-${core ? 'on-ink' : 'ink'})` }}
    >
      <tspan
        x={x}
        fontSize={core ? 26 : 22}
        fontWeight={500}
        letterSpacing="-0.02em"
      >
        {item.value.toLocaleString('es-CL')}
      </tspan>
      {lines.map((line, index) => (
        <tspan
          key={line}
          x={x}
          dy={index === 0 ? 20 : 15}
          fontSize={12}
          fontWeight={500}
          style={core ? undefined : { fill: 'var(--color-ink-muted)' }}
        >
          {line}
        </tspan>
      ))}
    </text>
  )
}

/**
 * Tres burbujas estáticas unidas por puentes. Muestra la distribución de los
 * reclamos activos por etapa sin filtros ni animaciones permanentes.
 */
export function LiquidOrbs({ items, className }: LiquidOrbsProps) {
  const id = useId().replaceAll(':', '')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={items
        .map((item) => `${item.label}: ${item.value}`)
        .join(', ')}
      className={cn('h-full w-full overflow-visible', className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`${id}-side`} cx="35%" cy="30%" r="75%">
          <stop offset="0" style={stop('orb-perla')} />
          <stop offset="0.7" style={stop('sky-niebla')} />
          <stop offset="1" style={stop('sky-acero')} />
        </radialGradient>
        <radialGradient id={`${id}-core`} cx="35%" cy="28%" r="80%">
          <stop offset="0" style={stop('orb-acero')} />
          <stop offset="0.45" style={stop('orb-marino')} />
          <stop offset="1" style={stop('orb-marino-deep')} />
        </radialGradient>
        <linearGradient id={`${id}-bridge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={stop('orb-acero')} />
          <stop offset="1" style={stop('orb-marino')} />
        </linearGradient>
      </defs>

      <g>
        {[false, true].map((mirrored) => (
          <path
            key={String(mirrored)}
            d="M160 50 C182 85 185 85 211 40 L211 160 C185 115 182 115 160 150 Z"
            transform={mirrored ? 'translate(560 0) scale(-1 1)' : undefined}
            fill={`url(#${id}-bridge)`}
          />
        ))}
        {XS.map((x, index) => (
          <circle
            key={x}
            cx={x}
            cy={CY}
            r={RS[index]}
            fill={`url(#${id}-${index === 1 ? 'core' : 'side'})`}
          />
        ))}
      </g>
      {[0, 2].map((index) => (
        <circle
          key={index}
          cx={XS[index]}
          cy={CY}
          r={RS[index] - 1}
          fill="none"
          strokeWidth={1.5}
          style={{ stroke: 'var(--color-glass-shine)' }}
        />
      ))}

      {items.map((item, index) => (
        <OrbLabel
          key={item.label}
          item={item}
          x={XS[index]}
          core={index === 1}
        />
      ))}
    </svg>
  )
}
