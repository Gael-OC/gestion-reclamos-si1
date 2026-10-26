import { useId } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'

export type SegmentedOption<T extends string> = { value: T; label: string }

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Nombre accesible del grupo. */
  label: string
  className?: string
}

/** Riel de vidrio con una píldora blanca que se desliza con resorte. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  const id = useId()
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'inline-flex shrink-0 gap-0.5 rounded-full border border-glass-rim bg-glass-tile p-[3px] shadow-[inset_0_1px_3px_var(--color-glass-shade)]',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative h-7.5 cursor-pointer rounded-full px-4 text-caption font-medium transition-colors duration-300',
              active ? 'text-ink' : 'text-ink-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-glass-strong shadow-tile ring-1 ring-glass-rim"
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
