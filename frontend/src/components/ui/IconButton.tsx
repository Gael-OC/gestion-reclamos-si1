import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  icon: LucideIcon
  /** Obligatorio: se usa como aria-label y tooltip nativo. */
  label: string
  variant?: 'glass' | 'ghost'
  size?: 'sm' | 'md'
  /** Punto rojo que late (notificaciones pendientes). */
  badge?: boolean
}

export function IconButton({
  icon: Icon,
  label,
  variant = 'glass',
  size = 'md',
  badge = false,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-grid shrink-0 cursor-pointer place-items-center rounded-full text-ink transition-[background-color,transform] duration-300 ease-spring active:scale-90',
        size === 'sm' ? 'size-8' : 'size-10.5',
        variant === 'glass'
          ? 'glass-tile rounded-full hover:bg-glass-strong'
          : 'hover:bg-glass-tile',
        className,
      )}
      {...rest}
    >
      <Icon size={size === 'sm' ? 15 : 18} strokeWidth={1.6} aria-hidden />
      {badge && (
        <span className="absolute top-1.5 right-2 size-2 rounded-full bg-danger shadow-[0_0_0_2px_var(--color-glass-strong)]">
          <span className="absolute inset-0 animate-[ping-soft_1.8s_var(--ease-glass)_infinite] rounded-full bg-danger" />
        </span>
      )}
    </button>
  )
}
