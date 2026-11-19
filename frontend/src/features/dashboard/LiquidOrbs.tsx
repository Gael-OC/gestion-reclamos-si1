import { useId, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'

type Item = { label: string; value: number }
/** Tono de las burbujas laterales: neutro, o con borde de alerta. */
export type SideTone = 'neutral' | 'danger' | 'warning'

type LiquidOrbsProps = {
  /** Tres etapas; la del centro se destaca en azul marino. */
  items: [Item, Item, Item]
  /** Tono de la burbuja izquierda y de la derecha. */
  tones?: [SideTone, SideTone]
  /** Si se entrega, cada burbuja abre su listado (índice 0, 1 o 2). */
  onSelect?: (index: number) => void
  className?: string
}

const toneColor: Record<SideTone, string | null> = {
  neutral: null,
  danger: 'var(--color-danger)',
  warning: 'var(--color-warning)',
}

const W = 560
const H = 200
const CY = 100
const XS = [100, 280, 460]
const RS = [78, 92, 78]

const stop = (color: string): CSSProperties => ({
  stopColor: `var(--color-${color})`,
})

function OrbLabel({
  item,
  x,
  core,
  tone,
}: {
  item: Item
  x: number
  core: boolean
  tone: SideTone
}) {
  const words = item.label.split(' ')
  // Etiquetas largas en dos líneas ("Esperando / empresa").
  const lines =
    item.label.length > 12 && words.length > 1
      ? [words[0], words.slice(1).join(' ')]
      : [item.label]
  // El SVG se escala con la altura disponible (≈0,6–0,9): los tamaños de aquí
  // se eligen para que el texto renderizado no baje de unos 12 px.
  return (
    <text
      x={x}
      y={CY - 3 - (lines.length - 1) * 11}
      textAnchor="middle"
      style={{ fill: `var(--color-${core ? 'on-ink' : 'ink'})` }}
    >
      <tspan
        x={x}
        fontSize={core ? 40 : 34}
        fontWeight={500}
        letterSpacing="-0.02em"
      >
        {item.value.toLocaleString('es-CL')}
      </tspan>
      {lines.map((line, index) => (
        <tspan
          key={line}
          x={x}
          dy={index === 0 ? 25 : 22}
          fontSize={20}
          fontWeight={500}
          style={
            core
              ? undefined
              : { fill: toneColor[tone] ?? 'var(--color-ink-muted)' }
          }
        >
          {line}
        </tspan>
      ))}
    </text>
  )
}

const sideFill = (tone: SideTone) => (tone === 'neutral' ? 'side' : tone)

/**
 * Tres burbujas estáticas unidas por puentes. Muestra la distribución de los
 * reclamos activos por etapa sin filtros ni animaciones permanentes.
 */
export function LiquidOrbs({
  items,
  tones = ['neutral', 'neutral'],
  onSelect,
  className,
}: LiquidOrbsProps) {
  const id = useId().replaceAll(':', '')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      // Con enlaces, el SVG es un grupo para que cada burbuja sea navegable.
      role={onSelect ? 'group' : 'img'}
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
        {(['danger', 'warning'] as const).map((tone) => (
          <radialGradient
            key={tone}
            id={`${id}-${tone}`}
            cx="35%"
            cy="30%"
            r="75%"
          >
            <stop offset="0" style={{ stopColor: '#ffffff' }} />
            <stop offset="0.6" style={stop('orb-perla')} />
            <stop
              offset="1"
              style={{
                stopColor: `color-mix(in srgb, ${toneColor[tone]} 22%, var(--color-orb-perla))`,
              }}
            />
          </radialGradient>
        ))}
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
            fill={`url(#${id}-${index === 1 ? 'core' : sideFill(tones[index === 0 ? 0 : 1])})`}
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
          strokeWidth={toneColor[tones[index === 0 ? 0 : 1]] ? 3 : 1.5}
          style={{
            stroke:
              toneColor[tones[index === 0 ? 0 : 1]] ??
              'var(--color-glass-shine)',
          }}
        />
      ))}

      {items.map((item, index) => (
        <OrbLabel
          key={item.label}
          item={item}
          x={XS[index]}
          core={index === 1}
          tone={index === 1 ? 'neutral' : tones[index === 0 ? 0 : 1]}
        />
      ))}
      {onSelect &&
        items.map((item, index) => (
          <circle
            key={`hit-${item.label}`}
            cx={XS[index]}
            cy={CY}
            r={RS[index]}
            role="link"
            tabIndex={0}
            aria-label={`Ver ${item.label.toLowerCase()}: ${item.value}`}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(index)
              }
            }}
            className="cursor-pointer fill-transparent stroke-transparent outline-none hover:fill-white/10 focus-visible:stroke-brand"
            strokeWidth={4}
          />
        ))}
    </svg>
  )
}
