import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { TextField } from '@/components/ui/TextField'
import { cn } from '@/lib/cn'

export function PasswordField({
  id = 'password',
  label = 'Contraseña',
  value,
  onValueChange,
  error,
  autoComplete = 'current-password',
  hint,
  toggleClassName,
}: {
  id?: string
  label?: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  autoComplete?: string
  hint?: string
  toggleClassName?: string
}) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye
  return (
    <div className="relative">
      <TextField
        id={id}
        label={label}
        type={visible ? 'text' : 'password'}
        value={value}
        onValueChange={onValueChange}
        required
        error={error}
        hint={hint}
        autoComplete={autoComplete}
        maxLength={128}
        inputClassName="pr-14"
      />
      <button
        type="button"
        aria-label={
          visible
            ? `Ocultar ${label.toLowerCase()}`
            : `Mostrar ${label.toLowerCase()}`
        }
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
        className={cn(
          'absolute top-[1.9rem] right-2 grid size-9 cursor-pointer place-items-center rounded-full bg-glass-strong text-ink-muted hover:text-ink',
          toggleClassName,
        )}
      >
        <Icon size={18} strokeWidth={1.6} aria-hidden />
      </button>
    </div>
  )
}
