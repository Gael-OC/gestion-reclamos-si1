import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type OrbTone = 'marino' | 'perla' | 'danger' | 'warning' | 'vacio'

const toneStyle: Record<OrbTone, CSSProperties> = {
  marino: {
    color: 'var(--color-on-ink)',
    background:
      'radial-gradient(circle at 35% 28%, var(--color-orb-acero), var(--color-orb-marino) 45%, var(--color-orb-marino-deep))',
    boxShadow:
      '0 30px 60px -20px color-mix(in srgb, var(--color-orb-marino-deep) 60%, transparent), inset 0 2px 0 #ffffff40',
  },
  perla: {
    background:
      'radial-gradient(circle at 35% 28%, #ffffff, var(--color-orb-perla) 55%, var(--color-sky-acero))',
    boxShadow:
      'inset 0 0 0 1.5px var(--color-glass-shine), 0 24px 40px -22px #1e2b4a66',
  },
  danger: {
    background:
      'radial-gradient(circle at 35% 28%, #ffffff, var(--color-orb-perla) 60%, color-mix(in srgb, var(--color-danger) 22%, var(--color-orb-perla)))',
    boxShadow:
      '0 0 0 2.5px var(--color-danger), 0 0 0 10px color-mix(in srgb, var(--color-danger) 12%, transparent)',
  },
  warning: {
    background:
      'radial-gradient(circle at 35% 28%, #ffffff, var(--color-orb-perla) 60%, color-mix(in srgb, var(--color-warning) 22%, var(--color-orb-perla)))',
    boxShadow: '0 0 0 2.5px var(--color-warning)',
  },
  vacio: {
    background:
      'radial-gradient(circle at 35% 28%, var(--color-glass-strong), color-mix(in srgb, var(--color-sky-niebla) 80%, transparent))',
    border:
      '2px dashed color-mix(in srgb, var(--color-ink-muted) 40%, transparent)',
  },
}

type OrbProps = {
  tone?: OrbTone
  /** Diámetro en rem. */
  size: number
  children?: ReactNode
  className?: string
}

/** Esfera de vidrio estática con contenido centrado (una cifra, un ícono). */
export function Orb({ tone = 'perla', size, children, className }: OrbProps) {
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full text-center text-ink',
        className,
      )}
      style={{ width: `${size}rem`, height: `${size}rem`, ...toneStyle[tone] }}
    >
      {children}
    </span>
  )
}
