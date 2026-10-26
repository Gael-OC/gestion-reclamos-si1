import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

type Bar = { label: string; value: number }

type GlassBarsProps = {
  data: Bar[]
  /** Índice activo al inicio (por defecto, el último). */
  initialActive?: number
  format?: (value: number) => string
  className?: string
}

/**
 * Barras de vidrio esmerilado. La activa es azul sólido con un tooltip negro;
 * pasar el cursor o hacer clic cambia la barra activa.
 */
export function GlassBars({
  data,
  initialActive,
  format = String,
  className,
}: GlassBarsProps) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(initialActive ?? data.length - 1)
  const max = Math.max(...data.map((bar) => bar.value), 1)

  return (
    <div className={cn('flex min-h-0 gap-3 pt-9', className)}>
      {data.map((bar, index) => {
        const on = index === active
        return (
          <button
            key={bar.label}
            type="button"
            aria-pressed={on}
            aria-label={`${bar.label}: ${format(bar.value)}`}
            onClick={() => setActive(index)}
            onMouseEnter={() => setActive(index)}
            className="group flex min-w-0 flex-1 cursor-pointer flex-col gap-2 rounded-md"
          >
            <span className="relative flex flex-1 items-end">
              <motion.span
                initial={reduce ? false : { height: '8%' }}
                animate={{
                  height: `${Math.max(12, (bar.value / max) * 100)}%`,
                }}
                transition={{
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.12 + index * 0.06,
                }}
                className={cn(
                  'relative w-full rounded-md border transition-[background,box-shadow,translate] duration-300 group-hover:-translate-y-0.5',
                  on
                    ? 'border-brand/40 bg-linear-to-b from-[color-mix(in_srgb,var(--color-brand)_82%,var(--color-orb-perla))] to-brand shadow-[inset_0_1px_0_var(--color-glass-rim),0_14px_26px_-14px_var(--color-brand)]'
                    : 'border-glass-rim bg-linear-to-b from-glass-strong to-[color-mix(in_srgb,var(--color-sky-hielo)_55%,transparent)] shadow-tile',
                )}
              >
                {on && (
                  <motion.span
                    key={bar.label}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                    className="absolute -top-1.5 left-1/2 inline-flex h-6 -translate-x-1.5 -translate-y-full items-center rounded-lg bg-ink px-2.5 text-[11px] font-medium whitespace-nowrap text-on-ink"
                  >
                    <i className="absolute -bottom-3 -left-0.5 size-[9px] rounded-full bg-ink shadow-[0_0_0_2px_var(--color-glass-strong)]" />
                    {format(bar.value)}
                  </motion.span>
                )}
              </motion.span>
            </span>
            <span
              className={cn(
                'text-center text-axis uppercase',
                on ? 'font-semibold text-ink' : 'text-ink-muted',
              )}
            >
              {bar.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
