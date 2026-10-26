import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

type SelectFieldProps = {
  label: string
  value: string
  options: { value: string; label: string }[]
  onValueChange: (value: string) => void
  hideLabel?: boolean
  className?: string
  id?: string
  disabled?: boolean
  error?: string
  required?: boolean
}

export function SelectField({
  label,
  value,
  options,
  onValueChange,
  hideLabel = false,
  className,
  id,
  disabled = false,
  error,
  required = false,
}: SelectFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const labelId = `${fieldId}-label`
  const listId = `${fieldId}-options`
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef({ text: '', time: 0 })
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [position, setPosition] = useState<CSSProperties>({})
  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = options[selectedIndex]

  function measurePosition(): CSSProperties {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return {}
    const gap = 8
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = window.innerHeight
    const below = viewportHeight - rect.bottom - gap * 2
    const above = rect.top - gap * 2
    const desiredHeight = Math.min(384, options.length * 44 + 12)
    const placeBelow = below >= desiredHeight || below >= above
    const width = Math.min(rect.width, viewportWidth - gap * 2)
    return {
      width,
      left: Math.max(gap, Math.min(rect.left, viewportWidth - width - gap)),
      top: placeBelow ? rect.bottom + gap : undefined,
      bottom: placeBelow ? undefined : viewportHeight - rect.top + gap,
      maxHeight: Math.max(0, Math.min(384, placeBelow ? below : above)),
    }
  }

  function openMenu(index = selectedIndex < 0 ? 0 : selectedIndex) {
    if (disabled || options.length === 0) return
    setPosition(measurePosition())
    setActiveIndex(index)
    setOpen(true)
  }

  function choose(index: number) {
    const option = options[index]
    if (!option) return
    onValueChange(option.value)
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!open) return
    function dismiss(event: PointerEvent) {
      const target = event.target
      if (
        target instanceof Node &&
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      )
        setOpen(false)
    }
    function reposition() {
      setPosition(measurePosition())
    }
    document.addEventListener('pointerdown', dismiss)
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  })

  useEffect(() => {
    if (open)
      menuRef.current
        ?.querySelector('[data-active="true"]')
        ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || options.length === 0) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open)
        openMenu(
          selectedIndex < 0 && event.key === 'ArrowUp'
            ? options.length - 1
            : Math.max(0, selectedIndex),
        )
      else
        setActiveIndex(
          (index) =>
            (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) %
            options.length,
        )
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const next = event.key === 'Home' ? 0 : options.length - 1
      if (open) setActiveIndex(next)
      else openMenu(next)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) choose(activeIndex)
      else openMenu()
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    } else if (event.key === 'Tab') {
      setOpen(false)
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault()
      const now = Date.now()
      const text =
        now - searchRef.current.time > 700
          ? event.key
          : searchRef.current.text + event.key
      searchRef.current = { text, time: now }
      const normalizar = (input: string) =>
        input
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase('es-CL')
      const repeated = [...text].every((letter) => letter === text[0])
      const query = normalizar(repeated ? text[0] : text)
      const start = repeated ? (open ? activeIndex : selectedIndex) + 1 : 0
      const index = Array.from(
        { length: options.length },
        (_, offset) => (start + offset + options.length) % options.length,
      ).find((candidate) =>
        normalizar(options[candidate].label).startsWith(query),
      )
      if (index !== undefined) {
        if (open) setActiveIndex(index)
        else openMenu(index)
      }
    }
  }

  return (
    <div className={cn('min-w-0', className)}>
      <label
        id={labelId}
        htmlFor={fieldId}
        className={
          hideLabel ? 'sr-only' : 'mb-1.5 block text-caption text-ink-muted'
        }
      >
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-ink-muted">
            *
          </span>
        )}
      </label>
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        role="combobox"
        aria-labelledby={labelId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        disabled={disabled || options.length === 0}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-full border border-glass-rim bg-glass-strong px-4 text-left text-label text-ink shadow-tile outline-none transition-colors hover:bg-white focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-45',
          open && 'bg-white ring-1 ring-glass-rim',
          error && 'ring-1 ring-danger/50',
        )}
      >
        <span className="truncate">{selected?.label ?? 'Seleccionar'}</span>
        <ChevronDown
          size={15}
          strokeWidth={1.6}
          aria-hidden
          className={cn(
            'shrink-0 text-ink-muted transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-caption text-danger">
          {error}
        </p>
      )}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            style={{
              ...position,
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--color-glass-shade) transparent',
            }}
            className="fixed z-50 overflow-y-auto overscroll-contain rounded-lg border border-glass-rim bg-linear-to-br from-white to-sky-niebla p-1.5 text-ink shadow-lift"
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === value}
                data-active={index === activeIndex}
                onPointerMove={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                className={cn(
                  'flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-label',
                  index === activeIndex &&
                    'bg-glass-strong shadow-tile ring-1 ring-glass-rim',
                  option.value === value && 'font-medium',
                )}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden
                    className="shrink-0 text-brand"
                  />
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )
}
