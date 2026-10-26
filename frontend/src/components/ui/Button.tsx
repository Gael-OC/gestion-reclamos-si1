import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'ink' | 'glass' | 'ghost'
type ButtonSize = 'sm' | 'md'

const variantClass: Record<ButtonVariant, string> = {
  // Acción principal: píldora negra, una por vista.
  ink: 'bg-ink text-on-ink shadow-ink hover:bg-ink-soft',
  glass: 'glass-tile rounded-full hover:bg-glass-strong hover:shadow-lift',
  ghost: 'text-ink hover:bg-glass-tile',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-caption font-medium',
  md: 'h-11 gap-2 px-6 text-label',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconRight?: LucideIcon
  children?: ReactNode
}

/** Botón en píldora: se hunde al presionar y sube levemente al pasar el cursor. */
export function Button({
  variant = 'glass',
  size = 'md',
  icon: IconLeft,
  iconRight: IconRight,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconSize = size === 'sm' ? 15 : 17
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full transition-[background-color,box-shadow,transform] duration-300 ease-spring hover:-translate-y-px active:scale-95 disabled:cursor-not-allowed disabled:opacity-45',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {IconLeft && <IconLeft size={iconSize} strokeWidth={1.6} aria-hidden />}
      {children !== undefined && <span>{children}</span>}
      {IconRight && <IconRight size={iconSize} strokeWidth={1.6} aria-hidden />}
    </button>
  )
}
