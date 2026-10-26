import type { CSSProperties, ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/cn'

type GlassLevel = 'shell' | 'panel' | 'tile' | 'strong'
type GlassPadding = 'none' | 'sm' | 'md' | 'lg'

const levelClass: Record<GlassLevel, string> = {
  shell: 'glass-shell',
  panel: 'glass-panel',
  tile: 'glass-tile',
  strong: 'glass-strong',
}

const defaultPadding: Record<GlassLevel, GlassPadding> = {
  shell: 'lg',
  panel: 'md',
  tile: 'sm',
  strong: 'sm',
}

const paddingClass: Record<GlassPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

export type GlassProps = Omit<HTMLMotionProps<'section'>, 'title'> & {
  /** shell 22 %, panel 42–50 % (por defecto), tile 58 %, strong 82 %. */
  level?: GlassLevel
  /** Isla flotante: vaivén lento de 6px y sombra más profunda. */
  float?: boolean
  /** Desfase del vaivén en segundos; por defecto depende de `enter`. */
  floatDelay?: number
  /** Índice de entrada escalonada (80 ms por índice). Omitir: sin animación de entrada. */
  enter?: number
  /** Se eleva con resorte al pasar el cursor. */
  interactive?: boolean
  padding?: GlassPadding
  title?: ReactNode
  subtitle?: ReactNode
  /** Nodo a la derecha del encabezado: un botón, un control segmentado. */
  action?: ReactNode
  children?: ReactNode
}

/**
 * Superficie de vidrio del sistema. Cada bloque de una vista es una isla
 * independiente: separe las islas siempre con gap-6.
 */
export function Glass({
  level = 'panel',
  float = false,
  floatDelay,
  enter,
  interactive = false,
  padding,
  title,
  subtitle,
  action,
  className,
  style,
  children,
  ...rest
}: GlassProps) {
  const reduce = useReducedMotion()
  const animateIn = enter !== undefined && !reduce
  const delay = floatDelay ?? -(enter ?? 0) * 1.3

  return (
    <motion.section
      {...rest}
      className={cn(
        levelClass[level],
        paddingClass[padding ?? defaultPadding[level]],
        float && 'glass-island',
        interactive && 'cursor-pointer',
        className,
      )}
      style={{ ...style, '--float-delay': `${delay}s` } as CSSProperties}
      initial={animateIn ? { opacity: 0, y: 16, scale: 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: (enter ?? 0) * 0.08,
      }}
      whileHover={
        interactive && !reduce
          ? {
              y: -4,
              transition: { type: 'spring', stiffness: 380, damping: 26 },
            }
          : undefined
      }
      tabIndex={interactive ? 0 : rest.tabIndex}
    >
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-title">{title}</h2>}
            {subtitle && (
              <p className="text-caption text-ink-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </motion.section>
  )
}
