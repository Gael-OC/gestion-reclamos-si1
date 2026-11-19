import { cn } from '@/lib/cn'

type ChipGroupProps<T extends string> = {
  /** Nombre accesible del grupo. */
  label: string
  options: { value: T; label: string }[]
  /** Valores elegidos; en modo único, a lo más uno. */
  value: T[]
  onChange: (value: T[]) => void
  multiple?: boolean
  invalid?: boolean
  className?: string
}

/** Opciones en píldoras que se marcan con un clic (una o varias). */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  multiple = false,
  invalid = false,
  className,
}: ChipGroupProps<T>) {
  function toggle(option: T) {
    if (!multiple) return onChange([option])
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option],
    )
  }
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((option) => {
        const on = value.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(option.value)}
            className={cn(
              'h-9 cursor-pointer rounded-full border-[1.5px] bg-glass-strong px-3.5 text-caption font-medium transition-[border-color,box-shadow,color] duration-200',
              on
                ? 'border-brand text-brand shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_12%,transparent)]'
                : invalid
                  ? 'border-danger/50 text-ink'
                  : 'border-glass-rim text-ink hover:border-brand/40',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
