import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  /** Botones al pie (Cancelar y la acción). */
  footer: ReactNode
  children?: ReactNode
  /** Envuelve el contenido en un formulario; Enter confirma. */
  onSubmit?: () => void
}

/**
 * Diálogo modal nativo (`<dialog>`): atrapa el foco, se cierra con Escape y
 * oscurece el fondo con el velo del sistema.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  onSubmit,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const body = (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id={titleId} className="text-[1.25rem] leading-7 font-medium">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-0.5 text-caption text-ink-muted">
              {description}
            </p>
          )}
        </div>
        <IconButton icon={X} label="Cerrar" size="sm" onClick={onClose} />
      </header>
      <div className="flex flex-col gap-4">{children}</div>
      <footer className="flex justify-end gap-2.5 pt-1">{footer}</footer>
    </>
  )

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // Un clic en el velo (fuera del contenido) cierra el diálogo.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-xl border border-glass-rim bg-white p-0 text-ink shadow-[0_40px_80px_-20px_#12172a73] transition-[scale,opacity] duration-200 ease-glass backdrop:bg-ink/40 backdrop:backdrop-blur-sm starting:open:scale-95 starting:open:opacity-0"
    >
      {open &&
        (onSubmit ? (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
            className="flex flex-col gap-5 p-7"
          >
            {body}
          </form>
        ) : (
          <div className="flex flex-col gap-5 p-7">{body}</div>
        ))}
    </dialog>
  )
}
