import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/cn'

type SearchFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Nombre accesible del campo (no hay etiqueta visible). */
  label: string
}

/** Buscador en píldora de vidrio. */
export function SearchField({ label, className, ...rest }: SearchFieldProps) {
  return (
    <label className={cn('relative flex min-w-0 items-center', className)}>
      <span className="sr-only">{label}</span>
      <Search
        size={16}
        strokeWidth={1.6}
        aria-hidden
        className="pointer-events-none absolute left-4 z-10 text-ink-muted"
      />
      <input
        type="search"
        className="h-11 w-full min-w-0 rounded-full border border-glass-rim bg-glass-tile pr-4 pl-10.5 text-body text-ink shadow-[inset_0_1px_3px_var(--color-glass-shade)] transition-shadow outline-none placeholder:text-ink-muted focus:shadow-focus-ring"
        {...rest}
      />
    </label>
  )
}
