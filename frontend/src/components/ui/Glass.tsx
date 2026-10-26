import type { HTMLAttributes, ReactNode } from 'react'
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

export type GlassProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  /** shell 22 %, panel 42–50 % (por defecto), tile 58 %, strong 82 %. */
  level?: GlassLevel
  /** Se eleva brevemente al pasar el cursor, salvo con movimiento reducido. */
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
  interactive = false,
  padding,
  title,
  subtitle,
  action,
  className,
  children,
  ...rest
}: GlassProps) {
  return (
    <section
      {...rest}
      className={cn(
        levelClass[level],
        paddingClass[padding ?? defaultPadding[level]],
        interactive &&
          'cursor-pointer transition-transform duration-200 motion-safe:hover:-translate-y-1',
        className,
      )}
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
    </section>
  )
}
