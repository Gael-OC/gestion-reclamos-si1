import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type GlassListColumn<R> = {
  key: string
  header: string
  /** Ancho en CSS grid: '1fr', '1.2fr', '140px'… */
  width?: string
  align?: 'left' | 'right'
  /** Clase extra de la celda, por ejemplo para ocultarla en pantallas chicas. */
  className?: string
  render: (row: R) => ReactNode
}

type GlassListProps<R extends { id: string }> = {
  columns: GlassListColumn<R>[]
  rows: R[]
  /** Nombre accesible de la lista. */
  caption: string
  selectedId?: string
  onRowClick?: (row: R) => void
  className?: string
}

/**
 * Filas sobre vidrio, sin bordes de tabla. La fila seleccionada se eleva con
 * un degradado vidrio → azul. Solo las interacciones tienen una transición breve.
 */
export function GlassList<R extends { id: string }>({
  columns,
  rows,
  caption,
  selectedId,
  onRowClick,
  className,
}: GlassListProps<R>) {
  const template = columns.map((column) => column.width ?? '1fr').join(' ')

  return (
    <div
      role="table"
      aria-label={caption}
      className={cn('flex flex-col', className)}
    >
      <div role="row" className="sr-only">
        {columns.map((column) => (
          <span key={column.key} role="columnheader">
            {column.header}
          </span>
        ))}
      </div>
      {rows.map((row, index) => {
        const selected = row.id === selectedId
        return (
          <div
            key={row.id}
            role="row"
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={
              onRowClick
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onRowClick(row)
                    }
                  }
                : undefined
            }
            style={{ gridTemplateColumns: template }}
            className={cn(
              'grid items-center gap-3 rounded-md px-3 py-2.5 transition-[background-color,box-shadow,scale] duration-200 compact:py-2',
              index < rows.length - 1 &&
                !selected &&
                'border-b border-glass-shade',
              onRowClick && 'cursor-pointer hover:bg-glass-tile',
              selected &&
                'bg-linear-to-r from-glass-strong via-glass-tile to-brand-soft shadow-tile motion-safe:scale-[1.015]',
            )}
          >
            {columns.map((column) => (
              <span
                key={column.key}
                role="cell"
                className={cn(
                  'flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap tabular-nums',
                  column.align === 'right' && 'justify-end',
                  column.className,
                )}
              >
                {column.render(row)}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
