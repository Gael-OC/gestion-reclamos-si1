import { cn } from '@/lib/cn'

const tones = [
  'from-orb-perla via-sky-hielo to-data-teal',
  'from-orb-perla via-sky-acero to-data-acero',
  'from-orb-perla via-sky-perla to-orb-pizarra',
  'from-orb-perla via-sky-niebla to-data-acero',
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

type AvatarProps = {
  name: string
  size?: number
  className?: string
}

/** Iniciales sobre una esfera perlada; el tono es estable según el nombre. */
export function Avatar({ name, size = 36, className }: AvatarProps) {
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full bg-radial-[at_32%_26%] font-medium text-ink shadow-[0_0_0_3px_var(--color-glass-strong),0_10px_20px_-10px_var(--color-ink-muted)]',
        tones[sum % tones.length],
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials(name)}
    </span>
  )
}
