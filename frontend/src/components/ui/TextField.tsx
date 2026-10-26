import { useId, type ChangeEvent } from 'react'
import { cn } from '@/lib/cn'

type TextFieldProps = {
  id?: string
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
  multiline?: boolean
  maxLength?: number
  className?: string
}

export function TextField({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  error,
  hint,
  required,
  multiline = false,
  maxLength,
  className,
}: TextFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const feedbackId = `${fieldId}-feedback`
  const control = {
    id: fieldId,
    value,
    placeholder,
    required,
    maxLength,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || hint ? feedbackId : undefined,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onValueChange(event.target.value),
    className: cn(
      'w-full border border-glass-rim bg-glass-strong px-4 text-body text-ink shadow-tile outline-none placeholder:text-ink-muted focus:shadow-focus-ring',
      multiline ? 'min-h-28 resize-y rounded-md py-3' : 'h-11 rounded-full',
      error && 'ring-1 ring-danger/50',
    ),
  }
  return (
    <div className={cn('min-w-0', className)}>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-caption text-ink-muted"
      >
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-ink-muted">
            *
          </span>
        )}
      </label>
      {multiline ? (
        <textarea {...control} rows={4} />
      ) : (
        <input {...control} type="text" />
      )}
      {(error || hint) && (
        <p
          id={feedbackId}
          className={cn(
            'mt-1.5 text-caption',
            error ? 'text-danger' : 'text-ink-muted',
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}
