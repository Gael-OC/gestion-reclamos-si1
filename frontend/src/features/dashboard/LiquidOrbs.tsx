import { useId, type CSSProperties } from 'react'
import { useCountUp } from '@/lib/useCountUp'
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
  const value = useCountUp(item.value)
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
        {value}
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
 * Tres burbujas unidas por puentes de líquido que respiran (metaballs con un
 * filtro SVG). Muestra la distribución de los reclamos activos por etapa.
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
        <filter id={`${id}-goo`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
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

      <g filter={`url(#${id}-goo)`}>
        {[190, 370].map((cx, index) => (
          <ellipse
            key={cx}
            cx={cx}
            cy={CY}
            rx={70}
            ry={26}
            fill={`url(#${id}-bridge)`}
            className="animate-[bridge_4.5s_ease-in-out_infinite]"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animationDelay: `${index * -2.2}s`,
            }}
          />
        ))}
        {XS.map((x, index) => (
          <circle
            key={x}
            cx={x}
            cy={CY}
            r={RS[index]}
            fill={`url(#${id}-${index === 1 ? 'core' : 'side'})`}
            className="animate-[breathe_6s_ease-in-out_infinite]"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animationDelay: `${index * -2}s`,
            }}
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
