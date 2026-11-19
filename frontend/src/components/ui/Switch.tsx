import { cn } from '@/lib/cn'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Nombre accesible si no hay texto asociado con aria-labelledby. */
  label?: string
  labelledBy?: string
  className?: string
}

/**
 * Interruptor de encendido y apagado; la perilla se desliza con resorte.
 * Todo en rem para que la perilla siga centrada cuando la página escala.
 */
export function Switch({
  checked,
  onChange,
  label,
  labelledBy,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-[0.1875rem] transition-colors duration-300',
        checked ? 'bg-brand-glow' : 'bg-sky-acero',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-[1.125rem] rounded-full bg-white shadow-tile transition-transform duration-300 ease-spring',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}
